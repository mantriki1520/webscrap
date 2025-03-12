import { chromium, firefox, LaunchOptions, webkit } from "@playwright/test";

const options: LaunchOptions = {
    headless: false,
    args: ['--ignore-certificate-errors','--deny-permission-prompts']

}
export  const  invokeBrowser = () => {

    const browserType = process.env.BROWSER;
   
    switch (browserType.toUpperCase()) {
        case "CHROME": {
            return chromium.launch(options);

        }
        case "MICROSOFTEDGE": {
            const options: LaunchOptions = {
                headless: false,
                args: ['--ignore-certificate-errors','--deny-permission-prompts'],
                channel:'msedge'
            }
            return chromium.launch(options);

        }
        case "FIREFOX": {
            return firefox.launch(options);

        }
        case "WEBKIT": {
            return webkit.launch(options);

        }

                
        
        default:
            throw new Error("Please set the proper Browser!");

    }
}
