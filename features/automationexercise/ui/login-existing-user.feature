@all @automationexercise @ui @e2e @login
Feature: AutomationExercise login with existing user

  Scenario: user logs in with a persisted account
    Given the user is on the AutomationExercise home page
    When the user opens the signup or login page
    Then the login form should be visible

    When the user logs in with valid credentials
    Then the user should be logged in as the created user
