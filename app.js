//Importing Node Modules
const worker = require('./script'); //Worker module
const cron = require('node-cron'); // Cron job module

cron.schedule("0 0 */6 * * *",async ()=>{
    await worker.execute(false);    
});

//Executing Task after every scheduled 2 hrs
cron.schedule("0 0 */2 * * *",async ()=>{
    await worker.execute(true);    
});
