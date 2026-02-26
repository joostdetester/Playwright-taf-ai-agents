@all @letsshop @e2e @ui @checkout @shopping-cart
Feature: shopping cart end-to-end tests

  Scenario: user places an order for two products
    Given the user is logged in as a valid customer
    When the user adds product "ADIDAS ORIGINAL" to the cart
    And the user adds product "ZARA COAT 3" to the cart
    And the user opens the shopping cart
    Then the shopping cart should contain the following products:
      | product         |
      | ADIDAS ORIGINAL |
      | ZARA COAT 3     |
    When the user proceeds to the shopping checkout
    And the user selects payment method "credit card"
    And the user enters credit card payment details:
      | field        | value               |
      | card number  | 4542 9931 9292 2293 |
      | expiry month | 01                  |
      | expiry year  | 16                  |
      | cvv          | 123                 |
      | name on card | test user           |
    And the user selects shipping country "India"
    And the user places the shopping order
    Then the shopping order confirmation page should show "thankyou for the order"
    And the shopping order summary should list the following products:
      | product         |
      | ADIDAS ORIGINAL |
      | ZARA COAT 3     |
