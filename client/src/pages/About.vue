<template lang='pug'>
  PageLayout()
    v-container
      h1 This is a boilerplate for Adonis + View with:
      ul
        li
          router-link(to='Login') Login
        li
          router-link(to='Search') Data Search
</template>

<script>  
import PageLayout from '@/layouts/PageLayout'
export default {
  components: {
    PageLayout
  }
}
</script>
