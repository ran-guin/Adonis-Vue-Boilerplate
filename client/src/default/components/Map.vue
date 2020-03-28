<template lang='pug'>
  div(:id='id')
    v-btn(@click='geoLocate()') Locate
    hr
    h4 Location: {{JSON.stringify(myPosition)}}
    h4 Centre: {{myCentre}} Zoom: {{myZoom}} 
    div(id='geomap')
    hr
    v-map(:zoom='myZoom' :center="myCentre")
      v-tilelayer(url="http://{s}.tile.osm.org/{z}/{x}/{y}.png")
      v-marker(:lat-lng="myCentre")
      v-circle(:lat-lng="myCentre", :radius="myRadius", :color='myOptions.color', :fillColor='myOptions.fillColor', :fillOpacity='options.fillOpacity')
</template>

<script>  
import PageLayout from '@/custom/layouts/PageLayout'
import Config from '@/config.js'

export default {
  components: {
    PageLayout
  },
  data () {
    return {
      location: 'TBD',
      config: Config,
      myPosition: {},
      myZoom: '',
      myRadius: '',
      myCentre: [],
      myOptions: {
        color: 'blue',
        fillColor: '#339',
        fillOpacity: 0.2
      },
      defaultCentre: [49.3, -123.1]
    }
  },
  props: {
    id: {
      type: String,
      default: 'Lmap'
    },
    position: {
      latitude: null,
      longitude: null,
      address: null
    },
    zoom: {
      type: Number,
      default: 13
    },
    radius: {
      type: Number,
      default: 300
    },
    options: {
      type: Object,
      default () { return {} }
    }
  },
  created: function () {
    this.geoLocate()
    this.myPosition = this.position
    this.myZoom = this.zoom
    this.myRadius = this.radius
    this.myOptions = this.options
    this.myCentre = this.centre || this.defaultCentre

    if (!this.myPosition) {
      if (this.payload && this.payload.latitude && this.payload.longitude) {
        this.myPosition = {
          latitude: this.payload.latitude,
          longitude: this.payload.longitude
        }
        console.log('Using payload location information...')
      }
    }
    console.log('Home: ' + JSON.stringify(this.myPosition))
  },
  methods: {
    geoLocate: function (scale) {
      var x = document.getElementById('geomap')
      console.log('scale: ' + scale)
      if (navigator && navigator.geolocation) {
        x.innerHTML = 'checking position...'
        var _this = this
        navigator.geolocation.getCurrentPosition(
          _this.showPosition,
          _this.errorPosition,
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        )
      } else {
        x.innerHTML = 'Geolocation not supported in this browser'
      } 
    },
    showPosition: function (position) {
      console.log('show Pos: ' + JSON.stringify(position.coords))
      var x = document.getElementById('geomap')
      this.myPosition = position.coords
      this.myCentre = [
        this.myPosition.latitude, 
        this.myPosition.longitude
      ]
      this.myZoom = 13
      this.myOptions.color = 'blue'
      x.innerHTML = 'Dynmically generated text: '
        + this.myLocation
    },
    errorPosition: function () {
      var x = document.getElementById('geomap')
      console.log('Error retrieving position')
      x.innerHTML = 'Error retrieving position information...' 
    }
  },
  computed: {
    myLocation: function () {
      return this.myPosition.latitude 
        + ', ' 
        + this.myPosition.longitude
    },
    payload: function () {
      return this.$store.getters.payload || {}
    }
  }
}
</script>
<style>
#Lmap {
    width: 500px;
    height: 250px;
  }
</style>
