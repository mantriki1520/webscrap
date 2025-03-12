import { chromium } from 'playwright';

(async () => {
    // Launch the browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Load the HTML content (you can also navigate to a URL)
    await page.setContent(`<html>...your HTML content here...</html>`); // Replace with the actual HTML content

    // Extract job details
    const jobDetails = await page.evaluate(() => {
        const jobs = [];
        const jobElements = document.querySelectorAll('.directory-list .bg-beige-lighter');

        jobElements.forEach(jobElement => {
            const companyName = jobElement.querySelector('.company-name')?.textContent?.trim() || '';
            const jobTitle = jobElement.querySelector('.job-name a')?.textContent?.trim() || '';
            const jobType = Array.from(jobElement.querySelectorAll('.mr-2.text-sm span')).map(span => span.textContent?.trim()).join(', ');
            const salaryRange = jobType.includes('$') ? jobType.split('$')[1].split(' ')[0] : 'N/A';
            const experience = jobType.includes('years') ? jobType.split('years')[0].trim() : 'N/A';
            const visaRequired = jobType.includes('Visa Required') ? 'Yes' : 'No';

            const companyDetails = {
                name: companyName,
                location: jobElement.querySelector('.fa-map-marker + .detail-label')?.textContent?.trim() || '',
                numberOfPeople: jobElement.querySelector('.fa-users + .detail-label')?.textContent?.trim() || '',
                typeOfServices: jobElement.querySelector('.fa-tags + .detail-label')?.textContent?.trim() || '',
                domain: jobElement.querySelector('.fa-tags + .detail-label:nth-of-type(2)')?.textContent?.trim() || '',
            };

            jobs.push({
                jobTitle,
                jobType,
                salaryRange,
                experience,
                visaRequired,
                companyDetails,
            });
        });

        return jobs;
    });

    console.log(jobDetails);

    // Close the browser
    await browser.close();
})();
