<template lang='pug'>
  div
    h4 Documents:
    <!-- iframe(src='/help?file=Data_Structures.md') -->
    hr
    div.flex-container
      div.flex-item(v-for='scope in scopes')
        h4 {{scope}}:
        span(v-for='doc in docs')
          button.btn(v-if='scope===doc.scope' v-on:click='load(doc)' v-bind:class="[{'btn-primary': doc.scope === 'public'}, {'btn-danger': doc.scope === 'private'}]") {{doc.name}}
          span(v-if='scope===doc.scope') &nbsp; &nbsp;
        hr
    div.navbar-right
      button.btn-close(v-on:click='close')
        <!-- icon(name='times') -->
        v-icon cancel
    div.doc-image(v-if='image')
      img(:src='image')
    div.doc-content(v-else-if='content' v-html='content')
    p &nbsp;
</template>

<script>
import axios from 'axios'
import config from '@/config'

export default {
  components: {
    // Tabs
  },
  data () {
    return {
      defaultContent: '<h2>Select document from above to view</h2>',
      content: this.defaultContent,
      data: {},
      image: null
    }
  },
  props: {
    scopes: {
      type: Array,
      default () { return [] }
    },
    docs: {
      type: Array,
      default () { return [] }
    },
    payload: {
      type: Object,
      default: null
    },
    nav: {
      type: Object
    }
  },
  computed: {
    apiURL: function () {
      if (process.env.NODE_ENV && config.apiURL) {
        return config.apiURL[process.env.NODE_ENV]
      } else {
        console.log("** Error: require apiURL specification in config.js file")
        return 'http://localhost'
      }
    }
  },
  methods: {
    load: function (doc) {
      var file = doc.file
      var scope = doc.scope
      var dir = './../docs'
      if (scope) { dir = dir + '/' + scope }
      if (file) {
        console.log('file: ' + file)
        this.content = ''
        var _this = this
        if (doc.type === 'image') {
          this.image = 'images/kyc/' + file
          this.content = ''
        } else {
          file = dir + '/' + file
          this.image = null
          var url = this.apiURL + '/docs?file=' + file
          axios.post(url)
            .then(function (response) {
              if (response.data) {
                console.log('loaded content')
                console.log(JSON.stringify(response.data))
                if (response.data.constructor === Object && response.data.message) {
                  _this.$set(_this, 'content', response.data.message)
                } else {
                  _this.$set(_this, 'content', response.data)
                }
              } else {
                _this.$set(_this, 'content', '<b>Nothing found</b>')
              }
            })
            .catch(function (error) {
              var msg = '<h4>Error retrieving document<h4>:<b>' + error + '</b>'
              _this.$set(_this, 'content', msg)
            })
        }
      } else {
        _this.$set(_this, 'content', this.defaultContent)
      }
    },
    close: function () {
      this.image = null
      this.content = this.defaultContent
    }
  }
}
</script>

<style scoped>
.iframe {
  border: 2px solid grey;
  width: 80%;
  height: auto;
}

.flex-container {
  display: flex;
  flex-direction: column
}

.flex-item {
  width: 100%;
}

.doc-content {
  border: 2px solid grey;
  width: 80%;
  height: auto;
  padding: 5%;
}

.doc-content h1 {
  color: darkblue;
}
.doc-content h3 {
  color: blue;
}
.doc-content h5 {
  color: lightblue;
}

.doc-content table {
  width: 100%;
  border: 2px solid black;
}

.doc-content table th {
  background-color: lightgray;
  border: 1px solid black;
  padding: 2rem;
  text-align: center;
}

.doc-content table tr td {
  border: 1px solid grey;
  padding: 2rem;
}
</style>
