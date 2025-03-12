import { getEnv } from '../helper/env/env';

// const dbConfig: DBConfig = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE
// };

// (async () => {
//     getEnv();
//     console.log("process.env.DB_HOST "+ process.env.DB_HOST);
    // const dbService = new DBService(dbConfig);
    // const connection = await dbService.init();
    
    // const getSlugQuery = `SELECT slug FROM external_openings`;
    // const [queryResult] = await connection.execute(getSlugQuery);

    // console.log(queryResult);

    // connection.end();
// })();
export class Sample{

    envCheck() {
        getEnv();
        const dbhost = process.env.DB_HOST;
        console.log("process.env.DB_HOST "+ dbhost);
        
    }

}

const sample = new Sample();
sample.envCheck();






