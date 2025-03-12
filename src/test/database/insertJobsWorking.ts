import { promises as fs } from 'fs';
import mysql, { Connection } from 'mysql2/promise';
import { instance as dbInstance } from '../../helper/database/Database'; 

interface Job {
    jobLink :string;
    companyLink: string;
    companyLogo:string;
    companyName: string;
    jobLocation: string;
    tags:string;
    isRemote:string;
    short_description: string;
    description: string;
    salary:string;
    experience:string;
    jobTitle: string; 
    apply_href: string;
}
// job_detail:string; //jobLink
// tags:string; //typeOfservice

async function readJobsFromFile(filePath: string): Promise<Job[]> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Job[];
}

function processHref(href: string, companyName: string): string {
    const jobIdMatch = href.match(/-(\d+)$/);
    if (jobIdMatch && jobIdMatch[1]) {
        const jobId = jobIdMatch[1];
        const formattedCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
        return `sj-${formattedCompanyName}-${jobId}`;
    }
    return href;
}
function formatJobType(type) {
    const typeMap = {
        "fulltime": "Full Time",
        "full-time": "Full Time",
        "full_time": "Full Time",
        "fullTime": "Full Time",
        "parttime": "Part Time",
        "part-time": "Part Time",
        "part_time": "Part Time",
        "partTime": "Part Time",
        "contract": "Hourly-Contract",
        "hourlycontract": "Hourly-Contract",
        "hourly-contract": "Hourly-Contract",
        "hourly_contract": "Hourly-Contract",
        "hourlyContract": "Hourly-Contract",
        "fixedprice": "Fixed-Price",
        "fixed-price": "Fixed-Price",
        "fixed_price": "Fixed-Price",
        "fixedPrice": "Fixed-Price"
    };

    // Normalize input by converting to lowercase and removing `-` and `_`
    const normalizedType = type.toLowerCase().replace(/[-_]/g, "");

    return typeMap[normalizedType] || type;  // Return mapped value or original type
}

async function extractSalaryRange(jobString: string): Promise<string | null> {
    // const salaryRegex = /\$\d+K\s*-\s*\$\d+K/;
    const salaryRegex = /[$£]\d+K\s*-\s*[$£]\d+K/;
    const match = jobString.match(salaryRegex);

    return match ? match[0] : null;
}

async function insertJobsIntoDB(connection:Connection,job: Job,slugfromJobs: string) {

    console.log("Inside insertJobsWorkign.ts :::::::::::"+ connection);

    const insertJobQuery = `
    INSERT INTO external_openings (title, slug, type, address, currency,expertise,experience,category_id, description, salary_type,company_name,salary_range,short_description, meta, scrapped_info)
    VALUES (?, ?, ?, ?,?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?)
`;
    //collect slug from the DB
    const getSlugQuery = `SELECT slug FROM external_openings`;
    const [queryResult] = await connection.execute(getSlugQuery);

    

    // for (const job of jobs) {
        const slug = processHref(job.jobLink, job.companyName);
        const exists = (queryResult as any[]).some((row: any) => row.slug === slug);

        if (exists) {
            console.log(`The value '${slug}' exists in the query results.`);
            // remove the record from the db which is not in the jobs
            const [idOfJobsToBeDeleted] = await connection.execute(`SELECT group_concat(id) FROM external_openings WHERE slug NOT IN (${slugfromJobs})`);
            await connection.execute(`DELETE FROM external_openings WHERE id IN (${idOfJobsToBeDeleted[0]['group_concat(id)']})`);
            // continue;
        } else {
            console.log(`The value '${slug}' does not exist in the query results. Inserting this record into the database.`);

            //function to parse the values from the experience and map it to appropriate columns names(same as db colum names)
            //if slug doesn't exist then insert into the db 
            //get all existing slug from the DB and store it in some array.
            //if the DB results contains the slug then don't insert the record.
            // const details = job.details.split('*').map(detail => detail.trim());
            // const typeStr = details[1].charAt(0).toUpperCase() + details[1].slice(1);
            const type = '--';

            const address =job.jobLocation;
            const experience = job.experience;
            //wright the mapping logic for the experience
            const salaryRange = job.salary;
            const is_remote = job.isRemote.toLocaleLowerCase().includes("no") ? false : true;
            const metadata = JSON.stringify({
                "is_remote": is_remote,
                "company_logo": job.companyLogo,
                "apply_type": {
                    "value": job.apply_href
                },
                "job_detail": job.jobLink,
                "company_url": job.companyLink
            });

            console.log("metadata :: " + metadata);
            const [rows] = await connection.execute(
                "SELECT * FROM `categories` WHERE `title` = 'External Openings' AND `type` = 'service'"
                    );
            let category_id = rows[0].id;
            console.log("category_id: " + category_id);


            const scrapped_info = JSON.stringify({
                "title": job.jobTitle,
                "slug": slug,
                "type": type,
                "address": address,
                "currency": "USD",
                "expertise": "Intermediate",
                "experience": job.experience,
                "category_id": category_id,
                "description": job.description,
                "salary_type": "Monthly",
                "company_name": job.companyName,
                "salary_range": salaryRange,
                "short_description": job.short_description,
                "country": [],
                "state": [],
                "meta": {
                    "is_remote": is_remote,
                    "company_logo": job.companyLogo,
                    "apply_type": {
                        "value": job.apply_href 
                    },
                "detail_link": job.jobLink 
                }
            });

            //curreny logic needs to be implemented 
            //category_id - needs to be fetched from DB - table name ?
            const [result]: any = await connection.execute(insertJobQuery, [job.jobTitle, slug, type, address, "USD", "Intermediate", experience, category_id, job.description, "Monthly", job.companyName, salaryRange, job.short_description, metadata, scrapped_info]);
            console.log(`Inserted job with ID ${result.insertId}`);
        }

    // }
    //store  restult id in - location table 
    // await connection.end();
}

export async function insertDataToDB() {
    console.log('Inserting job details into the database...');
    // const filePath = 'C:/Users/Vikas.kumar4/Downloads/repolink/vbc_webscraping_automation/startupjobdetails.json';
    const filePath ='startupjobdetails.json';
    const jobs = await readJobsFromFile(filePath);

    //collect all the slug from all the jobs
    const slugfromJobs = jobs.map(job => `'${processHref(job.jobLink, job.companyName)}'`).join(',');
    console.log("slugfromJobs: " + slugfromJobs);

    //connection establish
    const connection = await dbInstance.getConnection();
    try {
        for (const job of jobs) {
            await insertJobsIntoDB(connection,job,slugfromJobs);
        }

    } catch (e) {
        console.log('Error while inserting job details into the database.');
        console.log(e);
    } finally{
         //connection close
         await connection.end();
    }


    console.log('Job details inserted into the database successfully.');
}
