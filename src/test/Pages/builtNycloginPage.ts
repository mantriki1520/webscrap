import { Browser, chromium, Locator, Page } from "@playwright/test";
import BasePage from "./basePage";
import { promises as fs } from 'fs';
import { context } from "../../hooks/hooks";
import {insertDataToDB} from "../database/insertBuiltInNycJob"
import { getEnv } from "../../helper/env/env";

export class BuiltNycLoginPage extends BasePage {

    //  browser:Browser;
    readonly page: Page;

    readonly employerButton: Locator;
    // readonly password: Locator;
    // readonly submit: Locator;
    // readonly userProfileImage: Locator;



    constructor(page: Page) {

        super(page);
        this.page = page;
        this.employerButton = page.locator('#for-employers-button');
        // this.password = page.locator('#password-input');
        // this.submit = page.locator("//span[text()='Log in']");
        this.page.setDefaultTimeout(1800000); //30 mins
    }
    
        async scrollToNextButton() {
            const nextButtonLocator = 'a[aria-label="Go to Next Page"]';
            while (true) {
                const nextButton = this.page.locator(nextButtonLocator);
                // Check if the next button is visible
                const isVisible = await nextButton.isVisible();
                if (!isVisible) {
                    console.log("Reached the last page or next button is not available.");
                    break;
                }
                // Scroll to the next button and click it
                await nextButton.scrollIntoViewIfNeeded();
                await nextButton.click();
                await this.page.waitForTimeout(1000); // Adjust timeout as necessary
            }
        }
    async getAllJobs() {
        await this.waitForTwoSeconds();
        await this.page.waitForSelector('#for-employers-button');
        const jobsData = await this.page.evaluate(() => {
            const jobElements = document.querySelectorAll('div[data-id="job-card"]');//scrolling Required
            const jobsData = [];
                jobElements.forEach(job => {
                    const jobNameHref = job.querySelector('a[data-id="job-card-title"]').getAttribute('href');
                    const company_logo = job.querySelector('img[data-id="company-img"]').getAttribute('src');
                    const company_name = job.querySelector('a[data-id="company-title"] span')?.textContent?.trim() || '';
                    const companyNameHref = job.querySelector('a[data-id="company-title"]').getAttribute('href');
                    const jobName = job.querySelector('a[data-id="job-card-title"]').textContent.trim();
                    const jobData = {
                        jobLink: jobNameHref ? `https://www.builtinnyc.com/${jobNameHref}` : null,
                        companyLink: companyNameHref ? `https://www.builtinnyc.com/${companyNameHref}` : null,
                        companyLogo: company_logo?.trim() || '',
                        companyName: company_name,
                        jobLocation:"",
                        // tags: tags,
                        isRemote: "",
                        short_description: "--",
                        description:"",
                        salaryRange:"",
                        experience:"",
                        apply_href:"",
                        jobTitle: jobName,
                        positionLevel:"",
                        totalEmployees:"",
                        applyHref:"",
                    };
                    jobsData.push(jobData);
                });
                return jobsData;
            });
        // console.log(jobsData);

// logic to open the url in new tab and get the data
        const updatedJobDetails = [];
        for (const jobData of jobsData) {
            const url = jobData.jobLink;
            const newPage = await context.newPage();
            await newPage.goto(url);
            await newPage.waitForSelector('.post__content');
            jobData.isRemote = document.querySelector("i.fa-regular.fa-signal-stream") !== null;
            jobData.isHybrid = document.querySelector("span.font-barlow.text-gray-03:contains('Hybrid')") !== null;
            jobData.salaryRange = document.querySelector('i.fa-regular.fa-sack-dollar').closest('div.d-flex.align-items-start').querySelector('span.font-barlow')?.textContent?.trim() || '';
            jobData.positionLevel = document.querySelector('i.fa-regular.fa-trophy').closest('div.d-flex.align-items-start').querySelector('span.font-barlow')?.textContent?.trim() || '';
            //TODO:vkumar: Map position level [Expert/Leader -> Expert, Senior ->Intermediate, Any other value from UI -> No-Experience]
            jobData.location =  document.querySelector('i.fa-regular.fa-map-location-dot').closest('div.d-flex.align-items-start').querySelector('span.font-barlow')?.textContent?.trim() || '';  
            jobData.totalEmployees = document.querySelector('i.fa-regular.fa-user-group').closest('div.d-flex.align-items-start').querySelector('span.font-barlow')?.textContent?.trim() || '';
            jobData.roleDescription = document.querySelector("div[id*='job-post-body'].fs-md.fw-regular")?.textContent?.trim() || '';
            jobData.companyDescription = Array.from(document.querySelectorAll("p.mb-lg")).map(p => p.textContent?.trim() || '').join(' ');
            jobData.applyHref = document.querySelector('aria-label="Login to apply"')?.getAttribute('href') || '';
            updatedJobDetails.push(jobData);
            await newPage.close();
    }

       console.log("Updated job details :::::::::::::::::::::: "+ JSON.stringify(updatedJobDetails));
       // Write jobDetails to a JSON file
       await fs.writeFile('builtInNycjobdetails.json', JSON.stringify(updatedJobDetails, null, 2));
    }

    async pushJobToDB(){
        console.log("Called pushJobToDB");
        await insertDataToDB();
    }


}



