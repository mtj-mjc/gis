<template>
  <div id="map"></div>
</template>

<script>
import L from "leaflet";
import axios from "axios";
import cheerio from "cheerio";

export default {
  name: "Map",
  mounted() {
    this.$nextTick(() => {
      this.initMap();
    });
    this.$root.$on("findCampingClicked", e => {
      this.showCampingPlaces(e.distanceToWater, e.distanceToStation);
    });
    this.$root.$on("removeCampingClicked", () => {
      if (this.campingPlaceMarkerLayer != null) this.removeCampingPlaces();
    });
    this.$root.$on("findTrainStationClicked", e => {
      this.showTrainStations(e.distanceToWater);
    });
    this.$root.$on("removeTrainStationClicked", () => {
      if (this.trainStationMarkerLayer != null) this.removeTrainStations();
    });
  },
  data() {
    return {
      myData: "",
      map: null,
      infoBox: null,
      colorScale: null,
      campingPlaceMarkerLayer: null,
      adminUnitLayer: null,
      highlightLakeLayer: null,
      trainStationMarkerLayer: null,
      measuringStationLayer: null,
      campingPlacesMarkerStyle: {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      measuringStationsMarkerStyle: {
        radius: 8,
        fillColor: "#4682B4",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      trainStationsMarkerStyle: {
        radius: 8,
        fillColor: "#fd0000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      adminUnitLayerStyle: {
        color: "#000000",
        fillOpacity: 0
      },
      lakeLayerStyle: {
        color: "#000000",
        fillOpacity: 0
      },
      highlightLakeLayerStyle: {
        color: "#e0f542",
        fillColor: "#e0f542",
        fillOpacity: 0.6
      },
      selectedAdminUnitLayerStyle: {
        color: "#e0f542",
        fillColor: "#e0f542",
        fillOpacity: 0.6
      }
    };
  },
  methods: {
    colorizeAdminUnit: function() {
      this.adminUnitLayer.eachLayer(instanceLayer => {
        var color = this.perc2color(
          (((instanceLayer.feature.properties.nbrOfCampings /
            instanceLayer.feature.properties.area) *
            Math.pow(10, 9)) /
            81) *
            100
        );
        instanceLayer.setStyle({
          color: color,
          fillColor: color,
          fillOpacity: 0.2
        });
      });
      this.showColorScale();
    },
    removeColorizationOfAdminUnit: function() {
      this.adminUnitLayer.setStyle(this.adminUnitLayerStyle);
      this.removeColorScale();
    },
    showAdminUnit: function() {
      var that = this;
      axios
        .get("http://localhost:3000/camping-per-square-per-adminunit")
        .then(response => {
          this.adminUnitLayer = L.geoJson(response.data, {
            onEachFeature: function(feature, layer) {
              layer.bindPopup("<b>" + feature.properties.name + "</b>");
              layer.on("click", e => {
                layer.setStyle(that.selectedAdminUnitLayerStyle);
                axios
                  .get(
                    "http://localhost:3000/nearestStation?lng=" +
                      e.latlng.lng +
                      "&lat=" +
                      e.latlng.lat
                  )
                  .then(response => {
                    that.infoBox.update(response.data.properties);
                  });
                that.$root.$emit("selected", e.target.feature.properties);
              });
              that.$root.$on("removeSelection", e => {
                if (feature.properties.name != e.except.name)
                  layer.setStyle(that.adminUnitLayerStyle);
              });
            },
            style: function() {
              return that.adminUnitLayerStyle;
            }
          }).addTo(this.map);
          this.adminUnitLayer.bringToBack();
        });
    },
    removeAdminUnit: function() {
      this.adminUnitLayer.remove();
    },
    showLakes() {
      var that = this;
      axios
        .get("http://localhost:3000/nbr-of-borders-per-lake")
        .then(response => {
          this.highlightLakeLayer = L.geoJson(response.data, {
            onEachFeature: function(feature, layer) {
              layer.on("click", e => {
                axios
                  .get(
                    "http://localhost:3000/nearestMeasuringStation?lng=" +
                      e.latlng.lng +
                      "&lat=" +
                      e.latlng.lat
                  )
                  .then(response => {
                    let $ = cheerio.load(response.data.properties.description);
                    var link = $("a").attr("href");
                    axios
                      .get("https://cors-anywhere.herokuapp.com/" + link)
                      .then(html => {
                        $ = cheerio.load(html.data);
                        var temp = $("tbody")
                          .find("td:nth-child(4)")
                          .html();
                        if (temp == null)
                          temp = $("tbody")
                            .find("td:nth-child(3)")
                            .html();
                        if (temp == null)
                          temp = $("tbody")
                            .find("td:nth-child(2)")
                            .html();
                        that.infoBox.showTemp({
                          meters: response.data.properties.meters,
                          temp: temp,
                          link: link,
                          name: response.data.properties.name
                        });
                      });
                  });
              });
            },
            style: function() {
              return that.lakeLayerStyle;
            }
          }).addTo(this.map);
        });
    },
    highlightLakes: function() {
      this.highlightLakeLayer.eachLayer(instanceLayer => {
        if (instanceLayer.feature.properties.nbrOfBorders > 4) {
          instanceLayer.setStyle({
            color: "#e0f542",
            fillColor: "#e0f542",
            fillOpacity: 0.6
          });
        }
      });
    },
    removehighlightLakes: function() {
      this.highlightLakeLayer.setStyle(this.lakeLayerStyle);
    },
    showMeasuringStations: function() {
      var that = this;
      axios.get("http://localhost:3000/measuring-station").then(response => {
        this.measuringStationLayer = L.geoJSON(response.data, {
          pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, that.measuringStationsMarkerStyle);
          },
          onEachFeature: function(feature, layer) {
            layer.bindPopup(
              feature.properties.name + "<br>" + feature.properties.description
            );

            layer.on("click", () => {
              let $ = cheerio.load(feature.properties.description);
              var link = $("a").attr("href");
              axios
                .get("https://cors-anywhere.herokuapp.com/" + link)
                .then(html => {
                  $ = cheerio.load(html.data);
                  var temp = $("tbody")
                    .find("td:nth-child(4)")
                    .html();
                  if (temp == null)
                    temp = $("tbody")
                      .find("td:nth-child(3)")
                      .html();
                  if (temp == null)
                    temp = $("tbody")
                      .find("td:nth-child(2)")
                      .html();
                  that.infoBox.showMeasurment({
                    temp: temp
                  });
                });
            });
          }
        }).addTo(this.map);
      });
    },
    removeMeasuringStations: function() {
      this.measuringStationLayer.remove();
    },
    perc2color: function(perc) {
      var r,
        g,
        b = 0;
      if (perc <= 1) {
        r = 150;
        g = 0;
      } else if (perc <= 3) {
        r = 255;
        g = 0;
      } else if (perc <= 5) {
        r = 255;
        g = 100;
      } else if (perc <= 7) {
        r = 255;
        g = 200;
      } else if (perc <= 9) {
        r = 255;
        g = 255;
      } else if (perc <= 20) {
        r = 50;
        g = 255;
      } else {
        r = 0;
        g = 100;
      }
      var h = r * 0x10000 + g * 0x100 + b * 0x1;
      return "#" + ("000000" + h.toString(16)).slice(-6);
    },
    showCampingPlaces: function(distanceToWater, distanceToStation) {
      if (this.campingPlaceMarkerLayer != null) this.removeCampingPlaces();
      var that = this;
      axios
        .get(
          "http://localhost:3000/camping_place?distanceWater=" +
            distanceToWater +
            "&distanceStation=" +
            distanceToStation
        )
        .then(response => {
          this.campingPlaceMarkerLayer = L.geoJSON(response.data, {
            pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, that.campingPlacesMarkerStyle);
            },
            onEachFeature: function(feature, layer) {
              layer.bindPopup(feature.properties.name);
            }
          }).addTo(this.map);
        });
    },
    removeCampingPlaces: function() {
      this.campingPlaceMarkerLayer.remove();
    },
    showTrainStations: function(distanceToWater) {
      if (this.trainStationMarkerLayer != null) this.removeTrainStations();
      var that = this;
      axios
        .get(
          "http://localhost:3000/train_station?distanceWater=" + distanceToWater
        )
        .then(response => {
          this.trainStationMarkerLayer = L.geoJSON(response.data, {
            pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, that.trainStationsMarkerStyle);
            },
            onEachFeature: function(feature, layer) {
              layer.bindPopup(feature.properties.name);
            }
          }).addTo(this.map);
        });
    },
    removeTrainStations: function() {
      this.trainStationMarkerLayer.remove();
    },
    showInfoBox: function() {
      this.infoBox = L.control();

      this.infoBox.onAdd = function() {
        this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
        this.showMeasurment();
        this.showTemp();
        this.update();
        return this._div;
      };

      this.infoBox.showMeasurment = function(props) {
        this._div.innerHTML =
          "<h4>Latest Measurement</h4>" +
          (props ? props.temp + " Celsius" : "Select Point with a Click");
      };

      this.infoBox.showTemp = function(props) {
        this._div.innerHTML =
          "<h4>Nearest Measuring Station</h4>" +
          (props
            ? Math.round(props.meters) +
              "m away" +
              "<br>" +
              (props.temp != null
                ? props.temp + " Celsius"
                : "<a target='_blank' href=" +
                  props.link +
                  ">" +
                  props.name +
                  "</a>")
            : "Select Point with a Click");
      };

      // method that we will use to update the control based on feature properties passed
      this.infoBox.update = function(props) {
        this._div.innerHTML =
          "<h4>Nearest Station</h4>" +
          (props
            ? props.name + "<br>" + Math.round(props.meters) + "m away"
            : "Select Point with a Click");
      };

      this.infoBox.addTo(this.map);
    },
    showColorScale: function() {
      let that = this;
      this.colorScale = L.control({ position: "bottomright" });

      this.colorScale.onAdd = function() {
        var div = L.DomUtil.create("div", "colorScale"),
          grades = [0, 1, 3, 5, 7, 9, 20];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' +
            that.perc2color(grades[i] + 1) +
            '"></i> ' +
            grades[i] +
            (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }

        return div;
      };

      this.colorScale.addTo(this.map);
    },
    removeColorScale: function() {
      this.colorScale.remove();
    },
    initMap: function() {
      // Create variable to hold map element, give initial settings to map
      this.map = L.map("map", { center: [47.05048, 8.30635], zoom: 8 });
      // Add OpenStreetMap tile layer to map element
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution: "Made by Matej Mrnjec © OpenStreetMap"
      }).addTo(this.map);

      this.showAdminUnit();
      this.showLakes();
      this.showInfoBox();
      // https://leafletjs.com/examples/choropleth/
    }
  }
};
</script>

<style>
@import "../../node_modules/leaflet/dist/leaflet.css";

#map {
  position: relative;
  width: 100%;
  height: 100%;
}

.colorScale {
  line-height: 18px;
  color: #555;
  padding: 6px 8px;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  color: #777;
}

.colorScale i {
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
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  color: #777;
}

.info h4 {
  margin: 0 0 5px;
  color: #777;
}
</style>
