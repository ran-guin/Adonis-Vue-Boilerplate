<template lang='pug'>
  div.insideFooter(app dark)
    div(style='float: left; display: flex; height: 100%')
      b.midline Social Platform Affecting Real Connections
    div(style='float: right; display: flex; flex-direction: row; height: 100%')
      i.midline.minitext() powered by: &nbsp; &nbsp;
      a.midline.footer-logo(v-on:click="$router.push('/Home')")
        Logo(theme='dark' height='50' :animate='false')

</template>

<script>
import Logo from '@/components/CosineLogo'

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

.midline {
  display: flex;
  align-items: center;
}
.minitext {
  font-size: 12px;
}
</style>