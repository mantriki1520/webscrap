import { promises as fs } from 'fs';
import mysql, { Connection } from 'mysql2/promise';
import { DBConfig } from "../helper/database/Database";
import { instance as dbInstance } from '../helper/database/Database'; 
// import { instance } from '../helper/database/Database';

interface Job {
    name: string;
    logo: string;
    company_url: string;
    location: string;
    numberOfPeople: string;
    typeOfServices: string;
    domain: string;
    jobTitle: string;
    details: string;
    description: string;
    shortdesc: string;
    apply_href: string;
    job_detail:string;
}



async function readJobsFromFile(filePath: string): Promise<Job[]> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Job[];
}

function processHref(href: string, companyName: string): string {
    const jobIdMatch = href.match(/\/jobs\/(\d+)/);
    if (jobIdMatch && jobIdMatch[1]) {
        const jobId = jobIdMatch[1];
        const formattedCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
        return `yc-${formattedCompanyName}-${jobId}`;
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

async function insertJobsIntoDB(connection:Connection,job: Job,slugfromJobs:string) {
    // const connection = await mysql.createConnection({
    //     host: 'localhost',
    //     user: 'root',
    //     password: '',
    //     database: 'localdb_1'
    // });

    //  const connection = await mysql.createConnection({
    //         host: 'sqlnprjobdbdev10.mysql.database.azure.com',
    //         user: 'sqladmin',
    //         password: 'Welcome@2025',
    //         database: 'jobidev'
    //     });

    //  const connection = await mysql.createConnection(config);
    //  const connection = await dbInstance.getConnection();

        // const connection = instance.getConnection();

    console.log("Inside insertJobsWorkign.ts :::::::::::"+ connection);

    // const connection = await mysql.createConnection({
    //     host: 'mysql-npr-job-db-qas-10.mysql.database.azure.com',
    //     user: 'sqladmin',
    //     password: 'Welcome@2025',
    //     database: 'jobi-qa'
    // });


    const insertJobQuery = `
    INSERT INTO external_openings (title, slug, type, address, currency,expertise,experience,category_id, description, salary_type,company_name,salary_range,short_description, meta, scrapped_info)
    VALUES (?, ?, ?, ?,?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?)
`;
    //collect slug from the DB
    const getSlugQuery = `SELECT slug FROM external_openings`;
    const [queryResult] = await connection.execute(getSlugQuery);

    //collect all the slug from all the jobs
    // const slugfromJobs = await processHref(job.job_detail, job.name);
    // console.log("slugfromJobs: " + slugfromJobs);

    // for (const job of jobs) {
        const slug = processHref(job.job_detail, job.name);
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
            const details = job.details.split('*').map(detail => detail.trim());
            const typeStr = details[1].charAt(0).toUpperCase() + details[1].slice(1);
            const type = formatJobType(typeStr);

            const address = details[0];
            const experience = details[details.length - 1];
            //wright the mapping logic for the experience
            const salaryRange = await extractSalaryRange(job.details);
            const is_remote = details[1].toLocaleLowerCase().includes("remote") ? true : false;
            const metadata = JSON.stringify({
                "is_remote": is_remote,
                "company_logo": job.logo,
                "apply_type": {
                    "value": job.apply_href
                },
                "job_detail": job.job_detail,
                "company_url": job.company_url
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
                "experience": job.details,
                "category_id": category_id,
                "description": job.description,
                "salary_type": "Monthly",
                "company_name": job.name,
                "salary_range": salaryRange,
                "short_description": job.shortdesc,
                "country": [],
                "state": [],
                "meta": {
                    "is_remote": is_remote, // if not-remote-> [country]
                    "company_logo": job.logo,
                    "apply_type": {
                        "value": job.apply_href // check and replace with the correct value
                    },
                "detail_link": job.details //need to be updated
                }
            });

            //curreny logic needs to be implemented 
            //category_id - needs to be fetched from DB - table name ?
            const [result]: any = await connection.execute(insertJobQuery, [job.jobTitle, slug, type, address, "USD", "Intermediate", experience, category_id, job.description, "Monthly", job.name, salaryRange, job.shortdesc, metadata, scrapped_info]);
            console.log(`Inserted job with ID ${result.insertId}`);
        }

    // }
    //store  restult id in - location table 
    // await connection.end();
}

async function main() {
        console.log('Inserting job details into the database...');
        const filePath = 'C:/Users/Vikas.kumar4/Downloads/TestData/jobDetailWith1Company.json';
        const jobs = await readJobsFromFile(filePath);
        
        //collect all the slug from all the jobs
        const slugfromJobs = jobs.map(job => `'${processHref(job.job_detail, job.name)}'`).join(',');
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

main().catch(console.error);
