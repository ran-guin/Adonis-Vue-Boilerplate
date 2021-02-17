<template lang='pug'>
  v-app()
    Header.myHeader(:title='title' :login='login' :page='page' :logout='logout')
    div.myBody
      hr.std-colour
      v-container(app)
        slot
    Footer.myFooter.dark(:payload='payload')
</template>

<script>
import Header from './Header.vue'
import Footer from './Footer.vue'

import Authentication from '@/default/mixins/Authentication.vue'

import config from '@/config'

export default {
  components: {
    Header,
    Footer
  },
  mixins: [
    Authentication
  ],
  data () {
    return {
      myAuth: {},
      currentUser: '',
      accessTokenExpired: false,
      underConstruction: false,
      darkTheme: true,
      test: false,
      public: [
        '/AboutUs',
        '/FAQs',
        '/ContactUs',
        '/Login',
        '/Register',
        '/SignUp',
        '/Recover'
      ],
      /* Nav variable: */
      actingAs: '',
      path: ['Home'],
      apiURL: config.apiURL[process.env.NODE_ENV],
      user: ''
    }
  },
  onIdle () {
    this.auth_logout('timeout')
  },
  onActive () {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log('... idle-vue monitoring status as active: ' + timestamp)
  },
  props: {
    title: {
      type: String
    },
    loggedIn: {
      type: Object
    },
    mode: {
      type: String
    },
    redirect: {type: Function},
    interests: {type: Array},
    events: {type: Array},
    invites: {type: Array},
    noMobileHeader: {
      type: Boolean,
      default: false
    },
    noFooter: {
      type: Boolean
    },
    noHeader: {
      type: Boolean
    },
    noRefresh: {
      // Refresh token automatically unless excluded specifically
      type: Boolean
    },
    noLogin: {
      type: Boolean
    },
    private: {
      type: Boolean,
      default: false
    },
    page: {
      type: String
    }
  },
  mounted: function () {
    const idvpn = window.localStorage.getItem('idvpn')
    console.debug('checked for idvpn cache: ' + JSON.stringify(idvpn))

    this.auth_validate()
  },
  created: function () {
    this.$store.dispatch('clearMessages')
    console.log('created with auth status: ' + JSON.stringify(this.authorization_status))
    console.log('page layout payload: ' + JSON.stringify(this.payload))
    this.checkPayload()

    if (this.underConstruction) {
      this.$router.push('/Construction')
    }

    if (!this.noRefresh) {
      this.$store.dispatch('RESET_EXPIRY')
    }
  },
  computed: {
    isLoggedIn: function () {
      return this.payload && this.payload.userid
    },
    username: function () {
      return this.currentUser
    },
    pages: function () {
      if (this.payload && this.payload) {
        var role = this.payload.role
        if (role === 'guarantor') {
          return ['Verify']
        } else if (role === 'Admin' || role === 'Tester') {
          return ['Dashboard', 'Register', 'Verify']
        } else {
          return ['Dashboard', 'Register']
        }
      } else {
        return ['Home']
      }
    },
    remote: function () {
      if (this.payload && (this.payload.source === 'remote' || this.payload.role === 'proxy')) {
        return true
      } else {
        return false
      }
    },
    // loggedIn: function () {
    //   return this.payload && this.payload.userid
    // },
    payload: function () {
      return this.$store.getters.payload || {}
    },
    currentRole () {
      return this.actingAs
    }
  },
  methods: {
    login: function () {
      console.debug('direct login from public page...')
      this.auth_login()
    },
    logout: function () {
      this.auth_logout()
    },
    checkPayload: function () {
      this.actingAs = this.actingAs || this.payload.role

      if (this.payload && this.payload.status === 'expired') {
        console.log('payload expired')
        // this.$store.dispatch('logWarning', 'Session Expired - Please log in again.')
      } else if (!this.payload.userid) {
        if (this.public.indexOf(this.$route.path) >= 0) {
          console.log('allow public page access to ' + this.$route.path)
        } else if (this.mode === 'construction') {
          console.log('redirect to construction page from layout...')
          this.$router.push('/Construction')
        } else {
          console.log('path: ' + this.$route.path)
          console.log('redirect to home page from layout... ?')
        }
      }
    },
    gotoPage (page, subpage, subpage2) {
      console.log('goto page: ' + page + ' : ' + subpage)
      this.$store.dispatch('clearMessages')
      if (this.redirect && this.redirect.constructor === Function) {
        console.log('redirect to ' + page)
        this.redirect(page)
      } else {
        page = page || 'Home'
        this.path = [page]
        if (subpage) {
          this.path.push(subpage)
          this.$router.push(subpage)
        }
        if (subpage2) {
          this.path.push(subpage2)
          this.$router.push(subpage2)
        }
      }
    }
  },
  watch: {
    '$route' () {
      console.log('route changed .. reload data')
      this.checkPayload()
      // this.reloadData()
    },
    payload: function () {
      console.log('check payload in layout')
      this.checkPayload()
    },
    isLoggedIn: function () {
      console.debug('login status changed to ' + this.isLoggedIn)
      // this.auth_validate()
      // console.log('path: ' + this.$router.path)
      // if (!this.$router.path.match(/[a-zA-Z]/)) {
      //   if (this.isLoggedIn) {
      //     console.log('redirect to dashboard for undefined path when logged in?')
      //     // this.$router.push('/dashboard')
      //   } else {
      //     console.log('redirect to public for undefined path when NOT logged in?')
      //     // this.$router.push('/public')
      //   }
      // }
    },
    updates: function () {
      console.log('update docs for layout')
      // this.reload()
    }
  }
}
</script>

