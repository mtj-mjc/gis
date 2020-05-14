<template>
  <div class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary">
        <md-button class="md-icon-button" @click="toggleMenu" v-if="!menuVisible">
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">GIS App</span>
      </md-app-toolbar>

      <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
        <md-toolbar class="md-transparent" md-elevation="0">
          <span>Menu</span>

          <div class="md-toolbar-section-end">
            <md-button class="md-icon-button md-dense" @click="toggleMenu">
              <md-icon>keyboard_arrow_left</md-icon>
            </md-button>
          </div>
        </md-toolbar>

        <md-list>
          <md-list-item>
            <md-switch
              v-model="isVisible"
              class="md-primary"
              v-on:change="showAdminUnit(isVisible)"
            >Colorize Administrative Units</md-switch>
          </md-list-item>
          <md-list-item>
            <md-switch
              v-model="isHighlighted"
              class="md-primary"
              v-on:change="highlightLakes(isHighlighted)"
            >Highlight Lakes with more than 4 Borders</md-switch>
          </md-list-item>
          <md-list-item>
            <md-switch
              v-model="isShown"
              class="md-primary"
              v-on:change="showMeasuringStations(isShown)"
            >Show Measuring Stations</md-switch>
          </md-list-item>
          <md-list-item>
            <intersectionmodel></intersectionmodel>
          </md-list-item>
          <md-list-item>
            <campingplace></campingplace>
          </md-list-item>
          <md-list-item>
            <trainstation></trainstation>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <gismap ref="map" />
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import Map from "./Map.vue";
import IntersectionModel from "./IntersectionModel.vue";
import CampingPlace from "./CampingPlace.vue";
import TrainStation from "./TrainStation.vue";

export default {
  name: "PersistentFull",
  data: () => ({
    menuVisible: false,
    isVisible: false,
    isHighlighted: false,
    isShown: false
  }),
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    showAdminUnit(show) {
      if (show) {
        this.$refs.map.colorizeAdminUnit();
      } else {
        this.$refs.map.removeColorizationOfAdminUnit();
      }
    },
    highlightLakes(show) {
      if (show) {
        this.$refs.map.highlightLakes();
      } else {
        this.$refs.map.removehighlightLakes();
      }
    },
    showMeasuringStations(show) {
      if (show) {
        this.$refs.map.showMeasuringStations();
      } else {
        this.$refs.map.removeMeasuringStations();
      }
    }
  },
  components: {
    gismap: Map,
    intersectionmodel: IntersectionModel,
    campingplace: CampingPlace,
    trainstation: TrainStation
  }
};
</script>

<style lang="scss" scoped>
.md-app {
  // min-height: 350px;
  height: 100vh;
  border: 1px solid rgba(#000, 0.12);
}

// Demo purposes only
.md-drawer {
  width: 350px;
  max-width: calc(100vw - 125px);
}

.md-app-content {
  padding: 0px;
}
</style>
