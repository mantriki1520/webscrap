import { BrowserContext, expect, Expect } from "@playwright/test";
import { Browser, Page, Locator, chromium } from '@playwright/test';
import { pageFixture } from '../../hooks/pageFixture';
import { Given, When, Then, setDefaultTimeout, DataTable } from "@cucumber/cucumber";
import BasePage from "../Pages/basePage";
import { text } from "stream/consumers";


setDefaultTimeout(60 * 1000 * 2);

let element: Locator;
let page: Page;
let basePage = BasePage;
let newTab: Page;


Given('I launch an application', async function () {
  const basePage = new BasePage(pageFixture.page);
  // const envUrl=JSON.parse(JSON.stringify(require('src\\test\\testdata\\VentureBacked.env')));
  //  loginPage=await new LoginPage(pageFixture.page);
  //await loginPage.navigateTo("https://qavbc.venturebacked.co/");
  await basePage.navigateTo(process.env.BASEURL);
});

Given('I launch an startup application', async function () {
  const basePage = new BasePage(pageFixture.page);
  // const envUrl=JSON.parse(JSON.stringify(require('src\\test\\testdata\\VentureBacked.env')));
  //  loginPage=await new LoginPage(pageFixture.page);
  //await loginPage.navigateTo("https://qavbc.venturebacked.co/");
  await basePage.navigateTo(process.env.JOBIURL);
});

Given('I launch an builtInNyc application', async function () {
  const basePage = new BasePage(pageFixture.page);
  // const envUrl=JSON.parse(JSON.stringify(require('src\\test\\testdata\\VentureBacked.env')));
  //  loginPage=await new LoginPage(pageFixture.page);
  //await loginPage.navigateTo("https://qavbc.venturebacked.co/");
  await basePage.navigateTo(process.env.NYCURL);
});

When('I click on {string} text button', async (buttonName: string) => {
  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;
  element = page.getByRole('button', { name: `${buttonName}` });
  await basePage.clickElement(element);

});


When(/^I enter "([^"]+)" value in the (input|textarea) field using "([^"]+)" attribute with value "([^"]+)"$/, async (valueToEnter: string, locatorType: string, locatorAttribute: string, locatorValue: string) => {

  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;

  element = await basePage.createWebEditElement(locatorAttribute, locatorValue);

  await basePage.clickElement(element);
  await basePage.fillField(element, valueToEnter);
  //await page.keyboard.press('Tab');
}
);

When(/^I enter "([^"]+)" value in the (input|textarea) field displayed (next|below|right-of|left-of) to text "([^"]+)"$/, async (valueToEnter: string, locatorType: string, locatorPosition: string, referenceText: string) => {
  console.log("Entering value using relative locator")
  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;

  switch (locatorType.toUpperCase()) {
    case 'INPUT': {
      if (locatorPosition.toLowerCase() === 'next') {
        element = page.locator(`//*[normalize-space(text())='${referenceText}']/following::input[1]`);

      }
      else {
        element = page.locator(`input:not(:disabled):${locatorPosition}(:text('${referenceText}'))`).first();
        element.waitFor();
      }
      break;
    }
    case 'TEXTAREA': {
      if (locatorPosition.toLowerCase() === 'next') {
        element = page.locator(`//*[normalize-space(text())='${referenceText}']/following::textarea[1]`);
      }
      else {
        element = page.locator(`textarea:not(:disabled):${locatorPosition}(:text('${referenceText}'))`).first();
        element.waitFor();
      }
      break;
    }
  }
  console.log(referenceText);
  await basePage.fillField(element, valueToEnter);

}
);

When(/^I click "([^"]+)" value in the (input|textarea) field using "([^"]+)" attribute with value "([^"]+)"$/, async (valueToEnter: string, locatorType: string, locatorAttribute: string, locatorValue: string) => {

  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;
  element = await basePage.createWebEditElement(locatorAttribute, locatorValue);
  await basePage.clickElement(element);
  await basePage.fillField(element, valueToEnter);
  await page.keyboard.press('Tab');
}
);


