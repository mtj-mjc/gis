# GIS - Vacation Planner
School Project for GIS Lecture

![User Interface](./img/UserInterface.png)

# Exercise Description
Tasks: (* is a user given parameter)
- Selection of two polygons and show result of 9-cut model
- Highlight all lakes with borders more than 4 administrative unites
- Colorize each administrative unit by the number of camping places per square kilometer
- Find the closest SBB station to position *
- Find all camping places being* meter away from water
- Find all train stations (‚remark‘ needs to contain „station“ in various languages) being * meter away from water
- Find all camping places being * meter away from water and * meter from a SBB train stop
- One medium sophisticated but interesting query of your own

# Architecture

![Architecture](./img/Architecture.png)

# Development

Start Database:
```Bash
cd ./src/server
docker-compose up
```
Start Server:
```Bash
cd ./src/server
npm run dev
```
Start Client:
```Bash
cd ./src/client
npm run serve
```

# References

Leaflet + Nodejs + Postgis Example: http://duspviz.mit.edu/web-map-workshop/leaflet_nodejs_postgis/

Leaflet Colorization Example: https://leafletjs.com/examples/choropleth/
