

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  content: string | ArrayBuffer; // string for text content or URL for publisher epubs, ArrayBuffer for user epubs
  isUserBook?: boolean;
  price?: string;
  isEpub?: boolean;
}

export enum ReaderTheme {
  Light = 'light',
  Sepia = 'sepia',
  Dark = 'dark',
}

export interface Announcement {
  id:string;
  type: 'popup' | 'notification';
  title: string;
  message: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string; // For this simulation, this can be a book ID or a special identifier
  requiresPush?: boolean;
}

export interface Gift {
  id: string;
  bookId: string;
  recipientEmail: string;
  message: string;
  date: string;
}

export type PaymentMethod = 'card' | 'points' | 'fonepay';
