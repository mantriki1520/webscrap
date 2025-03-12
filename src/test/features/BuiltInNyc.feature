Feature: I want to scrap all the job data from the jobi website

  Background:
   
    Given I launch an builtInNyc application

  @regression @builtInNyc @smoke @positivescenario @checkbox
  Scenario Outline: User able to scrap the data from builtInNyc successfullly
    Given I am on builtInNyc login page
    And I extract all the builtInNyc jobs in a json file
    # And I push all the builtInNyc jobs onto the database
   
    Examples:
      | UserName | Password   |
      | asci | Kagu917071 |
