<template lang='pug'>
  v-app-bar(app hide-on-scroll)
    div.header-logo(style='flex: 1')
      a(v-on:click="$router.push('/Home')")
        img.logo(:src='logo' height='50px')
    span(style='flex:3') {{header}} 
    v-spacer
    v-tabs(style='flex:2' right hide-slider)
      v-tab(v-for='link in headerLinks' :key='link.name')
        router-link(v-if='visible(link)' :to='link.target || link.name')
          v-btn.btn-primary(v-if='linkType === "button"') {{link.name}}
          span(v-else) {{link.name}}
      //- UserMenu(v-if='isLoggedIn' :logout='logout')
      v-tab
        v-btn.btn-primary(v-if='isLoggedIn' @click='call_logout()') Logout
        v-btn.btn-primary(v-else @click='call_login()') Login
</template>

<script>
import config from '@/config.js'
import UserMenu from '@/components/UserMenu.vue'

export default {
  data () {
    return {
      linkType: 'text',
      publicHeaders: [
        {name: 'About', public: true},
        // {name: 'Login', public: true},
        {name: 'Register', public: true, target: 'SignUp'}
      ],
      privateHeaders: [
        // {name: 'Logout', private: true},
        {name: 'Admin', private: true, access: 'admin', target: 'admin'},
        {name: 'Data', private: true},
        {name: 'Home', private: true}
      ]
    }
  },
  components: {
    UserMenu
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
    authStatus: {
      type: Object,
      default () { return {} }
    }
  },
  computed: {
    isLoggedIn: function () {
      return (this.authStatus && this.authStatus.loggedIn)
    },
    header: function () {
      return this.title || config.header || ''
    },
    logo: function () {
      var file = config.headerLogo || 'logo.svg'
      return 'images/' + file
    },
    headerLinks: function () {
      if (this.authStatus && this.authStatus.loggedIn) {
        return this.privateHeaders
      } else {
        return this.publicHeaders
      }
    },
    // authStatus: function () {
    //   return this.$store.getters.authStatus || {}
    // }
  },
  methods: {
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
      if (link.access === 'admin') {
        return (this.authStatus.access === 'admin')
      } else {
        return true
      }
    }
  },
  watch: {
    authStatus: function () {
      console.log('New authStatus: ' + JSON.stringify(this.authStatus))
    }
  }
}
</script>
<style>
.v-toolbar__content {
  align-items: center;
}
</style>
