const fetch = require('node-fetch'); //--> Using node-fetch module for making API requests 
const sizeOf = require("firestore-size"); //--> Using firestore-size module to check document size & data size 
const admin = require("firebase-admin");//--> Firebase admin sdk for working with firebase as admin app with serivce-account
const {categories, cat ,domain, endpoint,apik} = require('./config/config'); //--> Using node-fetch module for making API requests 
const {qdg} = require('./utils/queryDateGenerator'); //--> Using utility to generate required dates in ISO ISO 8601 format and 
const kwg = require('./utils/keywordsGenerator'); //--> Using utility to generate keywords from title and description 

//Creating firestore instance and collection
const indexstore = admin.firestore().collection("indexes");

//Creating realtime database instance and reference
const database = admin.database().ref();

//Initializing empty array of articles for storage
var articles=[];

//Execute function(This is the main worker function which gets executed).
async function execute(isRegular){

    console.log(`\n[ LOG FOR EXECUTE GENERATED ON ${qdg(new Date(),'current')} ]`);

    console.log(`\n[SCRIPT MAIN EXECUTION STARTED]===>${qdg(new Date(),'current')}`);

    if(isRegular){
        for(var i=0;i<categories.length;i++){ 
            var category = categories[i];  
            await sleep(1000);
            await fetchDataFromGnews(category);
        }
    }else{
        await fetchDataFromGnews(cat);
    }
    await updateIndexAtFirestore(articles,articles.length);
    await dumpDataToDatabase(articles,articles.length);
    articles=[];
    console.log(`\n[SCRIPT MAIN EXECUTION STOPPED]===>${qdg(new Date(),'current')}`);
}
//Fetch Data From Gnews(This function makes request to the api endpoint for the specified category).
async function fetchDataFromGnews(category){

    let api = `${domain}${endpoint}?token=${apik}&topic=${category}&lang=en&max=10&from=${qdg(new Date(),'from')}&to=${qdg(new Date(),'to')}`;
    
    let settings = {method: 'get', dataType: 'json', headers: {'Accept': 'application/json','Content-Type': 'application/json'}};

    const response = await fetch(api,settings);

    console.log(`\nCALLED==>${api.replace(apik,'API_KEY')}`);
    
    const data = await response.json();

    console.log(`\nDATA LENGTH [${category}]==>${data.articles.length}\n`);

    for(var i=0;i<data.articles.length;i++){
            
        var c = data.articles[i];
 
        await pushToDataArray(category,c); 
    }

}
//Push To Data Array(Pushes the data in modified json format with some added data).
async function pushToDataArray(category,data){
    var descKeywords = await kwg.generateKeywords(await data.description);
    var titleKeywords = await kwg.generateKeywords(await data.title);
    var sets = new Set(descKeywords.concat(titleKeywords));
    var keywords = Array.from(sets);
    var uniqueId = await data.publishedAt.split('-').join('').split(':').join('').split('Z').join(`-${generateUniqueId()}`);
    var capitalizedCatetory = category.charAt(0).toUpperCase() + category.slice(1);
    
    var jsonObject = {
        id:uniqueId,
        payload:{
        title: data.title,
        description: data.description,
        content: data.content,
        url: data.url,
        image: data.image,
        publishedAt: data.publishedAt,
        source: data.source.name,
        source_url: data.source.url,
        category: capitalizedCatetory,
        keywords:keywords,
        }
    }

    let duplicates=0;
    
    if(articles.length===0){
        articles.push(jsonObject);
    }
    for(let i=0;i<articles.length;i++){
        if(articles[i].payload.title===data.title){
            duplicates++;
        }
    }
    if(duplicates===0){
        articles.push(jsonObject);
    }
    
    
}
//Update Index At Firestore(Creates the index for each article in firestore as well as maintains and manages the storage and creation).
async function updateIndexAtFirestore(data,length){
    const currentindexstore = await getCurrentindexstore();
    const dstoreSize = await getindexstoreSize(currentindexstore);
    const available = 900000-dstoreSize;
    const dataSize = sizeOf(data);

    if(available<=1000){
        console.log(`NO ENOUGH SPACE AVAILABLE. CREATING NEW STORE...`);
        await createNewindexstore();
        updateIndexAtFirestore(articles,articles.length);
    }else{
        if(dataSize<=available){
            for(var i=0;i<length;i++){
                var key =data[i].id;
                await sleep(500);
                await indexstore.doc(currentindexstore).update({
                    [`articles.${key}`]:data[i].payload.keywords,
                }).then(()=>{
                    console.log(`SUCCESS [INDEX NO.]=>${i} [INDEX ID.]=>${data[i].id}`);
                }).catch((err)=>{
                    console.log(`FAILURE [INDEX NO.]=>${i} [ERROR.]=>${err}`);
                });
            }

            if(articles.length>length){
                articles = articles.slice(length,articles.length);
                updateIndexAtFirestore(articles,articles.length);
            }
        }else{
            updateIndexAtFirestore(articles,(articles.length)/2);
        }
    }
    

}
//Dump Data To Database(Dumps the filtered json data of indexed articles in realtime database for storage).
async function dumpDataToDatabase(data,length){

    for(var i=0;i<length;i++){
        var key= data[i].id;
        await sleep(500);
        await database.child("articles").child(key).set({
            id: data[i].id,
            title: data[i].payload.title,
            description: data[i].payload.description,
            content: data[i].payload.content,
            url: data[i].payload.url,
            image: data[i].payload.image,
            publishedAt: data[i].payload.publishedAt,
            source: data[i].payload.source,
            source_url: data[i].payload.source_url,
            category: data[i].payload.category,
            keywords: data[i].payload.keywords
        }).then(()=>{
            console.log(`SUCCESS [ARTICLE NO.]=>${i} [ARTICLE ID.]=>${data[i].id}`);
        }).catch((err)=>{
            console.log(`FAILURE [ARTICLE NO.]=>${i} [ERROR.]=>${err}`);
        });
       
    }
}

//Get Current Index Store(A Helper function which returns the currently pointed index store which has free space).
async function getCurrentindexstore(){
    const doc = await indexstore.doc("indexpointer").get();
    return doc.data().current;
}
//Get Index Store Size(A Helper function which returns the current size of the specified document).
async function getindexstoreSize(current){
    const doc = await indexstore.doc(current).get();
    return sizeOf(doc.data());
}
//Create New Index Store(A Helper function which creates new Index store i.e document and updates the current pointer and datastores list).
async function createNewindexstore(){
    await indexstore.add({
        articles:{},
    })
    .then((doc)=>{
        console.log(`NEW INDEX STORE CREATED SUCCESSFULLY ${doc.id}`);
        indexstore.doc("indexpointer").update({
            current:doc.id,
            stores:firebase.firestore.FieldValue.arrayUnion(doc.id),
        }).then(()=>{
            console.log(`NEW INDEX STORE UPDATED IN INDEXPOINTER SUCCESSFULLY`);
        }).catch((err)=>{
            console.log(`NEW INDEX STORE UPDATED IN INDEXPOINTER FAILED ${err}`);
        });
    }).catch((err)=>{
        console.log(`NEW INDEX STORE CREATED FAILED ${err}`);
    });
}
//Generate Unique Id(A Helper function which returns unique id).
function generateUniqueId(){
    const chars ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 8; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
}
//Sleep (A Helper function for creating necessary delays between operations).
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Exporting Script
module.exports={
    execute:execute, //-->Exporting main execute function.
}


