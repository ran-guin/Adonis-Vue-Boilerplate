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
        {name: 'Supplies', public: true},
        {name: 'Register', public: true, target: 'SignUp'}
      ],
      privateHeaders: [
        // {name: 'Logout', private: true},
        {name: 'Admin', private: true, access: 'admin', target: 'admin'},
        {name: 'Supplies', private: true},
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
      if (link.access === 'admin') {
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
