import { Given, When, Then, context, setDefaultTimeout, DataTable } from '@cucumber/cucumber';
import { StartupLoginPage } from '../Pages/startuploginPage';
import { Browser, Locator, Page, chromium } from '@playwright/test';
import { pageFixture } from '../../hooks/pageFixture';
import { BuiltNycLoginPage } from '../Pages/builtNycloginPage';


setDefaultTimeout(60 * 1000 * 2);
// let browser: Browser;
let builtNycloginPage: BuiltNycLoginPage;
// let page:Page;
// let element:Locator;


When('I am on builtInNyc login page',async()=>{

  builtNycloginPage=new BuiltNycLoginPage(pageFixture.page);
  await builtNycloginPage.elementIsDisplayed(builtNycloginPage.employerButton);


})

Then('I extract all the builtInNyc jobs in a json file',{timeout:1800000},async()=>{
  console.log("****** I extract all the startup jobs in a json file ******");
  builtNycloginPage=new BuiltNycLoginPage(pageFixture.page);
  await builtNycloginPage.getAllJobs();
})

Then('I push all the builtInNyc jobs onto the database',{timeout:1800000},async()=>{
  console.log("****** I push all the jobs onto the database ******");
  builtNycloginPage=new BuiltNycLoginPage(pageFixture.page);
  await builtNycloginPage.pushJobToDB();
})
