import { XMLParser } from 'fast-xml-parser';
import { LetterboxdFilm } from './types.js';

export function ratingToStars(rating: number | undefined | null): string {
  if (rating === undefined || rating === null || isNaN(rating)) return '';
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? '½' : '';
  return '★'.repeat(fullStars) + halfStar;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LetterboxdCard/1.0)',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function fetchLetterboxdFilms(
  username: string,
  count: number = 4
): Promise<LetterboxdFilm[]> {
  const cleanUser = username.trim().toLowerCase();
  const feedUrl = `https://letterboxd.com/${encodeURIComponent(cleanUser)}/rss/`;

  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LetterboxdGitHubCard/1.0',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Letterboxd user "${username}" not found.`);
    }
    throw new Error(`Failed to fetch Letterboxd RSS: HTTP ${response.status}`);
  }

  const xmlText = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: false,
  });

  const parsed = parser.parse(xmlText);
  const channel = parsed?.rss?.channel;
  if (!channel) {
    throw new Error('Invalid RSS feed structure received from Letterboxd.');
  }

  const rawItems = channel.item;
  if (!rawItems) {
    return [];
  }

  const itemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];
  const films: LetterboxdFilm[] = [];

  for (const item of itemsArray) {
    const filmTitle =
      item['letterboxd:filmTitle'] ||
      item['filmTitle'] ||
      (typeof item.title === 'string' ? item.title.split(',')[0] : '');

    if (!filmTitle) continue;

    const filmYear = item['letterboxd:filmYear'] || item['filmYear'] || '';
    const memberRatingRaw =
      item['letterboxd:memberRating'] ?? item['memberRating'];
    const numericRating =
      memberRatingRaw !== undefined ? parseFloat(memberRatingRaw) : null;
    const watchedDate =
      item['letterboxd:watchedDate'] ||
      item['watchedDate'] ||
      (item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : '');

    let posterUrl: string | null = null;
    const desc = item.description || '';
    if (typeof desc === 'string') {
      const match = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        posterUrl = match[1];
      }
    }

    films.push({
      title: String(filmTitle).trim(),
      year: filmYear ? String(filmYear) : undefined,
      rating: numericRating,
      stars: ratingToStars(numericRating),
      watchedDate: formatDate(watchedDate),
      posterUrl,
      link: item.link || `https://letterboxd.com/${cleanUser}/`,
    });

    if (films.length >= count) {
      break;
    }
  }

  await Promise.all(
    films.map(async (film) => {
      if (film.posterUrl) {
        film.posterBase64 = await fetchImageAsBase64(film.posterUrl);
      }
    })
  );

  return films;
}
