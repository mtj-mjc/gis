<template>
  <div id="app">
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet'
import axios from 'axios'

export default {
  name: 'App',
  mounted() {
      this.$nextTick(() => {
        this.initMap();
      });
  },
  data () {
    return {
      myData: ""
    }
  },
  methods: {
      initMap: function(){
          // Create variable to hold map element, give initial settings to map
          var map = L.map('map',{ center: [47.05048, 8.30635], zoom: 8});
          // Add OpenStreetMap tile layer to map element
          L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);
          
          axios
          .get('http://localhost:3000/data')
          .then((response) => { 
            console.log(response.data.json_build_object);
            L.geoJson(response.data.json_build_object,{
              onEachFeature: function (feature, layer) {
                  layer.bindPopup(feature.properties.f2);
              }
            }).addTo(map);
          });
          
      }
  }
}
</script>

<style>
@import '../node_modules/leaflet/dist/leaflet.css';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#map { 
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
 }
</style>
