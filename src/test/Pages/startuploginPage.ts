import { Browser, chromium, Locator, Page } from "@playwright/test";
import BasePage from "./basePage";
import { promises as fs } from 'fs';
import { context } from "../../hooks/hooks";
import {insertDataToDB} from "../database/insertJobsWorking"
import { segregateDescriptions } from "../../helper/ai_Integration/ollamaTextGen";

export class StartupLoginPage extends BasePage {

    //  browser:Browser;
    readonly page: Page;

    readonly startupMsg: Locator;
    readonly password: Locator;
    readonly submit: Locator;
    readonly userProfileImage: Locator;



    constructor(page: Page) {

        super(page);
        this.page = page;
        this.startupMsg = page.locator('h1.font-medium');
        this.password = page.locator('#password-input');
        this.submit = page.locator("//span[text()='Log in']");
        this.page.setDefaultTimeout(1800000); //30 mins
        // this.userProfileImage=page.locator("img[alt=\"QA Admin Profile Picture\"]").nth(0);
        // this.userProfileImage = page.locator("div.user-avatar");
    }

    // async clickOnUserProfile() {
    //     await this.clickElement(this.userProfileImage);

    // }


    async scrollTillAllElementsAreLoaded() {
        await this.waitForTwoSeconds();
        let previousHeight = await this.page.evaluate('document.body.scrollHeight');
        let i = 0;
        // while (true) {
        while (i < 1) {
            await this.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await this.page.waitForTimeout(5000);

            const newHeight = await this.page.evaluate('document.body.scrollHeight');
            if (newHeight === previousHeight) {
                break;
            }
            previousHeight = newHeight;
            i++;
        }
    }



    async getAllJobs() {
        await this.waitForTwoSeconds();
        await this.page.waitForSelector('h1.font-medium');
        await this.scrollTillAllElementsAreLoaded();

        //loop till all elements are loaded i.e till jobElements size is 983 [await this.scrollToWebElement(element);]
            const jobsData = await this.page.evaluate(() => {
                const jobElements = document.querySelectorAll('div.isolate');
                const jobsData = [];
        
                jobElements.forEach(job => {
                    const jobNameHref = job.querySelector("a[data-mark-visited-links-target='anchor']").getAttribute('href');
                    const company_logo = job.querySelector("a.block img").getAttribute('src');
                    const company_name = job.querySelector('.grow .flex-col .flex-row > a')?.textContent?.trim() || '';
                    const location = job.querySelector('div[data-post-template-target="location"]')?.textContent?.trim() || '';
                    const companyNameHref = job.querySelector('.grow .flex-col .flex-row > a').getAttribute('href');
                    const tags = Array.from(job.querySelectorAll("div[data-post-template-target='tags'] a")).map(ele => ele.textContent?.trim() || '');
                    const remoteElement = job.querySelector("div[data-post-template-target='remote']");
                    const isRemote = remoteElement && !(remoteElement.getAttribute('class'))?.includes('hidden') ? 'Yes' : 'No';
                    const jobName = job.querySelector("div[class='sm\:truncate']").textContent.trim();
        
                    const jobData = {
                        jobLink: jobNameHref ? `https://startup.jobs${jobNameHref}` : null,
                        companyLink: companyNameHref ? `https://startup.jobs${companyNameHref}` : null,
                        companyLogo: company_logo?.trim() || '',
                        companyName: company_name,
                        jobLocation: location,
                        tags: tags,
                        isRemote: isRemote,
                        short_description: "--",
                        description:"",
                        salary:"",
                        experience:"",
                        apply_href:"",
                        jobTitle: jobName
                    };
        
                    jobsData.push(jobData);
                });
        
                return jobsData;
            });

        // console.log(jobsData);

        //logic to open the url in new tab and get the data
        const updatedJobDetails = [];
        let jobCount=0;

       for (const jobData of jobsData) {
            const url = jobData.jobLink;
            //execute 
            const newPage = await context.newPage();
            await newPage.goto(url);
            await newPage.waitForSelector('.post__content');
            





            
            let fullDescription = await newPage.locator('.trix-content').first().innerText();
            // Call the Ai segregation function
            const { companyDescription, jobDescription } = await segregateDescriptions(fullDescription);
            jobData.description = typeof jobDescription === 'string' ? jobDescription.trim() : String(jobDescription).trim(); // Assign job description
            jobData.short_description = typeof companyDescription === 'string' ? companyDescription.trim() : String(companyDescription).trim();// Assign short_description to companyDescription
            console.log("CompDesc----------------------------",jobData.short_description )
            console.log("JD----------------------------",jobData.description )

           
           
           
    
        
           
            // const experienceMatch = companyDescription.match(/(\d+)(?:\+|\s*-\s*\d+)?\s*years?(?=\s*of experience)/i);
            // jobData.experience = experienceMatch ? experienceMatch[0] : '--';
            // // Extract salary range
            // const salaryMatch = companyDescription.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
            // jobData.salary = salaryMatch ? `$${salaryMatch[1]} - $${salaryMatch[2]}` : '--';
            // //update the apply link
            const applyLink = await newPage.locator(".rounded-lg [rel='nofollow']").getAttribute('href');
            jobData.apply_href="https://startup.jobs"+applyLink;
            updatedJobDetails.push(jobData);
            await newPage.close();
            
            jobCount++;
            if(jobCount===10){
                break;
            }
            
       }

       console.log("Updated job details :::::::::::::::::::::: "+ JSON.stringify(updatedJobDetails));

       // Write jobDetails to a JSON file
       await fs.writeFile('startupjobdetails.json', JSON.stringify(updatedJobDetails, null, 2));
    }

    async pushJobToDB(){
        console.log("Called pushJobToDB");
        await insertDataToDB();
    }


}



