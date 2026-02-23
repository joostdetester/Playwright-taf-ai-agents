Feature: Dummy feature - Database and API consistency

  Scenario: API returns the same books as the database
    Given the database contains books by "Rahul Shetty"
    When I request books by "Rahul Shetty" from the API
    Then the API response should match the database records