<template lang='pug'>
  PageLayout(page='Public')
    v-container(app dark)
      v-card
        v-card-title Image Resizing and Compression
        v-card-text
          h4.message(v-if='message') {{message}}
          h4.warning(v-if='warning') {{warning}}
          h4.error(v-if='error') {{error}}
          h4 Options:
          v-layout
            v-col
              h3 Size: {{size}}
                v-btn(icon v-if='size')
                  v-icon(@click='size=""' color='blue') edit
                v-radio-group(v-model='size' v-else)
                  v-radio(v-for='s in sizes' :key='s' :label='s' :value='s')
            v-col(v-if='dir')
              h3 Dir: {{dir}}
                v-btn(icon v-if='dir')
                  v-icon(@click='dir=""' color='blue') edit
                v-radio-group(v-model='dir' v-else)
                  v-radio(v-for='d in directories' :key='d' :label='d' :value='d')
            v-col
              h3 Quality: {{quality}}
                v-btn(icon v-if='!showQ')
                  v-icon(@click='showQ=true' color='blue') edit
                v-slider(v-model='quality' v-else vertical thumb-label ticks='always' step='10')
          hr
          upload-files(:directory='dir' width='300px' :onSave='saveImage' :onResize='resizeImage' :quality='quality' :size='size' :multiple='true')
          //- upload-files(:directory='dir || "tmp/uploads/"' width='300px' :onResize='resizeImage')
          hr

</template>

<script>

const UploadFiles = () => import("@/default/components/UploadFiles");

import PageLayout from '@/default/layouts/PageLayout'
import Config from '@/config.js'
// import axios from 'axios'

export default {
  components: {
    PageLayout,
    UploadFiles
  },
  data () {
    return {
      message: '',
      warning: '',
      error: '',

      size: '',
      dir: '',
      quality: 80,

      showQ: false,
      
      sizes: ['xs', 'small', 'medium', 'large', 'xl'],
      directories: Config.image_directories
    }
  },
  created: function () {
  
  },
  methods: {
    saveImage: function (files) {
      this.message = ''
      this.warning = ''
      this.error = ''
      console.log('add Save step for...' + JSON.stringify(files))
    },
    resizeImage: function (files) { 
      console.log('Resize: ' + JSON.stringify(files))
      // console.log('resize ' + files)
      // var url = this.apiURL + '/resize/'
      // var data = {
      //   image: file,
      //   size: this.size || 'small'
      // }
      // console.log('url: ' + url)
      // console.log(JSON.stringify(data))
      // axios.post(url, data)
      // .then( response => {
      //   console.debug('resized image ' + JSON.stringify(response))
      //   this.message = 'Image Saved & Resized Successfully'

      // })
      // .catch (err => {
      //   this.warning = 'Failed to Save Image Successfully'
      //   console.debug('failed to update event image ' + err.message)
      // })
    }       
  },
  computed: {
  }
}
</script>
<style>
</style>
