//Generating Query Dates
function qdg  (d,dtype){ // Passing Date obejct and date type

var hrs = d.getUTCHours(); //UTC Hours HH
var min = d.getUTCMinutes(); //UTC Minutes MM
var sec = d.getUTCSeconds(); //UTC Seconds SS

var pastHrs = hrs-2; //Gettings -2 Hours UTC from current
var toHrs = hrs-1;

var year = d.getUTCFullYear(); // UTC Full year YYYY
var month = d.getUTCMonth()+1; //UTC Full month MM+1 correction
var date = d.getUTCDate(); // UTC date DD

month = month<10?'0'+month:month; //Handeling prefix 0
date =  date<10?'0'+date:date; //Handeling prefix 0

sec = sec<10 || sec==0?'0'+sec:sec; //Handeling prefix 0
hrs = hrs<10 || hrs==0?'0'+hrs:hrs; //Handeling prefix 0
min = min<10 || min==0?'0'+min:min; //Handeling prefix 0

pastHrs = pastHrs<10 || pastHrs==0?'0'+pastHrs:pastHrs //Handeling prefix 0
toHrs = toHrs<10 || toHrs==0?'0'+toHrs:toHrs //Handeling prefix 0

if(dtype==="from"){
return year+'-'+month+'-'+date+'T'+pastHrs+':'+'00'+':'+'00'+'Z'; //Final From Date ISO 8601 format
}
else if(dtype==="to"){
return year+'-'+month+'-'+date+'T'+toHrs+':'+'59'+':'+'59'+'Z'; //Final To Date ISO 8601 format
}
else if(dtype==="current"){
return year+'-'+month+'-'+date+'T'+hrs+':'+min+':'+sec+'Z'; //Final To Date ISO 8601 format    
}
else{
return undefined; //Returning Undefined Type    
}

}

module.exports ={
    qdg:qdg
}