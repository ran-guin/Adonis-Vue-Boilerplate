<template lang='pug'>
  PageLayout(page='About')
    v-container(app dark)
      h1 About
      h3 This is a boilerplate for Adonis + View which includes:
      ul
        li(v-for='comp in components') {{comp}}

</template>

<script>  
import PageLayout from '@/layouts/PageLayout'
import Logo from '@/components/CosineLogo'

export default {
  components: {
    PageLayout,
    Logo
  },
  data () {
    return {
      animateLogo: true,
      components: [
        'Login Functionality (with default users for guest, admin)',
        'Data Search',
        'Public Page Default (when not logged in)',
        'Private Page Default (when logged in)',
        'Options for Tab navigation (for both public & private pages)',
        'CRUD Data control for Admins',
        'Admin page (when logged in as admin)'
      ]
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