<style lang="scss">
.mainMenuBar {
  width: 100%;
  height: 100%;
  // background-color: #eee;
}
.mainMenu {
  padding-right: 5rem;
  // background-color: #eee;
}

/*** Customize Header / Footer Settings: ***/
$header-height: 64px;
$subheader-height: 0px;
$min-height: 300px;
$footer-height: 100px;

$header-background-colour: white;
$body-background-colour: white;
$subheader-background-colour: white;
$footer-colour: #39a;
$footer-background: darkblue;
$footer-hover-colour: white;

$header-colour: grey;
$subheader-colour: grey;
$body-colour: black;
$footer-colour: #ccc;

$header-padding: 0px;
$footer-padding: 20px;

.page {
  /*margin-top: -20px;*/
  height: 100%;
  width: 100%;
}

.myHeader {
  color: $header-colour;
  // background-color: $header-background-colour;
  padding: $header-padding;
  // font-size: $header-font-size; // leaks into signup modal
}

.insideFooter {
  padding: $footer-padding;
  width: 100%;
}

.mySubheader {
  // background-color: $subheader-background-colour;
  width: 100%;
  z-index: 1;
}

img.bgimg {
  z-index: -10;
  /* Set rules to fill background */
  // min-height: 100rem;
  /*min-width: 1024px;*/
  /*background-image: url("/static/images/teapour.jpeg");*/
/* Center and scale the image nicely */

  // background-image: url('/static/images/sparc/alone-sunset.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  /*background-color: rgba(255, 255, 0, 0.3);*/

  opacity: 20%;

  /* Set up proportionate scaling */
  width: 100%;
  height: auto;

  /* Set up positioning */
  position: absolute;
  // top: $header-height;
  top: calc(#{$header-height} + #{$subheader-height});
  left: 0;
}

.full-screen {
  width: 100%;
  height: 100%;
}
.overlay {
  position: absolute;
}
.tabBar {
  text-align: center;
}

/* Responsive - mobile first */

.mySubheader {
  height: $subheader-height;
}
.myFooter {
  position: fixed;
  bottom: 0;
  height: $footer-height;
  // background-color: $footer-background;
  // color: $footer-colour;
}

/*
@media screen and (min-width: 768px) {
  .myBody {
    min-height: $min-height;
    // min-height: calc(100vh - #{$header-height} - #{$subheader-height} - #{$footer-height});
  }
  .myHeader {
    height: $header-height;
  }
  .mySubheader {
    height: $subheader-height;
  }
  .myFooter {
    height: $footer-height;
  }
}
*/

/*
//Height Adjustment
@media screen and (min-height: calc(#{$min-height} + #{$header-height} + #{$subheader-height} + #{$footer-height})) {
  .myBody {
    min-height: calc(100vh - #{$subheader-height} - #{$footer-height});
  }
}
*/

.myBody {
  // min-height: 300px;
  // min-height: calc(100vh - #{$header-height} - #{$footer-height});
  min-height: calc(100vh - #{$footer-height});
  margin: 0px;
  width: 100%;
  padding: 0px;
  position: absolute;
  top: 0;
  padding-bottom: $footer-height; // only when footer is fixed...
  // background-color: teal;
  // color: lightgrey;
}

@media screen and (max-height: 590px) {
  .imgBody {
    min-height: 300px;
  }
  .myBody {
    min-height: 300px;
  }
}

.myHeaderContent {
  padding: 0px;
  display: flex;
}

.header-section {
  flex: 1;
  text-align: left;
  padding: 1rem;
}
</style>
