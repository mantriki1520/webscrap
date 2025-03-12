export { };

declare global{

namespace NodeJS{

    interface ProcessEnv{

        BROWSER:"chrome"|"firefox"|"webkit",
        ENV:"staging"|"dev"|"test",
        BASEURL:string,
        DB_HOST:string,
        DB_USER:string,
        DB_PASSWORD:string,
        DB_DATABASE:string,
        HEAD:"true"|"false",
        NODE_TLS_REJECT_UNAUTHORIZED: number,
        OPENAI_API_KEY:string   

    }


}

}
