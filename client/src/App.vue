<template>
  <div id="app">
    <sidebar/>
  </div>
</template>

<script>
import SideBar from './components/SideBar.vue'

export default {
  name: 'App',
  data () {
    return {
    }
  },
  components: {
    'sidebar': SideBar
  },
  methods: {
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* #map { 
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
 } */
</style>
