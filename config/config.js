//Importing Modules
const dotenv = require('dotenv'); //-->For working with envirnoment variables
const admin = require("firebase-admin");//--> Firebase admin sdk for working with firebase as admin app with serivce-account
//Using the config method of dotenv module to load .env file contents/variables
dotenv.config();

//Using initializeApp method to initialize firebase app instance with admin credentials
admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.TYPE,
        "project_id": process.env.PROJECT_ID,
        "private_key_id": process.env.PRIVATE_KEY_ID,
        "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.CLIENT_EMAIL,
        "client_id": process.env.CLIENT_ID,
        "auth_uri": process.env.AUTH_URI,
        "token_uri": process.env.TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
}),
    databaseURL: process.env.DATABASE_URL,
    databaseAuthVariableOverride:{
        uid: process.env.SERVICE_ACCOUNT_UID
    },
});

//Categories to be fetched every 2 hours
const categories = [process.env.C0,process.env.C1,process.env.C2,process.env.C3,process.env.C4,process.env.C5,process.env.C6,process.env.C7];
//Category to be fetched every 6 hours
const cat = process.env.C8;

//API provider domain name
const domain = process.env.DOMAIN;
//API end point
const endpoint = process.env.END_POINT;
//API KEY
const apik = process.env.API_KEY;

module.exports ={
    categories:categories, //--> Exporting categories
    cat:cat, //-->Exporting category
    domain:domain, //-->Exporting API provider domain name
    endpoint:endpoint, //-->Exporting API endpoint for requests
    apik:apik //-->Exporting API KEY
}

