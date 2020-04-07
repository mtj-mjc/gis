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
            <md-switch v-model="showAdminUnit" class="md-primary" v-on:change="showAdminUnitTest(showAdminUnit)" >Colorize Administrative Units</md-switch>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <gismap ref="map"/>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
    import Map from './Map.vue'
    
    export default {
        name: 'PersistentFull',
        data: () => ({
            menuVisible: false,
            showAdminUnit: false
        }),
        methods: {
            toggleMenu () {
                this.menuVisible = !this.menuVisible
            },
            showAdminUnitTest (show){
                if(show){
                    this.$refs.map.showAdminUnit();
                }else{
                    this.$refs.map.removeAdminUnit();
                }
            }
        },
        components: {
            'gismap': Map
        },
    }
</script>

<style lang="scss" scoped>
    .md-app {
        // min-height: 350px;
        height: 100vh;
        border: 1px solid rgba(#000, .12);
    }

    // Demo purposes only
    .md-drawer {
        width: 300px;
        max-width: calc(100vw - 125px);
    }

    .md-app-content {
        padding: 0px;
    }
</style>
