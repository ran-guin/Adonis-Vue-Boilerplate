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
        router-link(:to='link.target || link.name')
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
        {name: 'About', public: true, target: '/About'},
        {name: 'Home', public: true, target: '/Public'},
        {name: 'Register', public: true, target: 'SignUp'}
      ],
      privateHeaders: [
        // {name: 'Logout', private: true},
        {name: 'Admin', private: true, access: 'admin', target: 'admin'},
        {name: 'Profile', private: true, target: '/Profile'},
        // {name: 'Data', private: true},
        {name: 'Dashboard', private: true}
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
    page: {
      type: String
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
      return this.title || config.header || ''
    },
    app_header: function () {
      return this.title || config.app_header || ''
    },
    logo: function () {
      var file = config.headerLogo || 'logo.svg'
      return 'custom/images/' + file
    },
    headerLinks: function () {
      if (this.isLoggedIn) {
        return this.privateHeaders
      } else {
        return this.publicHeaders
      }
    }
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
      if (this.page === link.name) {
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
