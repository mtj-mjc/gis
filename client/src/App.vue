<template>
  <div id="app">
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet'
export default {
  name: 'App',
  mounted() {
      this.$nextTick(() => {
        this.initMap();
      });
    },
    methods: {
        initMap: function(){
            // Create variable to hold map element, give initial settings to map
            var map = L.map('map',{ center: [42.375562, -71.106870], zoom: 14});
            // Add OpenStreetMap tile layer to map element
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap'
            }).addTo(map);
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
