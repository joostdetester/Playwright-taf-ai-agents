Feature: Dummy API feature

  Scenario: Get books from library API
    Given the Library API is available
    When I request all books from the library API
    Then the response status should be 200