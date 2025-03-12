import { promises as fs } from 'fs';
import mysql from 'mysql2/promise';


const extractSalaryRange = (jobString: string): string | null => {
   const salaryRegex = /\$\d+K\s*-\s*\$\d+K/;
   const match = jobString.match(salaryRegex);
 
   return match ? match[0] : null;
 };


async function main() {

    const connection = await mysql.createConnection({
           host: 'localhost',
           user: 'root',
           password: '',
           database: 'localdb_1'
       });

       const getSlugQuery = `SELECT slug FROM external_openings`;
       const [queryResult] = await connection.execute(getSlugQuery);
       console.log(queryResult);

      const searchValue = 'yc-xyzltd-1234';

      const exists = (queryResult as any[]).some((row: any) => row.slug === searchValue);

      if (exists) {
         console.log(`The value '${searchValue}' exists in the query results.`);
      } else {
         console.log(`The value '${searchValue}' does not exist in the query results.`);
      }
   // const jobs=["San Francisco, CA, US* fulltime* $140K - $220K* 0.50% - 2.00%* Any (new grads ok)",
   //    "New York, NY, US* fulltime* Visa Required* $130K - $175K* 0.25% - 0.50%* Any (new grads ok)",
   //    "IN / Remote (IN)* fulltime* $20K - $30K* Any (new grads ok)",
   //    "Remote (US)* fulltime* Visa Required* $40K - $75K* 0.01% - 0.05%* Any (new grads ok)",
   //    "IN / Remote (IN)* fulltime* Visa Required* $15K - $25K* Any (new grads ok)",
   //    "San Francisco, CA, US* fulltime* $120K - $180K* 0.20% - 1.50%* 3+ years",
   //    "San Francisco, CA, US* Contract* $120K - $180K* 0.20% - 1.50%* Any (new grads ok)"
   // ];

   // jobs.forEach(job => {
   //    const jobArray = job.split('*').map(detail => detail.trim());
   //    const location = jobArray[0];
   //    const type = jobArray[1];
   //    const experience = jobArray[jobArray.length - 1];
   //    const salaryRegex = /\$\d+K\s*-\s*\$\d+K/;
   //    const salaryRange = extractSalaryRange(job);

      
   //    console.log(`Location: ${location}`);
   //    console.log(`Type: ${type}`);
   //    console.log(`Experience: ${experience}`);
   //    console.log(`Salary Range: ${salaryRange}`);
   //    console.log("====================================");
     

   // });
   await connection.end();
   
}

main().catch(console.error);
