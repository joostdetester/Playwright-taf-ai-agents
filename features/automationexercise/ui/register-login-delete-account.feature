@all @automationexercise @ui @e2e @register
Feature: AutomationExercise register user, logs in, and deletes account

  Scenario: user registers a new account and deletes it
    Given the user is on the AutomationExercise home page
    When the user opens the signup or login page
    Then the new user signup section should be visible

    When the user signs up with a generated name and a unique email
    Then the enter account information page should be visible

    When the user completes account registration with a generated password
    And the user opts into newsletters and partner offers
    And the user creates the account
    Then the account created message should be visible

    When the user continues after account creation
    Then the user should be logged in as the created user

    When the user deletes the account
    Then the account deleted message should be visible
    When the user continues after account deletion
