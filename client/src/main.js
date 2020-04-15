import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

import RGV from '@ran-guin/vue-components';

import myConsole from '@ran-guin/vue-components/src/services/myConsole.js';
import myString from '@ran-guin/vue-components/src/services/myString.js';
import myCrypt from './services/aes_encryption.js';
import dbGet from './services/dbGet.js';

// import 'material-design-icons-iconfont/dist/material-design-icons.css'
// import AsyncComputed from 'vue-async-computed'

import axios from 'axios'
import IdleVue from 'idle-vue'
import Config from '@/config.js'

import cookies from 'browser-cookies'

import '@/assets/default/css/text_sizing.css'
import '@/assets/default/css/colour_theme.scss'
import '@/assets/default/css/Tab_settings.scss'
import '@/assets/default/css/transition.css'
import '@/assets/default/css/colours.css'
import '@/assets/default/css/page.css'

// Usually customized:
import '@/assets/default/css/components.css'
import '@/assets/default/css/custom_colours.css'
import '@/assets/default/css/custom.css'

// Custom Files:
import '@/assets/custom/css/colours.css'

const key = Config.CLIENT_ID
Vue.config.productionTip = false

var timeoutMinutes = Config.idleTimeOut || 10 // manage from config file

import "leaflet/dist/leaflet.css"
import "leaflet/dist/leaflet.js"

Vue.use(RGV)
const plugin = {
    install () {
        Vue.myConsole = myConsole
        Vue.prototype.$myConsole = myConsole

        Vue.myString = myString
        Vue.prototype.$myString = myString

        Vue.myCrypt = myCrypt
        Vue.prototype.$myCrypt = myCrypt

        Vue.dbGet = dbGet
        Vue.prototype.$dbGet = dbGet
    }
}
Vue.use(plugin)

const eventsHub = new Vue()
Vue.use(IdleVue, {
  eventEmitter: eventsHub,
  idleTime: timeoutMinutes * 1000 * 60
})

const authStorage = 'local'
console.log('Auth: ' + authStorage)
if (authStorage === 'local') {
  const tokens = JSON.parse(localStorage.getItem('user-tokens') || '{}')
  const token = tokens[key]
  console.log('token: ' + token)
  if (token) {
    var pass = 'Bearer ' + token
    axios.defaults.headers.common['Authorization'] = pass
    console.log('using auth token: ' + pass)
  } else {
    console.log('no initial token (? .. okay prior to login)')
  }
} else if (authStorage === 'cookie') {
  const csrf = cookies.get('XSRF-TOKEN')
  axios.defaults.headers.common['x-xsrf-token'] = csrf
  console.log('cookie token: ' + csrf)
}
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'

require('dotenv').config({path: './../.env'})
console.log('my root: ' + JSON.stringify(process.env))

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
