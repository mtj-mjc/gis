<template>
  <div class="card-expansion md-elevation-10">
    <md-card>
      <md-card-expand>
        <md-card-actions md-alignment="space-between">
          <div>
            <div class="md-title">Camping Places</div>
          </div>

          <md-card-expand-trigger>
            <md-button class="md-icon-button">
              <md-icon>keyboard_arrow_down</md-icon>
            </md-button>
          </md-card-expand-trigger>
        </md-card-actions>

        <md-card-expand-content>
          <md-card-content>
            <md-field>
              <label for="meterFromWater">Away from Water</label>
              <md-input name="meterFromWater" id="meterFromWater" v-model="distanceToWater" />
              <span class="md-suffix">meters</span>
              <span class="md-error">Invalid first name</span>
            </md-field>

            <md-field>
              <label for="meterFromStation">Away from Train Station</label>
              <md-input name="meterFromStation" id="meterFromStation" v-model="distanceToStation" />
              <span class="md-suffix">meters</span>
              <span class="md-error">Invalid first name</span>
            </md-field>

            <md-card-actions>
              <md-button
                class="md-raised md-primary"
                @click="$root.$emit('findCampingClicked', {distanceToStation: distanceToStation, distanceToWater: distanceToWater})"
              >{{distanceToWater == '' && distanceToStation == ''? 'Find All': 'Find'}}</md-button>
              <md-button
                class="md-raised md-accent"
                @click="$root.$emit('removeCampingClicked', '')"
              >Remove</md-button>
            </md-card-actions>
          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>
  </div>
</template>

<script>
export default {
  name: "CampingPlace",
  data: () => ({
    distanceToWater: "",
    distanceToStation: ""
  }),
  methods: {}
};
</script>

<style lang="scss" scoped>
.md-card {
  width: 317px;
}
</style>
