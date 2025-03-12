Feature: As an admin User
i want to login to website using valid credentials
so that i can validate i have logged in successfully

  Background:
   
    Given I launch an application

  @regression @ycombinator @smoke @positivescenario @checkbox
  Scenario Outline: login with valid credentials
    Given I am on login page
    When I enter "Vikas6206" value in the input field using "id" attribute with value "ycid-input"
    When I enter "Qazwsx@123" value in the input field using "id" attribute with value "password-input"
    And I click on WebButton using "text" attribute with value "Log in"
    And I validate "Y Combinator" WebImage Text is displayed
    And I extract all the jobs in a json file
    And I push all the jobs onto the database
   
    Examples:
      | UserName | Password   |
      | asci | Kagu917071 |
