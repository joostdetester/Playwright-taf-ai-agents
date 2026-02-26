@all @petstore @e2e @api @critical
Feature: Petstore end-to-end tests

  Scenario: Add Pet and Get Pet by id
    Given I add a pet named "Rex"
    When I get the pet by id
    Then the pet name should be "Rex"

  Scenario: Add Pet and Update Pet then Get Pet by id
    Given I add a pet named "Bella"
    When I update the pet status to "sold"
    When I get the pet by id
    Then the pet status should be "sold"

  Scenario: Add Pet, Get Pet, Delete Pet and confirm not found
    Given I add a pet named "Max"
    When I get the pet by id
    Then the pet name should be "Max"
    When I delete the pet by id
    Then the pet should not be found by id
