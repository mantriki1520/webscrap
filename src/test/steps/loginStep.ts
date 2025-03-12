import { Given, When, Then, context, setDefaultTimeout, DataTable } from '@cucumber/cucumber';
import { LoginPage } from '../Pages/loginPage';
import { Browser, Locator, Page, chromium } from '@playwright/test';
import { pageFixture } from '../../hooks/pageFixture';
import { DBConfig } from '../../../src/helper/database/Database';


import BasePage from '../Pages/basePage';

setDefaultTimeout(60 * 1000 * 2);
let browser: Browser;
let loginPage: LoginPage;
let page:Page;
let element:Locator;




Given(/^I am (a|an) (admin|educator|learner) user$/, async (article: string, userType: string) => {

  console.log(userType);

})



When('I login with below user id and password', async (dt: DataTable) => {

  console.log(dt.hashes().keys);

  loginPage = new LoginPage(pageFixture.page);
  // await loginPage.fillField(loginPage.userId,'qa_admin_2@venturebacked.co');
  // await loginPage.fillField(loginPage.password,'Kagu917071');

  await loginPage.fillField(loginPage.userId, String(dt.hashes()[0]['userid']));
  await loginPage.fillField(loginPage.password, String(dt.hashes()[0]['password']));

}
);

When('I am on login page',async()=>{

  loginPage=new LoginPage(pageFixture.page);
  await loginPage.elementIsDisplayed(loginPage.userId);


})

Then('I extract all the jobs in a json file',{timeout:1800000},async()=>{
  console.log("****** I extract all the jobs in a json file ******");
  loginPage=new LoginPage(pageFixture.page);
  await loginPage.getAllJobs();
})

Then('I push all the jobs onto the database',{timeout:1800000},async()=>{
  console.log("****** I push all the jobs onto the database ******");
  loginPage=new LoginPage(pageFixture.page);
  // const dbConfig: DBConfig = {
  //     host: process.env.DB_HOST,
  //     user: process.env.DB_USER,
  //     password: process.env.DB_PASSWORD,
  //     database: process.env.DB_DATABASE
  // };

  await loginPage.pushJobToDB();
})
