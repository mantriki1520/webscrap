import { expect, Locator, Page } from "@playwright/test";
import { pageFixture } from "../../hooks/pageFixture";

let time = 60000;
let element: Locator;
export default class BasePage {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //method to navigate to a URL
  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  //method to click an element
  async clickElement(element: Locator) {
    console.log("clicking value");
    await element.first().waitFor();
    await expect(element).toBeVisible();
    await this.scrollToWebElement(element);
    await element.click();
    await this.waitForTwoSeconds();
  }

  async fillField(element: Locator, value: string) {
    console.log("filling value");
    await element.first().waitFor();    
    await this.clickElement(element);
    await element.fill(value);
    // await this.presskeyboardButton('Backquote');
    // await this.presskeyboardButton('Backspace');
    //await this.presskeyboardButton('Tab');
  }


  
  async clearField(element: Locator) {
    console.log("Clearing field")
    await element.first().waitFor();
    await element.clear();
  }


  async hoverElement(element: Locator) {
    console.log("hovering Element");
    await element.first().waitFor();
    await element.hover();

  }

  async elementIsVisible(element: Locator) {
    await expect(element, "could not find expected " + element).toBeVisible({ timeout: time });
  }

  async elementIsDisplayed(element: Locator) {
    await (element.count()) > 0;
    await expect(element.first()).toBeVisible({ timeout: time });
  }

  async createWebElement(elementType: string, attributeType: string, attributeValue: string) {

    const page = pageFixture.page;
    switch (elementType.toUpperCase()) {

      case 'WEBLINK': {
        console.log('clicking on Link element');
        if (attributeType.toUpperCase() != "TEXT") {
          element = page.locator(`a[${attributeType}=\'${attributeValue}\']`);
        } else {
          element = page.locator(`//a[normalize-space=\'${attributeValue}\']`);
          //element = page.getByText(`${attributeValue}`);
        }

        break;
      }

      case 'WEBLIST': {
        console.log('clicking on Link element');
        if (attributeType.toUpperCase() != "TEXT") {
          element = page.locator(`li[${attributeType}=\'${attributeValue}\']`);
        } else {
          element = page.getByText(`${attributeValue}`);
        }

        break;
      }

      case 'WEBIMAGE': {
        console.log('clicking on Link element');
        if (attributeType.toUpperCase() != "TEXT") {
          element = page.locator(`img[${attributeType}=\'${attributeValue}\'] | svg[${attributeType}=\'${attributeValue}\']`);
        } else {
          element = page.getByText(`${attributeValue}`);
        }

        break;
      }

      case 'WEBBUTTON': {

        console.log('clicking on WebButton element');
        if (attributeType.toUpperCase() != "TEXT") {
          element = page.locator(`button[${attributeType}=\'${attributeValue}\']`);
        } else {
          //element = page.getByText(`${attributeValue}`).first();
          element = page.getByRole("button", { name: `${attributeValue}` });
          //element = page.locator(`${attributeType}:has-text(${attributeValue})`);
        }

        break;

      }

      case 'WEBELEMENT': {

        if (attributeType.toUpperCase() != 'TEXT') {
          element = page.locator(`span[${attributeType}=\'${attributeValue}\'],div[${attributeType}=\'${attributeValue}\']`).first();
        } else {

          element = page.getByText(`${attributeValue}`).first();
          //   element = page.locator(`//*[normalize-space(text())="${attributeValue}"] | //div[normalize-space(text())="${attributeValue}"]`);
         
        }
        break;
      }
      case 'WEBCHECKBOX': {
        console.log('creating WebCheckbox element');
        if (attributeType.toUpperCase() != "LABEL") {
          element = page.locator(`input[${attributeType}="${attributeValue}"]`);
        } else {
          element = page.getByLabel(`${attributeValue}`);
          // element = page.locator(`//*[normalize-space(text())=\'${attributeValue}\']/preceding::input[1]`);
        }
        break;
      }

      default: {
        throw new Error('Please select proper Locator Type!');

      }

    }

    return element;

  }

  async createWebEditElement(locatorAttribute: string, locatorValue: string) {
    const page = pageFixture.page;
    switch (locatorAttribute.toUpperCase()) {
      case 'ID': {
        element = page.locator(`#${locatorValue}`);
        break;
      }

      case 'NAME': {
        element = page.locator(`//*[@name="${locatorValue}"]`);
        break;
      }

      case 'PLACEHOLDER': {

        element = page.getByPlaceholder(`${locatorValue}`);

        break;
      }
      case 'TYPE': {

        element = page.locator(`(//*[@type="${locatorValue}"])[1]`);

        break;
      }

      case 'data-path': {
        element = page.locator(`(//*[@data-path="${locatorValue}"])[1]`);
        break;
      }
      default: {

        throw new Error("select correct locator type!!")
      }
    }
    return element;
  }

