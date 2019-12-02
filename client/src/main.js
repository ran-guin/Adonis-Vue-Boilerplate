import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

import RGV from '@ran-guin/vue-components';
import myConsole from './services/myConsole.js';
import myString from './services/myString.js';
import myCrypt from './services/aes_encryption.js';

// import 'material-design-icons-iconfont/dist/material-design-icons.css'
// import AsyncComputed from 'vue-async-computed'

import axios from 'axios'
import IdleVue from 'idle-vue'

import cookies from 'browser-cookies'

import '@/assets/Standard/css/text_sizing.css'
import '@/assets/Standard/css/colour_theme.scss'
import '@/assets/Standard/css/Tab_settings.scss'
import '@/assets/Standard/css/transition.css'
import '@/assets/Standard/css/colours.css'
import '@/assets/Standard/css/page.css'

import '@/assets/custom/css/components.css'
import '@/assets/custom/css/colours.css'
import '@/assets/custom/css/page.css'
import '@/assets/custom/css/custom.css'

Vue.config.productionTip = false

var timeoutMinutes = 5 // manage from config file

Vue.use(RGV)
const plugin = {
    install () {
        Vue.myConsole = myConsole
        Vue.prototype.$myConsole = myConsole

        Vue.myString = myString
        Vue.prototype.$myString = myString

        Vue.myCrypt = myCrypt
        Vue.prototype.$myCrypt = myCrypt
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
  const token = localStorage.getItem('user-token')
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
