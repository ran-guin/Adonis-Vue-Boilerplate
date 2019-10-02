<template lang='pug'>
  div.insideFooter()
    b Social Platform Affecting Real Connections
    Logo(style='float: right')
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