When(/^I click on (WebImage|WebElement|WebList|WebButton|WebLink|WebCheckbox|WebRadioButton) using "([^"]+)" attribute with value "([^"]+)"$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  //await basePage.scrollToWebElement(element);
  await basePage.clickElement(element);

}

);

When(/^I click on (WebImage|WebElement|WebButton|WebLink|WebCheckbox|WebRadioButton) using "([^"]+)" attribute with value "([^"]+)" displayed next to text "([^"]+)"$/, async (elementType: string, attributeType: string, attributeValue: string, referenceTextValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;
  switch (elementType.toUpperCase()) {
    case 'WEBELEMENT': {
      // element = page.locator(`//span[text()='Continue']:below(:text('${referenceTextValue}'))`).first();
      element = await basePage.createWebElementDisplayedNextToText('*', attributeType, attributeValue, referenceTextValue);
    }
  }
  //await basePage.scrollToWebElement(element);
  await basePage.clickElement(element);

}

);

When(/^I check (WebCheckbox|WebRadioButton) using "([^"]+)" attribute with value "([^"]+)"$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);

  switch (elementType.toUpperCase()) {

    case 'WEBCHECKBOX': {
      await basePage.selectCheckBox(element);
      break;
    }
    case 'WEBRADIOBUTTON': {
      break;
    }
  }
  await basePage.clickElement(element);
}

);

When(/^I uncheck WebCheckbox using "([^"]+)" attribute with value "([^"]+)"$/, async (attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement("WebCheckBox", attributeType, attributeValue);
  await basePage.uncheckCheckBox(element);

}

);

When('I click on image using {string} attribute {string}', async (attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  switch (attributeType.toUpperCase()) {

    case 'ALT': {
      console.log('clicking on ALT Attribute');
      element = page.locator(`img[alt="${attributeValue}"]`);

      break;
    }

    default: {
      element = null;

    }

  }
  await basePage.clickElement(element);

}

);

When('I {string} alert box', async (action: string) => {
  page = pageFixture.page;
  switch (action.toUpperCase()) {
    case 'ACCEPT': {
      const popupPromise = page.waitForEvent('popup');
      const popup = await popupPromise;
      await popup.getByRole('button').click();
      break;
    }
  }
}
);

When(/^I mouse hover on (WebList|WebLink|WebCheckbox|WebRadioButton|WebElement|WebButton) using "([^"]+)" attribute with value "([^"]+)"$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  //await basePage.scrollToWebElement(element);
  await basePage.hoverElement(element);

}
);

Then('I upload {string} file using {string} attribute with value {string}', async (filePath: string, attributeType: string, attributeValue: string) => {
  
  // Write code here that turns the phrase above into concrete actions
  await page.locator(`input[${attributeType}=\'${attributeValue}\']`).setInputFiles(filePath);

  console.log('it is done');
  
});

When('I accept pop up window', async () => {
  // let context:BrowserContext;
  // let browser:Browser;
  // const basePage = new BasePage(pageFixture.page);
  // await basePage.acceptPopUp();

}
);

Given('I navigate to {string} page', async function (pageUrl: string) {
  const basePage = new BasePage(pageFixture.page);
  await basePage.navigateTo(pageUrl);
});

When('I switch to new Tab', async () => {
  page = pageFixture.page;
  [newTab] = await Promise.all([
    page.waitForEvent('popup')
  ])
  await newTab.waitForLoadState();
  pageFixture.page = newTab.context().pages()[1];
}
);

When('I switch back to the parent window', async () => {
  // page=pageFixture.page;
  await newTab.context().pages()[1].close();
  pageFixture.page = pageFixture.page.context().pages()[pageFixture.page.context().pages().length - 1];

});

When(/^I select "([^"]+)" option from  list with attribute "([^"]+)" having value "([^"]+)"$/, async (selectedOption: string, locatorAttribute: string, attributeValue: string) => {

  page = pageFixture.page;
  const basePage = new BasePage(pageFixture.page);
  const listSection = (await basePage.createWebElement("WebElement", locatorAttribute, attributeValue)).first();

  await listSection.selectOption({
      label: selectedOption,
  });
  

});



