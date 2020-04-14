<template lang='pug'>
  div.myMap(:id='id')
    h4.myH Title: {{title}} {{myCentre}}
      span(v-if='markers.length') {{markers.length}} locations
    LMap.LMap(:id='id' :zoom='myZoom' :center="myCentre" :bounds='bounds' :padding='pad')
      LTileLayer(url="http://{s}.tile.osm.org/{z}/{x}/{y}.png")
      LMarker(v-for='marker in myMarkers' :lat-lng="marker.centre", :radius="marker.radius || myOptions.radius", :color='marker.colour || myOptions.color', :fillColor='marker.fillColor || myOptions.fillColor', :fillOpacity='myOptions.fillOpacity')
        LPopup(:content='myLabel(marker) ')
      LCircle(v-for='circle in myCircles' :lat-lng="circle.centre", :radius="circle.radius || myOptions.radius", :color='circle.colour || myOptions.color', :fillColor='circle.fillColor || myOptions.fillColor', :fillOpacity='myOptions.fillOpacity')
        LPopup(:content='myLabel(circle) ')
    div(id='mapAnnotation')
</template>

<script>  
import Config from '@/config.js'
import gmapsInit from '@/config.gmaps.js';

// import L from 'leaflet';
// import { latLngBounds, latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LCircle, LPopup} from 'vue2-leaflet';

import { Icon } from 'leaflet';

// import { OpenStreetMapProvider } from 'leaflet-geosearch';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

