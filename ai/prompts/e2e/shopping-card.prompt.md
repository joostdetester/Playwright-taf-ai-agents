---
title: Shopping cart checkout (from video)
description: Generate Playwright-BDD feature/steps/page objects for the shopping cart + checkout happy flow captured in specs/letsshop/videos/shopping-card.mp4
owner: team-qa
tags: [prompt, ui, video, playwright, bdd, e2e, cart, checkout]
---

# UI test generation prompt — Shopping cart

## Context
We test a web application using:
- Playwright
- BDD (Gherkin)
- Page Object Model
- TypeScript

Input video:
- `specs/letsshop/videos/shopping-card.mp4`

The application shown in the video is a demo e-commerce site (Rahul Shetty Academy automation practice). The flow starts from a login screen, proceeds to a product listing/dashboard, then the cart, checkout, and an order confirmation page.

## Goal
Generate the following artifacts for this flow:
1. A BDD feature file (Gherkin) in English
2. Step definitions in TypeScript (thin steps)
3. Page Objects (POM) for each screen involved

## Observed happy flow (business steps)
Use the video only to understand the journey. Do not infer CSS/XPath selectors from the video.

### Business flow narrative
1. The user logs in with a valid account.
2. The user opens the product catalog (dashboard).
3. The user adds the product "ADIDAS ORIGINAL" to the cart.
4. The user adds the product "ZARA COAT 3" to the cart.
5. The user opens the cart and verifies both products are present.
6. The user proceeds to checkout.
7. The user pays using "Credit Card" and enters valid-looking test payment details.
8. The user selects a shipping country.
9. The user places the order.
10. The user sees a confirmation page ("THANKYOU FOR THE ORDER.") and can download order details as CSV.

### Concrete data shown in the video (use as examples/placeholders)
- Products:
  - "ADIDAS ORIGINAL"
  - "ZARA COAT 3"
- Quantity on confirmation appears as `Qty: 1` per product.
- Payment method tab "Credit Card" is selected on checkout.

For credentials and any personal fields:
- DO NOT hardcode real credentials.
- Use environment/config-driven test data (e.g. `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`).

## Pages / screens involved
Model these as separate Page Objects (one per screen):
- Login page (`/client/auth/login`)
- Product dashboard / catalog (`/client/dashboard/dash`)
- Cart page (`/client/dashboard/cart`)
- Checkout page (order placement form; URL contains `/client/dashboard/order` with dynamic params)
- Order confirmation / thank you page (URL contains `/client/dashboard/thanks` with dynamic params)

## Gherkin requirements
- All steps MUST be written in English.
- Steps must be specific and explicit (use concrete product names and clear placeholders).
- Avoid UI-mechanics phrasing such as "click" or "type"; describe business intent.
- Use Given / When / Then.
- Words should be lowercase in step text; variables/values inside quotes can have uppercase.

### Proposed feature structure
Create a feature with a single happy-path scenario, for example:
- Feature: shopping cart checkout
- Scenario: user places an order for two products

Suggested step wording (example; refine if needed):
- Given the user is logged in as a valid customer
- When the user adds the product "ADIDAS ORIGINAL" to the cart
- And the user adds the product "ZARA COAT 3" to the cart
- And the user opens the cart
- Then the cart should contain the products:
  - "ADIDAS ORIGINAL"
  - "ZARA COAT 3"
- When the user proceeds to checkout
- And the user selects "credit card" as payment method
- And the user enters credit card payment details:
  - card number "4542 9931 9292 2293"
  - expiry month "01"
  - expiry year "16"
  - cvv "123"
  - name on card "test user"
- And the user selects shipping country "Netherlands"
- And the user places the order
- Then the order confirmation page should show "thankyou for the order"
- And the order summary should list the products:
  - "ADIDAS ORIGINAL"
  - "ZARA COAT 3"

Notes:
- If the app’s country selector requires choosing from an autosuggest list, model that as a business step ("selects shipping country") and implement the mechanics inside the Checkout Page Object.
- Do not assert on internal IDs, order IDs, or dynamic query params.

## Selector strategy (placeholders only)
Prefer `data-test-id` (or similar) selectors. If the app does not have them, propose adding them. Do NOT guess actual selectors from the video.

Proposed `data-test-id` placeholders (examples):
- Login page:
  - `login-email`, `login-password`, `login-submit`
- Dashboard/catalog:
  - `product-card`, `product-title`, `product-add-to-cart`
  - `header-cart-link`, `header-cart-count`
- Cart:
  - `cart-item`, `cart-item-title`, `cart-checkout`
- Checkout:
  - `payment-method-credit-card`
  - `card-number`, `card-expiry-month`, `card-expiry-year`, `card-cvv`, `card-name`
  - `shipping-country-input`, `shipping-country-option`
  - `place-order`
- Confirmation:
  - `order-confirmation-title`, `order-item-title`, `download-order-csv`

If `data-test-id` is not available, prefer Playwright role-based locators (e.g. `getByRole('button', { name: 'Checkout' })`) scoped within a page object.

## Constraints (must follow)
- Follow `ai/ai-instructions.md`, `ai/playwright-bdd-style.md`, and `ai/testing-guidelines.md`.
- Use Playwright + playwright-bdd conventions used in this repo.
- Use TypeScript + async/await.
- Use Page Object Model.
- Keep step definitions thin (no locators in step files).
- No hard waits (`waitForTimeout`).
- No Cypress.
- No hardcoded secrets.
- No assertions inside Page Objects; assert in steps or helper assertions.

## Output locations (repo conventions)
Generate files to these locations (create folders if needed):
- Feature file:
  - `features/e2e/shopping-cart-checkout.feature`
- Step definitions:
  - `steps/e2e/shopping-cart-checkout.steps.ts`
- Page Objects:
  - `pageobjects/letsshop/login.page.ts`
  - `pageobjects/letsshop/dashboard.page.ts`
  - `pageobjects/letsshop/cart.page.ts`
  - `pageobjects/letsshop/checkout.page.ts`
  - `pageobjects/letsshop/order-confirmation.page.ts`

## Implementation notes for the code generator
- Use a shared `bdd.ts` import for Given/When/Then (never import directly from `@cucumber/cucumber`).
- Make the scenario independently runnable.
- Keep product selection deterministic by using the product name text ("ADIDAS ORIGINAL", "ZARA COAT 3") inside the dashboard page object logic.
- Prefer stable assertions:
  - cart contains the two product names
  - confirmation includes "THANKYOU FOR THE ORDER." (case-insensitive match is OK)
  - confirmation lists the same products
