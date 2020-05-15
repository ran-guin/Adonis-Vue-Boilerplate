# Adonis fullstack application with Vue frontend

## Requirements:

* adonis client
* vue client

./customize

cd server;
make


cp .env.example .env
// customize .env file as required (this file is NOT stored in git)
// ensure applicable database name, user, password are defined in the .env file

npm install; // install npm modules for backend
cd client;
npm install; // install npm modules for front end

adonis key:generate // generates API_KEY in .env file

** IF database does not yet exist you must also do the following:


mysql -u name -p -e "create database yourDBname"
adonis migration:run
adonis seed --files ./database/seeds/TestSeeder.js

## Customization summary:

.env (DB_DATABASE, DB_USER, DB_PASSWORD)

> cd client/src
> git clone <plugin> custom
> bash .install.sh (copies server scripts to server side + assets & router on client side)

```
