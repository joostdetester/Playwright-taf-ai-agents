export const bookstoreConfig = {
  /**
   * The sample "Bookstore" flows in this repo are backed by:
   * - Library REST endpoints on rahulshettyacademy.com
   * - A MySQL table called `books` (see steps/bookstore/db)
   */
  api: {
    routes: {
      getBook: '/Library/GetBook.php',
    },
  },

  db: {
    tables: {
      books: 'books',
    },
  },
} as const;

export function bookstoreApiUrl(apiBaseUrl: string, route: keyof typeof bookstoreConfig.api.routes): string {
  const base = (apiBaseUrl ?? '').trim().replace(/\/+$/, '');
  const path = bookstoreConfig.api.routes[route];
  return `${base}${path}`;
}

export default bookstoreConfig;
