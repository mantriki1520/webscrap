import { Browser, chromium, Locator, Page } from "@playwright/test";
import BasePage from "./basePage";
import { promises as fs } from 'fs';
import { context } from "../../hooks/hooks";
import { invokeBrowser } from "../../helper/browsers/browserManager";
import { pageFixture } from "../../hooks/pageFixture";
import {insertDataToDB} from "../insertJobsWorking"
import { Connection } from "mysql2/promise";
import { DBConfig } from "../../helper/database/Database";

export class LoginPage extends BasePage {

    //  browser:Browser;
    readonly page: Page;

    readonly userId: Locator;
    readonly password: Locator;
    readonly submit: Locator;
    readonly userProfileImage: Locator;
    readonly totalResult: string;



    constructor(page: Page) {

        super(page);
        this.page = page;
        this.userId = page.locator('#ycid-input');
        this.password = page.locator('#password-input');
        this.submit = page.locator("//span[text()='Log in']");
        this.totalResult = 'div.flex.w-full.w-full.items-center.justify-between>p';
        this.page.setDefaultTimeout(1800000); //30 mins
        // this.userProfileImage=page.locator("img[alt=\"QA Admin Profile Picture\"]").nth(0);
        this.userProfileImage = page.locator("div.user-avatar");
    }

    async logintoApplication() {

        await this.fillField(this.userId, 'qa_admin_2@venturebacked.co');
        await this.fillField(this.password, 'Kagu917071');
        await this.clickElement(this.submit);
    }

    async clickOnUserProfile() {
        await this.clickElement(this.userProfileImage);

    }

    async getTotalSearchResultCount(locatorVal: string) {
        await this.waitForTwoSeconds();
        await this.page.locator(locatorVal).waitFor();
        const val = (await this.page.locator(locatorVal).textContent()).trim();
        console.log(val);
        const match = val.match(/Showing (\d+) matching startups/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        } else {
            throw new Error('Unable to extract the total search result count');
        }
    }


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
        await this.page.waitForSelector('.directory-list .bg-beige-lighter');
        //logic for scroll 
        const totalCount = await this.getTotalSearchResultCount(this.totalResult);
        await this.scrollTillAllElementsAreLoaded();
        console.log("Total count is : " + totalCount);

        //loop till all 983 elements are loaded i.e till jobElements size is 983 [await this.scrollToWebElement(element);]
        //do full scrolling in playwright 
        const companyUrls = await this.page.evaluate(() => {
            const companyElements = document.querySelectorAll('.directory-list .bg-beige-lighter');
            const companyArray = [];

            companyElements.forEach(companyElement => {
                const companyNameHref = companyElement.querySelector('a[href*="companies"]').getAttribute('href');

                const companyHref = "https://www.workatastartup.com" + companyNameHref;
                companyArray.push(companyHref);

            });

            return companyArray;
        });

        console.log(companyUrls);
        console.log(companyUrls.length);

        //logic to open the url in new tab and get the data
        const companyDetails = [];

