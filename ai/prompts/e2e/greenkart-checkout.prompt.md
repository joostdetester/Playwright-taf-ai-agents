````prompt
---
name: greenkart-checkout
description: Generate a UI checkout happy-flow test suite for GreenKart from a screen recording.
---

```prompt
# UI Test: GreenKart checkout (happy flow)

Context:
We have a web application tested using:
- Playwright
- BDD (Gherkin)
- Page Object Model

Video input:
- Screen recording: videos/Green kart 2026-02-25 085336.mp4

Goal:
Generate a complete UI test implementation for a GreenKart checkout happy flow, including:
1. A BDD feature file
2. Step definitions (thin, reusable)
3. Page Objects (locators and UI actions)

Flow description (business steps; do not write raw click steps):
1. User opens the GreenKart products page.
2. User adds multiple items to the cart and adjusts quantities:
	 - Beetroot (1 kg) quantity: 3
	 - Brinjal (1 kg) quantity: 1
	 - Pumpkin (1 kg) quantity: 1
3. User opens the cart.
4. Cart shows the selected items and the expected totals:
	 - number of items: 3
	 - total amount: 179
5. User places the order.
6. User selects country "Netherlands".
7. User agrees to the terms and conditions.
8. User proceeds to complete checkout.
9. A success message is shown confirming the order was placed.

Pages involved:
- Products page (catalog/grid of vegetables)
- Cart page (cart table + totals + place order)
- Country/checkout page (country dropdown + terms checkbox + proceed)
- Order confirmation page (success message)

Optional selectors (placeholders only; do NOT infer real selectors from the video):
Propose data-test-id attributes that the app *should* have, and use those in Page Objects as placeholders.
Examples (adjust as needed):
- Products page:
	- data-test-id=products-search
	- data-test-id=product-card
	- data-test-id=product-name
	- data-test-id=product-quantity-increment
	- data-test-id=product-add-to-cart
	- data-test-id=header-cart-icon
- Cart page:
	- data-test-id=cart-table
	- data-test-id=cart-row
	- data-test-id=cart-total-amount
	- data-test-id=cart-items-count
	- data-test-id=place-order
- Country/checkout page:
	- data-test-id=country-select
	- data-test-id=terms-checkbox
	- data-test-id=proceed
- Confirmation page:
	- data-test-id=order-success-message

Constraints:
- Follow ai/ai-instructions.md
- Follow ai/playwright-bdd-style.md
- Use Page Object Model
- No locators inside step definitions
- No hard waits/sleeps
- No Cypress
- No hardcoded secrets/credentials
- Steps must be reusable and business-oriented
- Use projectConfig.ui.baseUrl (BASE_URL via config/project.config.ts)
- Do not guess any real CSS/XPath selectors from the video

Output file locations:
- features/ui/green-kart-checkout.feature
- steps/ui/green-kart-checkout.steps.ts
- ui/pages/green-kart-products.page.ts
- ui/pages/green-kart-cart.page.ts
- ui/pages/green-kart-checkout.page.ts
- ui/pages/green-kart-confirmation.page.ts

Notes:
- The feature should use meaningful tags, e.g. @ui @checkout @green-kart.
- Assertions belong in steps (or dedicated assertion helpers), not in Page Objects.
```

````
