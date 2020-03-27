<template lang='pug'>
  PageLayout(page='Public')
    v-container(app dark)
      h1 Default Public Home Page
      h3 This is a boilerplate for Adonis + View which includes:
      ul
        li(v-for='comp in components') {{comp}}

</template>

<script>  
import PageLayout from '@/default/layouts/PageLayout'
import Config from '@/config.js'

export default {
  components: {
    PageLayout
  },
  data () {
    return {
      components: [
        'Login Functionality (with default users for guest, admin) [status: ' + Config.loginRequired,
        'Data Search [see config.js for default links] ',
        'Public Page Default (Home) (when not logged in)',
        'Private Page Default (Dashboard) (when logged in)',
        'Options for Tab navigation (for both public & private pages)',
        'CRUD Data control for Admins',
        'Admin page (when logged in as admin)'
      ]
    }
  },
  created: function () {
    if (this.payload && this.payload.userid) {
      if (this.$router.path) {
        console.log('path: ' + this.$router.path)
      } else {
        console.log('redirect to dashboard if the path is empty')
        this.$router.push('/dashboard')
      }
    }
  },
  methods: {
    dval: function (offset) {
      if (offset === 10) {
        return "M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80"
      } else {
        return "M90 80 C 120 10, 145 10, 175 80 S 230 150, 260 80"
      }
    }
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    }
  }
}
</script>
<style>
  .small { font: italic 13px sans-serif; }
  .heavy { font: bold 30px sans-serif; }

  /* Note that the color of the text is set with the    *
    * fill property, the color property is for HTML only */
  .Rrrrr { font: italic 40px serif; fill: red; }
</style>
