# timeliner-worker-service
This is a worker service for the TimeLiner application. It collect, ,filter, store, and manages the data into the database and provide the service at core level.

## Functions / Tasks
  - Executes a script function based on cron scheduling.
  - Fetchs the data for specified category from Gnews API.
  - Filters the data as per the custom requirements.
  - Restructures the json object with custom data added to it.
  - Manages the firestore document size and pushes the indexes of the data in the document.
  - Pushes the indexed data to the firebase realtime database.
  - Creation and updation of new firestore document when no enough space is avaiable.

## Implementations
  - Firebase Admin SDK
  - HTTP Requests 
  - Cron Job /Scheduling
  - Firestore-Size

## Where to use ? 
You can use this if you want to: 
  - Fetch and store the data from an API to Firebase Realtime Database / Firestore (Using Admin SDK).
  - Modifiy the data and restructuring the json object as per your need.
  - Reduse the firestore read/writes/deletes.
  - Manage and use firestore efficiently for a long time.
  - Execute the scripts/functions at scheduled intervals.

## Folder Structure
  ```
📦timeliner_worker_service
 ┣ 📂config
 ┃ ┗ 📜config.js
 ┣ 📂utils
 ┃ ┣ 📜keywordsGenerator.js
 ┃ ┗ 📜queryDateGenerator.js
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜app.js
 ┣ 📜LICENSE
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜Procfile
 ┣ 📜README.md
 ┗ 📜script.js
  ```
 
## Techs Used
 <div id="banner" style="overflow: hidden; ">
  <div class="image-div" >
     <img src="https://img.icons8.com/color/452/firebase.png" width="100" height="100"/>
  </div>

  <div class="image-div" >
    <img src="https://seeklogo.com/images/N/nodejs-logo-FBE122E377-seeklogo.com.png" width="80" height="90"/>
  </div>

  <div class="image-div" >
    <img src ="https://cdn.iconscout.com/icon/free/png-512/heroku-5-569467.png" width="90" height="90">
  </div>
  
   <div class="image-div" >
    <img src ="https://www.programmableweb.com/sites/default/files/Logo%20%281%29_1.png" width="90" height="90">
  </div>
  <div style="clear:left;"></div>
</div>

## License
 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png" width="200" height="100"/>
