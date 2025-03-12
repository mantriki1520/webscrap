module.exports=
{   
    default:{
    
        timeout:1800000,
        tags: process.env.npm_config_TAGS || "@regression",
        video:"off",
        paths: ["src/test/features/"],
        formatOptions:{
            snippetInterface:"async-await"
        },
        
        require:["src/test/steps/*.ts",
    "src/hooks/hooks.ts"
   
],
        requireModule:["ts-node/register"],
       format: [
        "html:test-result/report/cucumber-report.html",
        "json:test-result/report/cucumber-report.json"
    
    ],
    parallel:2
  }

  


}
