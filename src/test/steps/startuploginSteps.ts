import { Given, When, Then, context, setDefaultTimeout, DataTable } from '@cucumber/cucumber';
import { StartupLoginPage } from '../Pages/startuploginPage';
import { Browser, Locator, Page, chromium } from '@playwright/test';
import { pageFixture } from '../../hooks/pageFixture';


import BasePage from '../Pages/basePage';

setDefaultTimeout(60 * 1000 * 2);
let browser: Browser;
let startuploginPage: StartupLoginPage;
let page:Page;
let element:Locator;




Given(/^I am (a|an) (admin|educator|learner) user$/, async (article: string, userType: string) => {

  console.log(userType);

})



When('I am on startup login page',async()=>{

  startuploginPage=new StartupLoginPage(pageFixture.page);
  await startuploginPage.elementIsDisplayed(startuploginPage.startupMsg);


})

Then('I extract all the startup jobs in a json file',{timeout:1800000},async()=>{
  console.log("****** I extract all the startup jobs in a json file ******");
  startuploginPage=new StartupLoginPage(pageFixture.page);
  await startuploginPage.getAllJobs();
})

Then('I push all the startup jobs onto the database',{timeout:1800000},async()=>{
  console.log("****** I push all the jobs onto the database ******");
  startuploginPage=new StartupLoginPage(pageFixture.page);
  await startuploginPage.pushJobToDB();
})
