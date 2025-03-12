const report = require("multiple-cucumber-html-reporter");

var date=new Date();

var currentDate=date.getDate()+'_'+(date.getMonth()+1)+'_'+date.getFullYear()+'_'+date.getHours()+'_'+date.getMinutes()+'_'+date.getSeconds()+'_'+date.getMilliseconds();


report.generate({
  jsonDir: "./test-result/report/",
  reportPath: "./test-result/report/",
  metadata: {
    browser: {
      name: "chrome",
      version: "129",
    },
    device: "Local test machine",
    platform: {
      name: "window",
      version: "11",
    },
  },
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "" },
      { label: "Release", value: "sprint0" },
      { label: "Cycle", value: "1" },
      { label: "Execution Start Time", value: currentDate},
      { label: "Execution End Time", value: currentDate },
    ],
  },
});
