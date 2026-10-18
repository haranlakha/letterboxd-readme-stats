export interface LetterboxdFilm {
  title: string;
  year?: string;
  rating?: number | null;
  stars?: string;
  watchedDate?: string;
  posterUrl?: string | null;
  posterBase64?: string | null;
  link: string;
  review?: string | null;
}

export interface CardTheme {
  bg: string;
  border: string;
  title: string;
  text: string;
  subtext: string;
  star: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
}

export interface CardOptions {
  username: string;
  count: number;
  theme: string;
  hideBorder: boolean;
  showDate: boolean;
  width?: number;
}
