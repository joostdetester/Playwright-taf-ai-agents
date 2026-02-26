@all @bookstore @db @st
Feature: Dummy DB feature

  Scenario: Seed and read books from database
    Given the database is available
    When I seed the books table with test data
    Then I can read the books from the database
