adonis new rebuilt
echo 'Building template...'
cd rebuilt
adonis install @adonisjs/validator

npm install -S mysql2 browser-cookies dotenv-flow idle-vue vue-async-computed
npm install -D adonis-pug
vue create client -p full-featured

cd client

vue add vuetify
vue add router
npm install -D pug pug-plain-loader material-design-icons-iconfont
npm install -S axios dotenv-flow idle-vue vue-async-computed browser-cookies

cd ..
cd ..
echo 'Rebuilding customization...'
node rebuild-from-scratch.js
