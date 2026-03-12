@all @automationexercise @ui @e2e @login
Feature: AutomationExercise login

  Scenario: user logs in with an existing (persisted) account
    Given the user is on the AutomationExercise home page
    When the user opens the signup or login page
    Then the login form should be visible

    When the user logs in with valid credentials
    Then the user should be logged in as the created user

  @negative
  Scenario: user cannot log in with incorrect email and password
    Given the user is on the AutomationExercise home page
    When the user opens the signup or login page
    Then the login form should be visible

    When the user attempts to log in with incorrect credentials
    Then the login error message should be visible
