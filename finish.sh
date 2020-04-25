#!/bin/bash

# client config parameters:

Cspecs=(EXTRA PLUGIN_URL PLUGIN_PORT GOOGLE_API_KEY DEBUG_MODE)

echo export default { > .env.client

for spec in "${Cspecs[@]}"
do
  echo '  ' ${spec}: '"'${!spec}'"', > .env.client
  echo '  ' ${spec}: '"'${!spec}'"'
done

echo } > .env.client

cp .env.client ./client/src/config.private.js

Sspecs=(API_KEY DB_DATABASE DB_USER DB_PASSWORD)

for spec in "${Sspecs[@]}"
do
  echo '  ' ${spec}='"'${!spec}'"', > .env.custom
  echo '  ' ${spec}= '"'${!spec}'"'
done

cp .env.client ./client/src/config.private.js
cp .env.init > .env
cat .env.custom >> .env

cd client;
# npm install;

cd ..;
# bash recompile local;
