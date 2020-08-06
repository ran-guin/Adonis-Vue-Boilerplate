<template lang='pug'>
  div.insideFooter(app dark)
    div(style='float: left; display: flex; height: 100%')
      b.midline.narrowScreen {{footer}} 
      b.midline.wideScreen {{app_footer}} 
    div(style='float: right; display: flex; flex-direction: row; height: 100%')
      i.midline.minitext() powered by &nbsp; &nbsp;
      a.midline.footer-logo(v-on:click="$router.push('/Home')")
        Logo(theme='dark' height='50' :animate='animateLogo' speed=0.4)

</template>

<script>
import Logo from '@/default/components/CosineLogo'
import config from '@/config'

export default {
  data () {
    return {
      animateLogo: false
    }
  },
  components: {
    Logo
  },
  computed: {
    footer: function () {
      return config.footer.desktop || ''
    },
    app_footer: function () {
      return config.footer.mobile || ''
    }
  }
}
</script>
<style scoped>
.insideFooter {
  display: flex row;
  width: 100%;
  display: inline-block;
}

.midline {
  display: flex;
  align-items: center;
}
.minitext {
  font-size: 12px;
}
</style>
