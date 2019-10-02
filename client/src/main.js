import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css'

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

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
