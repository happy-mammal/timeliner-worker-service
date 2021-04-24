const firebase = require("firebase");
const fetch = require('node-fetch');
const sizeOf = require("firestore-size");
const {fbconfig,categories, stories ,domain, endpoint,apik} = require('./config');
const {qdg} = require('./queryDateGenerator');
const kwg = require('./keywordsGenerator'); 
require("firebase/firestore");

firebase.initializeApp(fbconfig);

const indexstore = firebase.firestore().collection("indexes");

const database = firebase.database().ref();

var articles=[];

//WORKER FUNCTION--------------------------------------------
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
        await fetchDataFromGnews(stories);
    }
    await updateIndexAtFirestore(articles,articles.length);
    await dumpDataToDatabase(articles,articles.length);
    articles=[];
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
 
        await pushToDataArray(category,c); 
    }

}

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

//HELPER FUNCTIONS--------------------------------------------
async function getCurrentindexstore(){
    const doc = await indexstore.doc("indexpointer").get();
    return doc.data().current;
}

async function getindexstoreSize(current){
    const doc = await indexstore.doc(current).get();
    return sizeOf(doc.data());
}

async function createNewindexstore(){
    await indexstore.add({
        articles:{},
    })
    .then((doc)=>{
        console.log(`NEW INDEX STORE CREATED SUCCESSFULLY ${doc.id}`);
        indexstore.doc("indexpointer").update({
            current:doc.id,
            dstores:firebase.firestore.FieldValue.arrayUnion(doc.id),
        }).then(()=>{
            console.log(`NEW INDEX STORE UPDATED IN INDEXPOINTER SUCCESSFULLY`);
        }).catch((err)=>{
            console.log(`NEW INDEX STORE UPDATED IN INDEXPOINTER FAILED ${err}`);
        });
    }).catch((err)=>{
        console.log(`NEW INDEX STORE CREATED FAILED ${err}`);
    });
}

function generateUniqueId(){
    const chars ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 8; i++) {
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


