const firebase = require("firebase");
const fetch = require('node-fetch');
const sizeOf = require("firestore-size");
const {fbconfig,categories, stories ,domain, endpoint,apik} = require('./config');
const {qdg} = require('./queryDateGenerator');
const kwg = require('./keywordsGenerator'); 
require("firebase/firestore");

firebase.initializeApp(fbconfig);

const datastore = firebase.firestore().collection("datastore");
const database = firebase.database().ref();
var articles=[];

//WORKER FUNCTION--------------------------------------------
async function execute(isRegular){

    console.log(`\n[ LOG FOR EXECUTE GENERATED ON ${qdg(new Date(),'current')} ]`);

    console.log(`\n[SCRIPT MAIN EXECUTION STARTED]===>${qdg(new Date(),'current')}`);
    
    if(isRegular){
        for(var i=0;i<categories.length;i++){ 
        
            var category = categories[i];  
            await sleep(2000);
            await fetchDataFromGnews(category);
    
        }
    }else{
        await fetchDataFromGnews(stories);
    }
    await dumpDataToFirestore(articles,articles.length);
    await dumpDataToDatabase(articles,articles.length);
    console.log(`\n[SCRIPT MAIN EXECUTION STOPPED]===>${qdg(new Date(),'current')}`);
}

//MAIN FUNCTIONS---------------------------------------------
async function fetchDataFromGnews(category){

    let api = `${domain}${endpoint}?token=${apik}&topic=${category}&lang=en&max=10&from=${qdg(new Date(),'from')}&to=${qdg(new Date(),'to')}`;
    
    let settings = {method: 'get', dataType: 'json', headers: {'Accept': 'application/json','Content-Type': 'application/json'}};

    const response = await fetch(api,settings);

    console.log(`\nCALLED==>${api.replace(apik,'API_KEY')}`);
    
    const data = await response.json();

    console.log(`\nDATA LENGTH [${category}]==>${data.articles.length}\n`);

    for(var i=0;i<data.articles.length;i++){
            
        var c = data.articles[i];
 
        await pushToDataArray(category,c,i); 
    }

}

async function pushToDataArray(category,data,i){
    var descKeywords = await kwg.generateKeywords(await data.description);
    var titleKeywords = await kwg.generateKeywords(await data.title);
    var sets = new Set(descKeywords.concat(titleKeywords));
    var keywords = Array.from(sets);

    var jsonObject = {
        id:generateUniqueId(),
        payload:{
        title: data.title,
        description: data.description,
        content: data.content,
        url: data.url,
        image: data.image,
        publishedAt: data.publishedAt,
        source: data.source.name,
        source_url: data.source.url,
        category: category,
        keywords:keywords,
        }
    }
    
    articles.push(jsonObject);
    
}

async function dumpDataToFirestore(data,length){
    const currentDatastore = await getCurrentDatastore();
    const dstoreSize = await getDataStoreSize(currentDatastore);
    const available = 900000-dstoreSize;
    const dataSize = sizeOf(data);

    if(available<=1000){
        console.log(`NO ENOUGH SPACE AVAILABLE. CREATING NEW STORE`);
        createNewDatastore();
        dumpDataToFirestore(articles,articles.length);
    }else{
        if(dataSize<=available){
            for(var i=0;i<length;i++){
                var key = data[i].id;
                await sleep(1200);
                await datastore.doc(currentDatastore).update({
                    [`articles.${key}`]:data[i].payload,
                }).then(()=>{
                    console.log(`SUCCESS [DOC NO.]=>${i} [DOC ID.]=>${data[i].id}`);
                }).catch((err)=>{
                    console.log(`FAILURE [DOC NO.]=>${i} [ERROR.]=>${err}`);
                });
            }
            if(articles.length>length){
                articles = articles.slice(length,articles.length);
                dumpDataToFirestore(articles,articles.length);
            }
        }else{
            dumpDataToFirestore(articles,(articles.length)/2);
        }
    }
    

}

async function dumpDataToDatabase(data,length){
    
    for(var i=0;i<length;i++){
        var key = data[i].id;
        await database.child("articles").child(key).set({
            title: data[i].payload.title,
            description: data[i].payload.description,
            content: data[i].payload.content,
            url: data[i].payload.url,
            image: data[i].payload.image,
            publishedAt: data[i].payload.publishedAt,
            source: data[i].payload.source,
            source_url: data[i].payload.source_url,
            category: data[i].payload.category,
            keywords:data[i].payload.keywords
        }).then(()=>{
            console.log(`SUCCESS-->${i}`);
        }).catch((err)=>{
            console.log(`FAILED-->${i}: ${err}`);
        });
       
        }
}
//HELPER FUNCTIONS--------------------------------------------

async function getCurrentDatastore(){
    const doc = await datastore.doc("dspointer").get();
    return doc.data().current;
}

async function getDataStoreSize(current){
    const doc = await datastore.doc(current).get();
    return sizeOf(doc.data());
}

async function createNewDatastore(){
    datastore.add({
        articles:{},
    }).then((doc)=>{
        console.log(`NEW DATA STORE CREATED SUCCESSFULLY ${doc.id}`);
        datastore.doc("dspointer").update({
            current:doc.id,
            dstores:firebase.firestore.FieldValue.arrayUnion(doc.id),
        }).then(()=>{
            console.log(`NEW DATA STORE UPDATED IN DSPOINTER SUCCESSFULLY`);
        }).catch((err)=>{
            console.log(`NEW DATA STORE UPDATED IN DSPOINTER FAILED ${err}`);
        });
    }).catch((err)=>{
        console.log(`NEW DATA STORE CREATED FAILED ${err}`);
    })
}

function generateUniqueId(){
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return autoId;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//MODULE EXPORTS----------
module.exports={
    execute:execute,
}