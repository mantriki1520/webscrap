Feature: I want to scrap all the job data from the jobi website

  Background:
   
    Given I launch an startup application

  @regression @startupJobs @smoke @positivescenario @checkbox
  Scenario Outline: User able to scrap the data from starupjobs successfullly
    Given I am on startup login page
    And I extract all the startup jobs in a json file
    And I push all the startup jobs onto the database
   
    Examples:
      | UserName | Password   |
      | asci | Kagu917071 |
