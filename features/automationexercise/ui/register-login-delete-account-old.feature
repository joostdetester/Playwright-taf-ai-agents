@all @automationexercise @ui @e2e @login @delete-account
Feature: AutomationExercise login user and delete account

  Scenario: user logs in and deletes their account
    Given the user is on the AutomationExercise home page
    When the user opens the signup or login page
    Then the login form should be visible

    When the user logs in with valid credentials
    Then the user should be logged in as the created user

    When the user deletes the account
    Then the account deleted message should be visible
