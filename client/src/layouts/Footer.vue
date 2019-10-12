<template lang='pug'>
  div.insideFooter(app dark)
    b Social Platform Affecting Real Connections
    div.footer-logo(style='float: right')
      b powered by &nbsp;
        a(v-on:click="$router.push('/Home')")
          img.logo(src='@/assets/images/cosine.logo.png' height='80px')

</template>

<script>
import Logo from '@/components/Standard/Logo'

export default {
  components: {
    Logo
  }
}
</script>
<style scoped>
.insideFooter {
  display: flex row;
  width: 100%;
  display: inline-block;
}
</style>