        for (const url of companyUrls) {
            // pageFixture.page
            const newPage = await context.newPage();
            await newPage.goto(url);
            await newPage.waitForSelector('.content-yield');

            // const companyLogo = await this.page.locator(`//img[@alt='${companyName}']`).getAttribute('src') || '';

            const companyData = await newPage.evaluate(() => {
                const companyName = document.querySelector('.company-name')?.textContent?.trim() || '';
                const companyLogo = document.querySelector(`img[alt="${companyName}"]`)?.getAttribute('src') || '';
                
                const companyDetails = {
                    name: companyName,
                    logo: companyLogo,
                    company_url: window.location.href,
                    location: document.querySelector('.fa-map-marker + .detail-label')?.textContent?.trim() || '',
                    numberOfPeople: document.querySelector('.fa-users + .detail-label')?.textContent?.trim() || '',
                    typeOfServices: document.querySelector('.fa-tags + .detail-label')?.textContent?.trim() || '',
                    domain: document.querySelector('.fa-tags + .detail-label:nth-of-type(2)')?.textContent?.trim() || '',
                    jobs: []
                };

                const jobs = document.querySelectorAll('div.w-full>div>div.mb-4.flex.flex-col.justify-between');
                jobs.forEach(job => {
                    const jobTypeDetails = Array.from(job.querySelectorAll('.mr-2.text-sm span')).map(span => span.textContent?.trim()).join('* ');
                    let individualJobFields = {
                        jobTitle: job.querySelector('.job-name a')?.textContent?.trim() || '',
                        salaryRange: jobTypeDetails.includes('$') ? jobTypeDetails.split('$')[1].split(' ')[0] : 'N/A',
                        // experience: jobTypeDetails.includes('years') ? jobTypeDetails.split('years')[0].trim() : 'N/A',
                        details: jobTypeDetails,
                        visaRequired: jobTypeDetails.includes('Visa Required') ? 'Yes' : 'No',
                        jobType: jobTypeDetails.includes('Full Time') ? 'Full Time' : 'Part Time',
                        remote: jobTypeDetails.includes('Remote') ? 'Yes' : 'No',
                        job_detail: job.querySelector('a.rounded-md')?.getAttribute('href') || '',
                        apply_href: ``,
                        description: "",
                        shortdesc: ""
                        //description and short description (about company)
                    };
                    //open the web page and get the description and short description
                    individualJobFields.shortdesc = "short description";
                    individualJobFields.description = "description";
                    companyDetails.jobs.push(individualJobFields);
                });

                return companyDetails;
            });

            companyDetails.push(companyData);
            await newPage.close();
            console.log(companyDetails);

            companyDetails.forEach(jb => {
                console.log(jb);
            });
            console.log("Total companies are : " + companyDetails.length);

        }

        const updatedCompanies = await this.updateJobDetails(companyDetails);


        // Write jobDetails to a JSON file
        await fs.writeFile('ycombinatorjobdetails.json', JSON.stringify(updatedCompanies, null, 2));
    }

    async updateJobDetails(companyDetails: any[]) {
        console.log("Inside updateJobDetails .......");
        const updatedCompanyDetails = [];
        let jobId = 0;
        let companyId = 0;
        for (const company of companyDetails) {
            for (const job of company.jobs) {
                const url = job.job_detail;
                const hrefPage = await context.newPage();
                await hrefPage.goto(url);
                await hrefPage.waitForSelector('.content-yield');

                const companySection = (await hrefPage.locator('.company-section').first().innerText()).trim();
                const companyDescription = await hrefPage.locator('.prose').first().innerText();

              
                //logic to get the company id from the apply button
                const applyButtonDataContent = await hrefPage.locator('div[data-page][id*="ApplyButton"]').getAttribute('data-page');
                if(applyButtonDataContent){
                    const data = JSON.parse(applyButtonDataContent.replace(/&quot;/g, '"'));
                    companyId = data.props?.company?.id;
                }

                //logic to get the job id from url
                const jobIdMatch = url.match(/\/jobs\/(\d+)/);
                 if (jobIdMatch && jobIdMatch[1]) {
                    jobId = jobIdMatch[1];
                 }

                 //update the apply href
                job.apply_href = `https://account.ycombinator.com/?continue=https://www.workatastartup.com/application?signup_job_id=${jobId}&defaults[signUpActive]=true&defaults[waas_company]=${companyId}`

                const aboutCompanyText = {
                    name: companySection,
                    description: companyDescription,
                };

                console.log("aboutCompanyText : " + aboutCompanyText);
                job.shortdesc = aboutCompanyText.description;
                console.log("job.shortdesc : " + job.shortdesc);

                

                const allTexts = await hrefPage.evaluate(() => {
                    const elements = Array.from(
                        document.querySelectorAll('.company-section:not(:first-of-type), .prose:not(:first-of-type)')
                    );
                    return elements.map((el) => el.textContent?.trim() || '').filter(Boolean);
                });

                //filter not working properly
                const filteredTexts = allTexts.filter((text) => text !== aboutCompanyText.description && text !== aboutCompanyText.name);
                job.description = filteredTexts.join(' ');

                await hrefPage.close();
                // await context.close();
                console.log(job);
            }
            updatedCompanyDetails.push(company);
        }

        console.log("Updated company details : " + updatedCompanyDetails);
        return updatedCompanyDetails;
    }

    async pushJobToDB(){
        console.log("Called pushJobToDB");
        await insertDataToDB();
    }


}



