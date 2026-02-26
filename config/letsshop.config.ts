export const letsshopConfig = {
  /**
   * Rahul Shetty Academy client app uses hash-based routing.
   * Centralize common routes so page objects and steps don't hard-code paths.
   */
  routes: {
    login: '/client/#/auth/login',
    dashboard: '/client/#/dashboard/dash',
    cart: '/client/#/dashboard/cart',

    // Practice page is a separate path on the same host.
    practice: '/AutomationPractice/',
  },

  expected: {
    thankYouMessage: /thankyou\s+for\s+the\s+order/i,
  },
} as const;

export function letsshopUrl(baseUrl: string, path: keyof typeof letsshopConfig.routes): string {
  const base = (baseUrl ?? '').trim().replace(/\/+$/, '');
  const route = letsshopConfig.routes[path];
  return `${base}${route}`;
}

export default letsshopConfig;
