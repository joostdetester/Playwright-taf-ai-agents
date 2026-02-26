@e2e @ui @practice
Feature: Practice page end-to-end tests

  Scenario: user completes the practice page flow
    Given the user is on the practice page
    When the user enters practice name "Joost"
    And the user selects practice radio option "Radio2"
    And the user selects practice checkboxes:
      | option  |
      | Option1 |
      | Option3 |
    And the user selects practice dropdown option "Option2"
    And the user selects practice country "India"
    And the user opens the practice related page in a new tab
    Then the practice related page should be displayed
    When the user returns to the practice page
    And the user triggers a practice alert with name "Joost" and accepts it
    Then the practice alert message should contain "Joost"
    And the practice web table should contain "Selenium Webdriver with Java"
    And the practice iframe should show link "Mentorship"
