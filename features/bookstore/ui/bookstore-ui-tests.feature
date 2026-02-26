@ui @smoke @st
Feature: Dummy UI feature

  
  Scenario: Open home page
    Given I open the application
    Then I see the homepage title

  Scenario: Open parameterized path
    When I open the path "/client/#/auth/login"
    Then the current URL contains "/"

