/**
 * Template/placeholder for `library`-specific step implementations.
 *
 * NOTE: The repository already contains generic API and DB steps in
 * `steps/api/api.steps.ts` and `steps/db/db.steps.ts` which implement the
 * phrases used in the feature above (Given the database contains..., When I
 * request books by..., Then the API response should match...).
 *
 * This file is a suggested place to add library-specific helpers or to
 * implement alternate step definitions if you prefer more targeted names.
 *
 * If you add active step registrations here, ensure they do not duplicate
 * existing step phrases to avoid conflicts.
 */

// Example helper exported for reuse by step definitions:
export function compareBooksByKey(apiBooks: any[], dbBooks: any[], key = 'isbn') {
  const apiMap = new Map(apiBooks.map((b: any) => [b[key], b]));
  const dbMap = new Map(dbBooks.map((b: any) => [b[key], b]));

  const missingInApi: any[] = [];
  const mismatched: any[] = [];

  for (const [k, dbBook] of dbMap.entries()) {
    const apiBook = apiMap.get(k);
    if (!apiBook) missingInApi.push(dbBook);
    else if (JSON.stringify(apiBook) !== JSON.stringify(dbBook)) mismatched.push({ db: dbBook, api: apiBook });
  }

  return { missingInApi, mismatched };
}

export default {};
