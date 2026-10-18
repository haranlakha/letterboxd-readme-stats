import { CardOptions, LetterboxdFilm } from './types.js';
import { getTheme } from './themes.js';

export function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

export function renderSvgCard(
  films: LetterboxdFilm[],
  options: CardOptions
): string {
  const theme = getTheme(options.theme);
  const count = Math.min(Math.max(films.length, 1), 6);
  
  const cardPadding = 20;
  const headerHeight = 40;
  const posterWidth = 92;
  const posterHeight = 138;
  const itemGap = 16;
  
  const contentWidth = count * posterWidth + (count - 1) * itemGap;
  const totalWidth = Math.max(options.width || 495, contentWidth + cardPadding * 2);
  const totalHeight = 245;

  const startX = cardPadding + Math.max(0, (totalWidth - cardPadding * 2 - contentWidth) / 2);

  const borderAttr = options.hideBorder
    ? 'stroke="none"'
    : `stroke="${theme.border}" stroke-width="1"`;

  const filmsSvg = films
    .map((film, index) => {
      const x = startX + index * (posterWidth + itemGap);
      const posterY = cardPadding + headerHeight + 5;
      const titleY = posterY + posterHeight + 16;
      const metaY = titleY + 14;

      const safeTitle = escapeXml(truncate(film.title, 14));
      const safeYear = film.year ? ` (${film.year})` : '';
      const safeStars = film.stars ? escapeXml(film.stars) : '';
      const safeDate = film.watchedDate && options.showDate ? escapeXml(film.watchedDate) : '';

      const posterContent = film.posterBase64
        ? `<image
            x="${x}"
            y="${posterY}"
            width="${posterWidth}"
            height="${posterHeight}"
            href="${film.posterBase64}"
            preserveAspectRatio="xMidYMid slice"
            clip-path="url(#poster-clip-${index})"
          />`
        : `<rect
            x="${x}"
            y="${posterY}"
            width="${posterWidth}"
            height="${posterHeight}"
            rx="6"
            fill="${theme.cardBg}"
            stroke="${theme.border}"
            stroke-width="1"
          />
          <text
            x="${x + posterWidth / 2}"
            y="${posterY + posterHeight / 2}"
            fill="${theme.subtext}"
            font-size="11"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            text-anchor="middle"
            alignment-baseline="middle"
          >No Poster</text>`;

      return `
        <!-- Film #${index + 1}: ${escapeXml(film.title)} -->
        <g class="film-item">
          <clipPath id="poster-clip-${index}">
            <rect x="${x}" y="${posterY}" width="${posterWidth}" height="${posterHeight}" rx="6" ry="6" />
          </clipPath>
          ${posterContent}
          <rect
            x="${x}"
            y="${posterY}"
            width="${posterWidth}"
            height="${posterHeight}"
            rx="6"
            ry="6"
            fill="none"
            stroke="${theme.border}"
            stroke-width="1"
            opacity="0.7"
          />

          <text
            x="${x + posterWidth / 2}"
            y="${titleY}"
            fill="${theme.title}"
            font-size="11"
            font-weight="600"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            text-anchor="middle"
          >${safeTitle}</text>

          <text
            x="${x + posterWidth / 2}"
            y="${metaY}"
            fill="${theme.star}"
            font-size="11"
            font-weight="bold"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            text-anchor="middle"
          >${safeStars || (safeDate ? safeDate : safeYear)}</text>
        </g>
      `;
    })
    .join('\n');

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${totalWidth}"
  height="${totalHeight}"
  viewBox="0 0 ${totalWidth} ${totalHeight}"
  role="img"
  aria-label="${escapeXml(options.username)}'s Recently Watched Films"
>
  <style>
    .header-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 700;
      fill: ${theme.title};
    }
    .badge-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      fill: ${theme.badgeText};
    }
    .dot-orange { fill: #ff8000; }
    .dot-green { fill: #00e054; }
    .dot-blue { fill: #40bcf4; }
  </style>

  <rect
    x="0.5"
    y="0.5"
    width="${totalWidth - 1}"
    height="${totalHeight - 1}"
    rx="8"
    fill="${theme.bg}"
    ${borderAttr}
  />

  <g transform="translate(${cardPadding}, ${cardPadding + 14})">
    <circle cx="6" cy="0" r="5" class="dot-orange" />
    <circle cx="18" cy="0" r="5" class="dot-green" />
    <circle cx="30" cy="0" r="5" class="dot-blue" />

    <text x="44" y="4" class="header-text">${escapeXml(options.username)}&apos;s Recent Watches</text>

    <rect
      x="${totalWidth - cardPadding * 2 - 90}"
      y="-10"
      width="90"
      height="20"
      rx="10"
      fill="${theme.badgeBg}"
    />
    <text
      x="${totalWidth - cardPadding * 2 - 45}"
      y="4"
      class="badge-text"
      text-anchor="middle"
    >LETTERBOXD</text>
  </g>

  ${filmsSvg}
</svg>`;
}

export function renderErrorCard(
  message: string,
  options: Partial<CardOptions> = {}
): string {
  const theme = getTheme(options.theme || 'letterboxd');
  const width = options.width || 495;
  const height = 150;
  const safeMessage = escapeXml(message);

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  role="img"
  aria-label="Error: ${safeMessage}"
>
  <rect
    x="0.5"
    y="0.5"
    width="${width - 1}"
    height="${height - 1}"
    rx="8"
    fill="${theme.bg}"
    stroke="#f85149"
    stroke-width="1"
  />
  <g transform="translate(25, 30)">
    <circle cx="12" cy="12" r="12" fill="#f85149" opacity="0.2"/>
    <text x="12" y="16" fill="#f85149" font-size="14" font-weight="bold" text-anchor="middle">!</text>
    <text
      x="36"
      y="16"
      fill="${theme.title}"
      font-size="14"
      font-weight="bold"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >Letterboxd Card Error</text>
    <text
      x="36"
      y="42"
      fill="${theme.text}"
      font-size="12"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >${safeMessage}</text>
    <text
      x="36"
      y="64"
      fill="${theme.subtext}"
      font-size="11"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >Usage: /api?username=your_letterboxd_username</text>
  </g>
</svg>`;
}
