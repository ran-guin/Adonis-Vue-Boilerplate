<template lang='pug'>
  PageLayout()
    v-container(app dark)
      h1 About
      h3 This is a boilerplate for Adonis + View with:
      ul
        li
          router-link(to='Login') Login
        li
          router-link(to='Search') Data Search
      hr
      img.logo(src='@/assets/images/sine.svg' height='300px')
      hr
      p &nbsp;
      Logo

</template>

<script>  
import PageLayout from '@/layouts/PageLayout'
import Logo from '@/components/Logo'

export default {
  components: {
    PageLayout,
    Logo
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
