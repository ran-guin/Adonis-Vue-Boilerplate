adonis new rebuilt
echo 'Building template...'
cd rebuilt
npm install -S mysql2 dotenv-flow idle-vue vue-async-computed browser-cookies
npm install -D adonis-pug
vue create client -d

cd client

vue add vuetify
vue add router
npm install -S axios
npm install -D pug pug-plain-loader

cd ..
cd ..
echo 'Rebuilding customization...'
node rebuild-from-scratch.js
