<template>
    <div id="map"></div>
</template>

<script>
import L from 'leaflet'
import axios from 'axios'

export default {
  name: 'Map',
  mounted() {
      this.$nextTick(() => {
        this.initMap();
      });
  },
  data () {
    return {
      myData: "",
      map: null,
      adminUnitLayer: null,
      highlightLakeLayer: null
    }
  },
  methods: {
    showAdminUnit: function(){
        let that = this;
        axios
        .get('http://localhost:3000/camping-per-square-per-adminunit')
        .then((response) => { 
          console.log(response.data);
          this.adminUnitLayer = L.geoJson(response.data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.name);
            },
            style: function(feature) {
              return {color: that.perc2color(feature.properties.nbrOfCampings / 31 * 100)};
            }
          }).addTo(this.map);
        });
    },
    removeAdminUnit: function(){
        this.adminUnitLayer.remove();
    },
    highlightLakes: function(){
        axios
          .get('http://localhost:3000/nbr-of-borders-per-lake')
          .then((response) => { 
            this.highlightLakeLayer = L.geoJson(response.data,{
              onEachFeature: function (feature, layer) {
                  layer.bindPopup(feature.properties.name);
              },
              style: function() {
                return {color: '#e0f542', fillColor: '#e0f542', fillOpacity: 0.6}; // yellow
              },
              filter: function(feature){
                  return feature.properties.nbrOfBorders > 4;
              }
            }).addTo(this.map);
          });
    },
    removehighlightLakes: function(){
        this.highlightLakeLayer.remove();
    },
    perc2color: function(perc) {
        var r, g, b = 0;
          if(perc < 5) {
            r = 255;
            g = 0;
          }
          else if(perc < 25) {
            r = 255;
            g = 100;
          }
          else if(perc < 50) {
            r = 255;
            g = 200;
          }
          else if(perc < 75){
            g = 255;
            r = 255;
          }
          else {
            g = 255;
            r = 0;
          }
          var h = r * 0x10000 + g * 0x100 + b * 0x1;
          return '#' + ('000000' + h.toString(16)).slice(-6);
    },
    initMap: function(){
        // Create variable to hold map element, give initial settings to map
        this.map = L.map('map',{ center: [47.05048, 8.30635], zoom: 8});
        // Add OpenStreetMap tile layer to map element
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(this.map);

        var geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        axios
        .get('http://localhost:3000/camping')
        .then((response) => { 
          // console.log(response.data);
          L.geoJSON(response.data, {
              pointToLayer: function (feature, latlng) {
                  return L.circleMarker(latlng, geojsonMarkerOptions);
              },
              onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.name);
              }
          }).addTo(this.map);
        });
    }    
  }
}
</script>

<style>
@import '../../node_modules/leaflet/dist/leaflet.css';

#map { 
  position: relative;
  width: 100%;
  height: 100%;
 }
</style>
