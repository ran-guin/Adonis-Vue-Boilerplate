<template lang='pug'>
  PageLayout(:title='title' :user='user' :private='true' :page='page')
    slot
</template>

<script>
import PageLayout from './PageLayout.vue'
import Authentication from '@/mixins/Authentication.vue'

import config from '@/config'

export default {
  components: {
    PageLayout
  },
  mixins: [
    Authentication
  ],
  data () {
    return {
      myAuth: {},
      claims: null,
      IdvpnAuth: true,
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
      user: null
    }
  },
  props: {
    page: {
      type: String
    },
    title: {
      type: String
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
    }
  },
  mounted: function () {
    var validated = this.auth_validate() || {}
    console.log('auth validation: ' + JSON.stringify(validated))
    this.$set(this, 'myAuth', validated)

    if (! (this.$router.path && this.$router.path.match(/[a-zA-Z]/)) ) {
      if (this.auth_status.loggedIn) {
        console.log('empty path .. redirect to dashboard')
        // this.$router.push('/dashboard')
      }
    }
  },
  created: function () {
    console.debug('generate private layout')
    const rHash = this.$store.getters.payload
    console.log('payload gotten hash: ' + JSON.stringify(rHash))
    const sHash = localStorage.getItem('payloadHash')
    console.log('HASH: ' + sHash);

    this.$store.dispatch('clearMessages')

    console.log('private payload:' + JSON.stringify(this.payload))

    this.actingAs = this.actingAs || this.payload.role

    this.checkPayload()

    if (this.underConstruction) {
      console.log('redirect to construction page')
      this.$router.push('/Construction')
    }

    if (!this.noRefresh) {
      this.$store.dispatch('RESET_EXPIRY')
    }
  },
  computed: {
    payload: function () {
      // return this.myAuth.payload || {}
      return this.$store.getters.payload || {}
    },
    isLoggedIn: function () {
      return this.payload && this.payload.loggedIn || false
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
    currentRole () {
      return this.actingAs
    }
  },
  methods: {
    async logout () {
      console.debug('idvpn logout...')
      this.myAuth = this.auth_logout() || {}
    },
    checkPayload: function () {
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
          // this.$router.push('/')
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
      console.log('payload updated in layout')
      this.checkPayload()
    },
    isLoggedIn: function () {
      console.debug('login status changed in private layout to ' + this.isLoggedIn)
      if (this.isLoggedIn) {
        // this.$router.push('/dashboard')
      } else {
        // this.$router.push('/public')
      }
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
