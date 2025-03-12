import { Before,BeforeAll,BeforeStep,After,AfterAll,AfterStep,Given,When,Then, setDefaultTimeout, Status} from "@cucumber/cucumber";
import { Browser,BrowserContext,Page,chromium} from "@playwright/test";
import { pageFixture } from "./pageFixture";
import { invokeBrowser } from "../helper/browsers/browserManager";
import { getEnv } from "../helper/env/env";


setDefaultTimeout(60 * 1000);
let browser:Browser;
let page:Page;
let context:BrowserContext;
let originalWindowPage:Page;
export { context };

BeforeAll(async function(){
     getEnv();
    browser=await invokeBrowser();
    
});

Before({timeout:60000},async function() {
     
   // browser=await chromium.launch({headless:false});
    context = await browser.newContext();
   
     //  context = await browser.newContext({
     //   // Configure proxy for legitimate testing purposes
     //   proxy: {
     //     server: 'http://207.244.217.165:67',  // e.g. 'http://myproxy:3128'
     //     username: 'dyymzhkf',
     //     password: '99gzfac97p1j'
     //   },
     //   // Geolocation can be used to test location-specific features
     //   geolocation: {
     //     latitude: 51.5074,  // Example: London coordinates
     //     longitude: -0.1278
     //   },
     //   // Language and timezone settings
     //   locale: `en-GB`,
     //   timezoneId: 'Europe/London'
     // });
     
   
   // await context.grantPermissions(['geolocation'], { origin: 'https://stgvbc.venturebacked.co/' });
    page=await context.newPage();
    pageFixture.page=page;
    originalWindowPage=page;
});


After(async function({pickle,result}) {

     if(result?.status==Status.FAILED){
          const pageName=pageFixture.page.url();
          const image=await pageFixture.page.screenshot({path:`./test-result/screenshot/${pickle.name}.png`,type:"png"}) ;
          await this.attach(pageName);
          await this.attach(image,"image/png");
         
     }
     await pageFixture.page.close();
     await context.close();
     
    
});

AfterAll(async function(){
  
     await browser.close();
});