  async createWebElementDisplayedNextToText(elementType: string, attributeType: string, attributeValue: string, textValue: string) {
    console.log("creating webElement displayed next to text")
    const page = pageFixture.page;
    if (attributeType.toUpperCase() != 'TEXT') {
      element = page.locator(`//*[normalize-space(text())=\'${textValue}\']/following::${elementType}[@${attributeType}='${attributeValue}'][1]`);
    } else {
      element = page.locator(`//*[normalize-space(text())=\'${textValue}\']/following::${elementType}[normalize-space(text())='${attributeValue}'][1]`);

    }
    return element;
  }

  async scrollToWebElement(element: Locator) {
    await element.first().waitFor();
    await element.scrollIntoViewIfNeeded();
  }

  async acceptPopUp() {
    // pageFixture.page.on('dialog', async dialog => {
    //   // 3. Do stuff with the dialog here (reject/accept etc.)
    //   console.log(dialog.message());
    //   await dialog.accept()
    // });
    const popupPromise = pageFixture.page.waitForEvent('popup');
    const popup = await popupPromise;
    await popup.getByRole('button').click();
    console.log(await popup.title());

  }

  async selectCheckBox(element: Locator) {
    await element.evaluate((el) => el.style.display = 'inline');
    await element.first().waitFor();
    await element.check();
    this.verifyCheckboxIsChecked(element);
  }

  async uncheckCheckBox(element: Locator) {

    await element.evaluate((el) => el.style.display = 'inline');
    await element.first().waitFor();
    await element.uncheck();
    console.log("element is unchecked")
    this.verifyCheckboxIsUnchecked(element);
    console.log("check");

  }
  async verifyCheckboxIsChecked(element: Locator) {
    console.log("Verifying checkbox is checked")
    await element.first().waitFor();
    await expect(element).toBeChecked();
  }

  async verifyCheckboxIsUnchecked(element: Locator) {
    console.log("Verifying checkbox is unchecked")
    await element.first().waitFor();
    await expect(element).not.toBeChecked();
  }
  async elementIsNotVisible(element: Locator) {
    console.log("Verifying element is not visible")
    await element.first().waitFor();
    await expect(element).not.toBeVisible({ timeout: time });
  }

  //This method is used to press the keyboard keys like Enter, Tab, Delete, PageDown, PageUp, ArrowUp, and ArrowRight..etc
  async presskeyboardButton(key: string) {
    console.log(`Press + ${key} + key`)
    await this.page.keyboard.press(key);
  }

  async elementIsEnabled(element: Locator) {
    console.log("Verifying element is Enabled")
    await element.first().waitFor();
    await expect(element).toBeEnabled();

  }

  async elementIsDisabled(element: Locator) {
    console.log("Verifying element is Enabled")
    await element.first().waitFor();
    await expect(element).toBeDisabled();

  }

  async elementHaveValue(element: Locator, expectedText: string) {
    console.log('Verifying element have expected Text')
    //await element.first().waitFor();
    await expect(element).toHaveValue(`${expectedText}`);
  }

  async elementHaveAttribute(element: Locator, attributeType: string, attributeValue: string) {

    console.log('Verifying actual element attribute matches with expected attribute')
    await element.first().waitFor();
    await expect(element).toHaveAttribute(`${attributeType}, ${attributeValue}`);

  }

  async elementNotHaveAttribute(element: Locator, attributeType: string, attributeValue: string) {

    console.log('Verifying actual element attribute matches with expected attribute')
    await element.first().waitFor();
    await expect(element).not.toHaveAttribute(`${attributeType}, ${attributeValue}`);

  }

  async urlPageOpened(expectedurl: string) {

    console.log('Verifying url Page opened') 
    // await element.first().waitFor();
    const actualUrl = await this.getPageUrl();
    console.log("Actual Url : ", actualUrl);
    expect(actualUrl).toEqual(expectedurl);
  }

  async validatePageTitle(page: Page, expectedTitle: string) {

    console.log('Verifying url Page opened')
    await element.first().waitFor();
    await expect(this.page).toHaveTitle(expectedTitle);

  }

  public async waitForTwoSeconds(): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  public async getPageUrl():Promise<string>{
    const url= await this.page.url();
    return url.replace('register','').replace('auth/callback','').trim();
  }

  public async createSocialInteractionWebELement(optionType:string){
    switch(optionType.toUpperCase()){
      case 'LIKE': element = await this.page.locator("//div[@id='wo_post_stat_button'] //span[@data-reaction='Like']").first();
      break;
      case'COMMENT': element = await this.page.locator("//div[@id='wo_post_stat_button'] //div[@title='Comments']").first();
      break;
      case'SHARE': element = await this.page.locator("//div[@id='wo_post_stat_button'] //div[@title='Share']").first();
      break;
      default: {
          throw new Error('Please select proper Interaction option Type!');
      }
  }
  return element;
  }


  

}

