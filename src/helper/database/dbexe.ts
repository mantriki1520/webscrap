import { instance as dbInstance } from './Database'; // Adjust the path as necessary

export class Sample{
    
    async envCheck(){
        console.log(" INSTANCE VALUE IS ::::: "+dbInstance);
        const connection = await dbInstance.getConnection(); // Get the connection from the Database instance

        console.log(" Connection is ::::::::: "+ connection);
        const getSlugQuery = `SELECT slug FROM external_openings`;
        try {
            const [queryResult] = await connection.execute(getSlugQuery);
            console.log(queryResult);
        } catch (err) {
            console.error('Error executing query:', err);
        } finally {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

const sample = new Sample();
sample.envCheck();







