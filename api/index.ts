import type { IncomingMessage, ServerResponse } from 'http';
import { fetchLetterboxdFilms } from '../src/letterboxd.js';
import { renderSvgCard, renderErrorCard } from '../src/render.js';
import { CardOptions } from '../src/types.js';

interface RequestWithQuery extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

export default async function handler(req: RequestWithQuery, res: ServerResponse) {
  let query: Record<string, string> = {};
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      query[key] = Array.isArray(value) ? value[0] : value;
    }
  } else if (req.url) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    url.searchParams.forEach((val, key) => {
      query[key] = val;
    });
  }

  const username = query.username?.trim();
  const rawCount = parseInt(query.count || '4', 10);
  const count = isNaN(rawCount) ? 4 : Math.min(Math.max(rawCount, 1), 6);
  const theme = query.theme || 'letterboxd';
  const hideBorder = query.hide_border === 'true';
  const showDate = query.show_date !== 'false';
  const width = query.width ? parseInt(query.width, 10) : undefined;

  const cardOptions: CardOptions = {
    username: username || '',
    count,
    theme,
    hideBorder,
    showDate,
    width,
  };

  if (!username) {
    const errorSvg = renderErrorCard(
      'Missing "username" query parameter.',
      cardOptions
    );
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.statusCode = 200;
    return res.end(errorSvg);
  }

  try {
    const films = await fetchLetterboxdFilms(username, count);

    if (films.length === 0) {
      const errorSvg = renderErrorCard(
        `No recent diary entries found for "${username}".`,
        cardOptions
      );
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.statusCode = 200;
      return res.end(errorSvg);
    }

    const svg = renderSvgCard(films, cardOptions);

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400'
    );
    res.statusCode = 200;
    return res.end(svg);
  } catch (error: any) {
    const message = error?.message || 'Failed to generate Letterboxd stats card.';
    const errorSvg = renderErrorCard(message, cardOptions);

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.statusCode = 200;
    return res.end(errorSvg);
  }
}
