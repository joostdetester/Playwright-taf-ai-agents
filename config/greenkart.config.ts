export const greenkartConfig = {
  /**
   * GreenKart lives under this hash-based app path on rahulshettyacademy.com.
   * Keep routes centralized so page objects don't need to guess URLs.
   */
  routes: {
    products: '/seleniumPractise/#/',
    cart: '/seleniumPractise/#/cart',
    country: '/seleniumPractise/#/country',
  },

  expected: {
    orderPlacedMessage: /order has been placed successfully/i,
  },
} as const;

export function greenkartUrl(baseUrl: string, path: keyof typeof greenkartConfig.routes): string {
  const base = baseUrl.trim().replace(/\/$/, '');
  const route = greenkartConfig.routes[path];
  return `${base}${route}`;
}

export default greenkartConfig;