When('I press {string}', async (keyboardButton: string) => {
  const basePage = new BasePage(pageFixture.page);
  await basePage.presskeyboardButton(keyboardButton);;

}
);

Then(/^I validate (Home|Social|Jobs|Deal Rooms|Events|Venture Edge|Venture Meet|Companies|Groups|Connections|Saved Posts|Scheduled Post|Create Company) url page opened$/, async (url: string) => {

  const time = 60000;
  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;
  
  await basePage.urlPageOpened(url);

});

Then('I validate {string} page title displayed', async (expectedTitle: string) => {

  const time = 60000;
  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;
  basePage.urlPageOpened(expectedTitle);


});


Then('I validate {string} text is displayed', async (expectedText: string) => {

  const time = 60000;
  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;

  const element = page.locator(`//*[normalize-space(text())="${expectedText}"]`).first();
  await element.textContent();
  await basePage.elementIsDisplayed(element);

});

Then(/I validate "([^"]+)" (WebElement|WebButton|WebLink|WebCheckbox|WebRadioButton|WebImage|WebEdit) Text is displayed$/, async (expectedText: string, locatorType: string) => {

  page = pageFixture.page;
  const basePage = new BasePage(page);
  switch (locatorType.toUpperCase()) {
    case 'WEBELEMENT': {
      element = page.locator(`//span[normalize-space()="${expectedText}"]`);
      break;
    }

    case 'WEBLINK': {

      element = page.locator(`//a[normalize-space()="${expectedText}"]`);

      break;
    }

    case 'WEBBUTTON': {
      element = page.locator(`//button[normalize-space()="${expectedText}"]`);
      break;
    }

    case 'WEBIMAGE': {
      element = page.getByAltText(`${expectedText}`);
      break;
    }

    case 'WEBEDIT':{
      element = page.getByPlaceholder(`${expectedText}`);
      break;
    }

    default:
      throw new Error("please provide valid locator type!");

  }

  await basePage.elementIsVisible(element);

}
);

Then(/^I validate "([^"]+)" value in the (input|textarea) field using "([^"]+)" attribute with value "([^"]+)"$/, async (expectedValue: string, locatorType: string, locatorAttribute: string, locatorAttributeValue: string) => {

  const basePage = new BasePage(pageFixture.page);
  page = pageFixture.page;
  element = await basePage.createWebEditElement(locatorAttribute, locatorAttributeValue);
  await basePage.elementHaveValue(element, expectedValue);
}
);

Then(/^I validate (WebCheckbox) using "([^"]+)" attribute with value "([^"]+)" is checked$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  await basePage.verifyCheckboxIsChecked(element);
}
);

Then(/^I validate (WebCheckbox) using "([^"]+)" attribute with value "([^"]+)" is unchecked$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  await basePage.verifyCheckboxIsUnchecked(element);
}
);

Then(/^I validate (WebImage|WebLink|WebCheckbox|WebRadioButton|WebElement|WebButton) using "([^"]+)" attribute with value "([^"]+)" is visible$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  await basePage.elementIsVisible(element);
}
);

Then(/^I validate (WebImage|WebLink|WebCheckbox|WebRadioButton|WebElement|WebButton) using "([^"]+)" attribute with value "([^"]+)" is not visible$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  await basePage.elementIsNotVisible(element);
}
);

Then(/^I validate (WebImage|WebLink|WebCheckbox|WebRadioButton|WebElement|WebButton) using "([^"]+)" attribute with value "([^"]+)" is Enabled$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  await basePage.elementIsEnabled(element);
}
);

Then(/^I validate (WebImage|WebLink|WebCheckbox|WebRadioButton|WebElement|WebButton) using "([^"]+)" attribute with value "([^"]+)" is Disabled$/, async (elementType: string, attributeType: string, attributeValue: string) => {
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createWebElement(elementType, attributeType, attributeValue);
  await basePage.elementIsDisabled(element);
});

Then('I validate Social Interaction option {string} is enabled', async function (optionType: string) {

  console.log("Validating Social Interaction option as ", optionType);
  const basePage = new BasePage(pageFixture.page);
  element = await basePage.createSocialInteractionWebELement(optionType);
  expect(await basePage.elementIsEnabled(element));

});


