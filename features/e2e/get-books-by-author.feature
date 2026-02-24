@e2e @db @api @critical
Feature: Get books by author (end-to-end)
  In order to ensure the API and database remain consistent
  As a QA engineer
  I want the Library API to return the same books as stored in the database for a given author

  Scenario Outline: API returns the same books as the database
    Given the database contains books by "<author>"
    When I request books by "<author>" from the API
    Then the API response status should be 200
    And the API response should match the database records

    Examples:
      | author        |
      | Rahul Shetty  |
      | John Doe      |
