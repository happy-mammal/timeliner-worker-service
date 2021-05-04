![Heroku](https://heroku-badge.herokuapp.com/?app=heroku-badge)
# timeliner-worker-service
This is a worker service for the TimeLiner application. It collects, and filters the data from external API service and store it in the database as well as manages it and serves as first level source/data provider on which the TimeLiner GraphQL API depends.

## Functions / Tasks
  - Executes the script based on cron scheduling.
  - Fetches the data for specified category from Gnews API.
  - Filters the data as per the custom requirements.
  - Restructures the json object with custom data added to it.
  - Manages the firestore document size and pushes the indexes(helful in serching) of the data in the document(termed as store).
  - Pushes the indexed data to the firebase realtime database.
  - Automatiic creation and updation of new firestore document(termed as store) when no enough space is avaiable.

## Implementations
  - Firebase Admin SDK (firebase-admin)
  - HTTP Requests (node-fetch) 
  - Cron Job /Scheduling (node-cron)
  - Firestore-Size (firestore-size)
  - Used Enviroment Variables where ever possible (dotenv)

## Where to use ? 
You can use this if you want to: 
  - Fetch and store the data from an external API to Firebase Realtime Database / Firestore (Using Admin SDK).
  - Modifiy the data and restructure the json object as per your need.
  - Reduce the firestore read/writes/deletes.
  - Manage and use firestore efficiently for a longer period.
  - Execute the scripts/functions at scheduled intervals.

## Folder Structure
  ```
.
├── config
│   └── config.js
├── utils
│   ├── keywordsGenerator.js
│   └── queryDateGenerator.js
├── .env
├── .gitignore
├── app.js
├── LICENSE
├── package-lock.json
├── package.json
├── Procfile
├── README.md
└── script.js
  ```
 
## Techs Used
 - Firesbase
 - Node.js
 - Heroku
 - GNews API

## License
 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png" width="200" height="100"/>
