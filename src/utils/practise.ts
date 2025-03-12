import { getEnv } from "../helper/env/env";
// import * as dotenv from 'dotenv';
// dotenv.config({ path: '.env.qa' });
export class FetchConfigData {
 
    private static fetchConfigData: FetchConfigData;
 
    private FetchConfigData() {
 
 
    }
 
    public static getInstance(): FetchConfigData {
 
        if (!FetchConfigData.fetchConfigData) {
 
            FetchConfigData.fetchConfigData = new FetchConfigData();
        }
        return this.fetchConfigData;
    }
 
    printEnvVariables() {
     getEnv();
        const myEnv = process.env.DB_USER;
        console.log(`I am on env:- ${myEnv}`);
    }
 
 
}
 
FetchConfigData.getInstance().printEnvVariables();
