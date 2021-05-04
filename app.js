//Importing Node Modules
const worker = require('./script'); //--> Importing the script for using the worker.
const cron = require('node-cron'); //--> Using node-cron for scheduling the executions.

//Scheduling worker to fetch every 6 hours articles/data
cron.schedule("0 0 */6 * * *",async ()=>{
    await worker.execute(false);    
});

///Scheduling worker to fetch every 2 hours articles/data
cron.schedule("0 0 */2 * * *",async ()=>{
    await worker.execute(true);    
});