var map

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LCircle,
    LPopup
  },
  data () {
    return {
      location: 'TBD',
      config: Config,
      myZoom: 13,
      myRadius: null,
      myCentre: [49.3, -121.1],
      myOptions: {
        fillOpacity: 0.2,
        radius: 800
      },
      myMarkers: [],
      myCircles: [],
      defaultZoom: 13,
      bounds: null,
      pad: [100, 100],
      foundMe: {},

      goldStar: {
        path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        fillColor: 'yellow',
        fillOpacity: 0.8,
        scale: 1,
        strokeColor: 'gold',
        strokeWeight: 14
      },
      map: null,
      google: null
    }
  },
  props: {
    id: {
      type: String,
      default: 'Lmap'
    },
    title: {
      type: String
    },
    centre: {
      type: Array
    },
    markers: {
      type: Array,
      default () { return [] }
    },
    circles: {
      type: Array,
      default () { return [] }
    },
    zoom: {
      type: Number
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
    console.log('initialize map..')
    // this.buildMap() 
  },
  async mounted () {
    console.log('load map...')
    try {
      const google = await gmapsInit();
      this.google = google
      map = new google.maps.Map(this.$el);

      var x = document.getElementById('mapAnnotation') || {}
      if (navigator && navigator.geolocation) {
        x.innerHTML = 'checking position...'
        var _this = this
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          console.log(' found current position: ' + JSON.stringify(pos))
          map.setCenter(pos);
          console.log('set pos: ' + JSON.stringify(pos))
          map.setZoom(_this.defaultZoom)
          _this.bounds = new _this.google.maps.LatLngBounds()
          
          _this.bounds.extend(pos)
          console.log('initialized bound: ' + JSON.stringify(_this.bounds))
          _this.addMarkers(_this.markers)
          console.log('added markers...')
          _this.addMarkers(_this.circles, 'circle')
          console.log('add circles...')
          x.innerHTML = pos.lat + ', ' + pos.lng
        }, function() {
          console.log('failed to retrieve position .. revert to default')
          _this.defaultCentre()
          _this.addMarkers(_this.markers)
          _this.addMarkers(_this.circles, 'circle')
        })
      } else {
        this.defaultCentre()
        this.addMarkers(this.markers)
        this.addMarkers(this.circles, 'circle')
      }
    } catch (error) {
      console.error(error);
    }
    // this.geoLocate()
    // this.geoLoc('438 Seymour St, Vancouver, BC')
  },
  methods: {
    defaultCentre: function () {
      var x = document.getElementById('mapAnnotation') || {}
      x.innerHTML = 'Geolocation not supported in this browser'

      const geocoder = new this.google.maps.Geocoder();
      const defaultLocation = 'Vancouver, BC'
      geocoder.geocode({ address: defaultLocation }, (results, status) => {
        if (status !== 'OK' || !results[0]) {
          throw new Error(status);
        }
        console.log('Using default location: ' + results[0].geometry.location.constructor + JSON.stringify(results[0].geometry.location))
        console.log('Using default viewport ' + JSON.stringify(results[0].geometry.viewport))
        map.setCenter(results[0].geometry.location);
        map.fitBounds(results[0].geometry.viewport);        
        // _this.foundMe = results[0].geometry.location
        x.innerHTML = JSON.stringify(results[0].geometry.location)
      });
    },
    // initMap: function () {
    //   map = new google.maps.Map(document.getElementById('map'), {
    //     center: {lat: -34.397, lng: 150.644},
    //     zoom: 6
    //   });
    //   infoWindow = new google.maps.InfoWindow;

    //   const _this = this
    //   // Try HTML5 geolocation.
    //   if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(function(position) {
    //       var pos = {
    //         lat: position.coords.latitude,
    //         lng: position.coords.longitude
    //       };

    //       infoWindow.setPosition(pos);
    //       infoWindow.setContent('Location found.');
    //       infoWindow.open(map);
    //       map.setCenter(pos);
    //     }, function() {
    //       _this.handleLocationError(true, infoWindow, map.getCenter());
    //     });
    //   } else {
    //     // Browser doesn't support Geolocation
    //     _this.handleLocationError(false, infoWindow, map.getCenter());
    //   }
    // },
    // handleLocationError: function (browserHasGeolocation, infoWindow, pos) {
    //   infoWindow.setPosition(pos);
    //   infoWindow.setContent(browserHasGeolocation ?
    //                         'Error: The Geolocation service failed.' :
    //                         'Error: Your browser doesn\'t support geolocation.');
    //   infoWindow.open(map);
    // },
    addMarkers: function (markers, type) {
      console.log('bound: ' + JSON.stringify(this.bounds))

      for (var i = 0; i < markers.length; i++) {
        markers[i].type = type
        if (type === 'circle') {
          this.myCircles.push(markers[i])
        } else {
          this.myMarkers.push(markers[i])
        }
        console.log(type + ' : ' + JSON.stringify(markers[i]))
        this.bounds.extend(markers[i].position)
      }

      if (type === 'circle') {
        const mappedCircles = markers
          .map(x => new this.google.maps.Circle({ ...x, map }));  
          console.log('added ' + mappedCircles.length + ' Circles')
      } else {
        const mappedMarkers = markers
          .map(x => new this.google.maps.Marker({ ...x, map }));
        
        console.log('added ' + mappedMarkers.length + ' Markers')
      }

      console.log('reset bounds: ' + JSON.stringify(this.bounds))
      map.fitBounds(this.bounds)

      console.log('load ' + type + 's: ' + JSON.stringify(markers))
    },
    rebuildMap: function () {

    },  
    myLabel: function (marker) {
      var label = ''
      if (marker.name) { 
        label = '<h2>' + marker.name + '</h2>'
      }
      if (marker.location) {
        label = label + '<B>[' + marker.location + ']</B>'
      }
      if (marker.description) {
        label = label + '<p>' + marker.description + '</p>'
      }
      if (marker.link) {
        label = label + "<br></br>"
        label = label + marker.link
      }
      return label
    }
  },
  computed: {
    myLocation: function () {
      return this.myCentre[0] 
        + ', ' 
        + this.myCentre[1]
    },
    payload: function () {
      return this.$store.getters.payload || {}
    }
  },
  watch: {
    markers: function () {
      console.log('Adjusted markers...')
      this.rebuildMap()
    }
  }
}
</script>
<style>
#Lmap {
    width: 100%;
    height: 400px;
  }
</style>
