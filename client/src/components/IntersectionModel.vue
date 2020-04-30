<template>
  <div class="card-expansion md-elevation-10">
    <md-card>
      <md-card-expand>
        <md-card-actions md-alignment="space-between">
          <div>
            <div class="md-title">9-Intersection Model</div>
          </div>

          <md-card-expand-trigger>
            <md-button class="md-icon-button">
              <md-icon>keyboard_arrow_down</md-icon>
            </md-button>
          </md-card-expand-trigger>
        </md-card-actions>

        <md-card-expand-content>
          <md-card-content>
            <table>
              <thead>
                  <tr>
                    <th></th>
                    <th v-for="(item, i) in header" :key="i">{{item}}</th>
                  </tr>
              </thead>

              <tr v-for="(item, i) in relate" :key="i">
                <th>{{ header[i] }}</th>
                <td>{{ item.interior }}</td>
                <td>{{ item.boundary }}</td>
                <td>{{ item.exterior }}</td>
              </tr>
            </table>
            <br>
            <p v-if="selectedAdminUnit.length == 2">{{selectedAdminUnit[0].name}} & {{selectedAdminUnit[1].name}}</p>
          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'IntersectionModel',
    mounted() {
      this.$root.$on('selected', data => {
        if(this.selectedAdminUnit.length == 0){
          this.selectedAdminUnit.push(data);
        } else if(this.selectedAdminUnit.length == 1){
          this.selectedAdminUnit.push(data);
          this.showModel();
        }else {
          this.selectedAdminUnit = [data];
          this.clearModel();
        }
      });
    },
    data: () => ({
      selectedAdminUnit: [],
      header: ["Interior", "Boundary", "Exterior"],
      relate: [
        {
          interior: "?",
          boundary: "?",
          exterior: "?"
        },
        {
          interior: "?",
          boundary: "?",
          exterior: "?"
        },
        {
          interior: "?",
          boundary: "?",
          exterior: "?"
        }
      ]
    }),
    methods: {
      showModel: function(){
        axios
        .get('http://localhost:3000/intersectionModel?id1='+ this.selectedAdminUnit[0].id +'&id2='+ this.selectedAdminUnit[1].id)
        .then((response) => { 
          var st_relate = response.data.st_relate;
          var rows = [];
          rows.push(st_relate.slice(0,3));
          rows.push(st_relate.slice(3,6))
          rows.push(st_relate.slice(6,9))
          rows.map((row) => row.split("")).forEach((row, index) => {
            this.relate[index].interior = row[0];
            this.relate[index].boundary = row[1];
            this.relate[index].exterior = row[2];
          });
        });
      },
      clearModel: function(){
          for(var index = 0; index < 3; index++) {
            this.relate[index].interior = "?";
            this.relate[index].boundary = "?";
            this.relate[index].exterior = "?";
          }
      }
    }
  }
</script>

<style lang="scss" scoped>
  th, td {
    text-align: center;
  }

  table {
      border-collapse: collapse;
      width: 100%;
  }

  th {
    border-bottom: 0px solid white;
    padding: 5px;
  }

  td {
      border-bottom: 1px solid gray;
      border-top: 1px solid gray;
  }
  p {
    word-break: normal;
    white-space: normal;
    margin: 0px;
  }

</style>
