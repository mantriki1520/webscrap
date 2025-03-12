import mysql, { Connection, ConnectionOptions } from 'mysql2/promise';
import { getEnv } from '../env/env';

export type DBConfig = {
    host: string;
    user: string;
    password: string;
    database: string;
};

export class Database {
    private static instance: Database;
    private connection!: Connection;
    private connectionPromise: Promise<void>;

    private constructor(config: ConnectionOptions) {
        console.log("The config value inside constructor :::::  "+ JSON.stringify(config));
        this.connectionPromise = this.initConnection(config);
    }

    private async initConnection(config: ConnectionOptions) {
        try {
            this.connection = await mysql.createConnection(config);
            console.log('Connected to the database');
        } catch (err) {
            console.error('Error connecting to the database:', err);
        }
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            getEnv(); // Load environment variables
            const config: ConnectionOptions = {
                host: process.env.DB_HOST!,
                user: process.env.DB_USER!,
                password: process.env.DB_PASSWORD!,
                database: process.env.DB_DATABASE!
            };

            console.log("The config value is "+ JSON.stringify(config));
            Database.instance = new Database(config);
        }
        return Database.instance;
    }

    public async getConnection(): Promise<Connection> {
        await this.connectionPromise; //wait for connection ot be established
        return this.connection;
    }

    public async close(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            console.log('Database connection closed');
        }
    }
}

const instance = Database.getInstance();
console.log("Instance value is  :::: "+ instance);
// const conn = instance.getConnection();
// console.log("conn value is  :::: "+ conn);
export { instance };
