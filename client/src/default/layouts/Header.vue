<template lang='pug'>
  v-app-bar(app hide-on-scroll)
    div.header-logo(style='flex: 1')
      a(v-on:click="$router.push('/Home')")
        img.logo(:src='logo' height='50px')
    span.wideScreen(style='flex:3') {{header}} 
    span.narrowScreen(style='flex:3') {{app_header}} 
    v-spacer
    v-tabs(style='flex:2' right hide-slider)
      v-tab(v-for='link in headerLinks' v-if='visible(link)' :key='link.name')
        router-link(:to='link.target || "/" + link.name')
          v-btn.btn-primary(v-if='linkType === "button"') {{link.name}}
          span(v-else) {{link.name}}
      //- UserMenu(v-if='isLoggedIn' :logout='logout')
      v-tab(v-if='loginEnabled && isLoggedIn')
        v-btn.btn-primary(@click='call_logout()') Logout
      v-tab(v-if='loginEnabled && !isLoggedIn')
        v-btn.btn-primary(@click='showLoginPage') Login
    v-dialog(v-model='showLogin' max-width='500px')
      Login(:onCancel='cancelLogin' :onRegister='showRegistrationPage')
    v-dialog(v-model='showRegistration' max-width='500px')
      Register(:onCancel='cancelRegistration' :onLogin='showLoginPage')
</template>

<script>
import config from '@/config.js'
import UserMenu from '@/components/UserMenu.vue'
import Login from '@/default/components/Login.vue'
import Register from '@/default/components/Register.vue'

const publicLinks = config.public
const privateLinks = config.private

export default {
  data () {
    return {
      linkType: 'text',
      publicHeaders: [],
      privateHeaders: [],
      loginEnabled: config.login || false,
      showLogin: false,
      showRegistration: false
    }
  },
  components: {
    UserMenu,
    Login,
    Register
  },
  props: {
    // isLoggedIn: {
    //   type: Boolean,
    //   default: false
    // },
    login: {
      type: Function
    },
    logout: {
      type: Function
    },
    title: {
      type: String
    },
    page: {
      type: String
    }
  },
  created: function () {
    var link

    var pages = Object.keys(publicLinks)
    for (var i = 0; i < pages.length; i++) {
      link = publicLinks[pages[i]] || false
      if (link.constructor === String) {
        console.log(pages[i] + ' linked to ' + link)
        this.publicHeaders.push({name: pages[i], target: link})
      } else if (link) {
        this.publicHeaders.push({name: pages[i]})
      } else {
        console.log(pages[i] + ' turned off')
      }
    }

    pages = Object.keys(privateLinks)
    for (var j = 0; j < pages.length; j++) {
      link = privateLinks[pages[i]] || false
      if (link.constructor === String) {
        console.log(pages[j] + ' linked to ' + link)
        this.privateHeaders.push({name: pages[j], target: link})
      } else if (link) {
        this.privateHeaders.push({name: pages[j]})
      } else {
        console.log(pages[j] + ' turned off')
      }
    }
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    },
    isLoggedIn: function () {
      if (this.payload && this.payload.userid) {
        return true
      } else {
        return false
      }
    },
    header: function () {
      return this.title || config.header.desktop || ''
    },
    app_header: function () {
      return this.title || config.header.mobile || ''
    },
    logo: function () {
      var file = config.header.logo
      if (file) {
        return 'custom/images/' + file
      } else {
        return null
      }
    },
    headerLinks: function () {
      var links = []
      if (this.isLoggedIn) {
        links = this.privateHeaders
        console.log('use private headers: ' + JSON.stringify(links))
      } else {
        links = this.publicHeaders
        console.log('use public headers: ' + JSON.stringify(links))
      }
      console.log('Header: ' + JSON.stringify(links))
      return links
    }
  },
  methods: {
    showLoginPage: function () {
      this.showLogin = true
      this.showRegistration = false
    },
    showRegistrationPage: function () {
      this.showLogin = false
      this.showRegistration = true
    },
    cancelLogin: function () {
      this.showLogin = false
    },
    cancelRegistration: function () {
      this.showRegistration = false
    },
    call_login: function () {
      if (this.login) {
        console.log('call supplied login method...')
        this.login()
      } else {
        console.debug('no login function supplied...')
      }
    },
    call_logout: function () {
      if (this.logout) {
        this.logout()
      } else {
        console.debug('no login function supplied')
      }
    },
    visible: function (link) {
      if (!link) {
        console.log('link not supplied')
        link = {}
      }

      if (this.page === link.name) {
        return false
      } else if (this.page === link.page) {
        return false
      } else if (link.access === 'admin') {
        return (this.payload.access === 'admin' || this.payload.role === 'Admin')
      } else {
        return true
      }
    }
  },
  watch: {
    payload: function () {
      console.log('Payload changed in header: ' + JSON.stringify(this.payload))
      if (!this.payload.userid) {
        this.$router.push('/Public')
      }
    }
  }
}
</script>
<style>
.v-toolbar__content {
  align-items: center;
}
</style>
