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
      info: null,
      campingPlaceMarkerLayer: null,
      adminUnitLayer: null,
      highlightLakeLayer: null,
      campingPlacesMarkerStyle: {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
      },
      adminUnitLayerStyle: {
        color: '#000000',
        fillOpacity: 0
      },
      lakeLayerStyle: {
        color: '#e0f542', 
        fillColor: '#e0f542', 
        fillOpacity: 0.6
      },
    }
  },
  methods: {
    colorizeAdminUnit: function(){
      this.adminUnitLayer.eachLayer((instanceLayer) => {
        instanceLayer.setStyle({
          color: this.perc2color(instanceLayer.feature.properties.nbrOfCampings / 31 * 100),
          fillColor: this.perc2color(instanceLayer.feature.properties.nbrOfCampings / 31 * 100),
          fillOpacity: 0.2
        });
      });
    },
    removeColorizationOfAdminUnit: function(){
      this.adminUnitLayer.setStyle(this.adminUnitLayerStyle);
    },
    showAdminUnit: function(){
      var that = this;
      axios
      .get('http://localhost:3000/camping-per-square-per-adminunit')
      .then((response) => { 
        this.adminUnitLayer = L.geoJson(response.data,{
          onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name)
              layer.on('click', (e)=>{
                axios
                  .get('http://localhost:3000/nearestStation?lng='+e.latlng.lng+'&lat='+e.latlng.lat)
                  .then((response) => { 
                    that.info.update(response.data.properties);
                  })
                that.$root.$emit('selected', e.target.feature.properties);
              });
          },
          style: function() {
            return that.adminUnitLayerStyle;
          }
        }).addTo(this.map);
        this.adminUnitLayer.bringToBack();
      });
    },
    removeAdminUnit: function(){
        this.adminUnitLayer.remove();
    },
    highlightLakes: function(){
      var that = this;
      axios
        .get('http://localhost:3000/nbr-of-borders-per-lake')
        .then((response) => { 
          this.highlightLakeLayer = L.geoJson(response.data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.name);
            },
            style: function() {
              return that.lakeLayerStyle;
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
    showCampingPlaces: function(){
      var that = this;
      axios
        .get('http://localhost:3000/camping')
        .then((response) => { 
          this.campingPlaceMarkerLayer = L.geoJSON(response.data, {
              pointToLayer: function (feature, latlng) {
                  return L.circleMarker(latlng, that.campingPlacesMarkerStyle);
              },
              onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.name);
              }
          }).addTo(this.map);
        });
    },
    initMap: function(){
        // Create variable to hold map element, give initial settings to map
        this.map = L.map('map',{ center: [47.05048, 8.30635], zoom: 8});
        // Add OpenStreetMap tile layer to map element
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: 'Made by Matej Mrnjec © OpenStreetMap'
        }).addTo(this.map);
        
        let that = this;
        
        this.info = L.control();

        this.info.onAdd = function () {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
        this.info.update = function (props) {
          console.log(props)
          this._div.innerHTML = '<h4>Nearest Station</h4>' +  (props ?
        props.name + '<br>' + Math.round(props.meters) + 'm away' 
        : 'Select Point with a Click');
        };

        this.info = this.info.addTo(this.map);
        console.log(this.info)

        this.showAdminUnit();
        this.showCampingPlaces();
        // https://leafletjs.com/examples/choropleth/
        
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function () {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + that.perc2color(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(this.map);
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

 .legend {
    line-height: 18px;
    color: #555;
}
.legend i {
    width: 18px;
    height: 18px;
    float: left;
    margin-right: 8px;
    opacity: 0.7;
}
.info {
    padding: 6px 8px;
    font: 14px/16px Arial, Helvetica, sans-serif;
    background: white;
    background: rgba(255,255,255,0.8);
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
    border-radius: 5px;
    color: #777;
}
.info h4 {
    margin: 0 0 5px;
    color: #777;
}
</style>
