var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine

/* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg"); // require Postgres module
var conString = "postgres://postgres:peder@192.168.99.101:5432/gis"; // Your Database Connection

// Set up your database query to display GeoJSON
var camping_query = `SELECT json_build_object('type', 'FeatureCollection', 
                                              'features', json_agg(ST_AsGeoJSON(cp.*)::json)) 
                    FROM camping_points as cp;`

var campingPerSquarePerAdminUnit_query = `SELECT json_build_object('type', 'FeatureCollection', 
                                                                    'features', json_agg(json_build_object(
                                                                        'type', 'Feature',
                                                                        'geometry', ST_AsGeoJSON(sub.geom)::json, 
                                                                        'properties', json_build_object('id', sub.id, 'name', sub.name, 'nbrOfCampings', sub.nbrOfCampings, 'area', sub.area))))
                                            FROM (SELECT b.id as id, b.name as name, count(cp.geom) as nbrOfCampings, ST_AREA(ST_TRANSFORM(b.geom,3857)) as area, b.geom as geom FROM bezirk_poly as b LEFT JOIN camping_points as cp 
                                            ON st_contains(b.geom,cp.geom) 
                                            GROUP BY b.id, b.geom) as sub;`

var nbrOfBordersPerLake_query = `SELECT json_build_object('type', 'FeatureCollection', 
                                                        'features', json_agg(json_build_object(
                                                            'type', 'Feature', 
                                                            'geometry', ST_AsGeoJSON(sub.geom)::json,
                                                            'properties', json_build_object('name', sub.name, 'nbrOfBorders', sub.nbrOfBorders)))) 
                                FROM (SELECT s.id1 as name, count(b.name) as nbrOfBorders, s.geom as geom 
                                    FROM bezirk_poly as b INNER JOIN seen_poly as s
                                    ON st_touches(b.geom, s.geom)
                                    GROUP BY s.id1, s.geom) as sub`;

module.exports = router;

/* GET Postgres JSON data */

router.get('/camping', function (req, res) {
    var client = new pg.Client(conString);
    client.connect();

    var query = client.query(camping_query);
    query.then((response) => res.send(response.rows[0].json_build_object));
    // query.then((response) => console.log(response.rows[0]));
});

router.get('/camping-per-square-per-adminunit', function (req, res) {
    var client = new pg.Client(conString);
    client.connect();

    var query = client.query(campingPerSquarePerAdminUnit_query);
    query.then((response) => res.send(response.rows[0].json_build_object));
    // query.then((response) => console.log(response.rows));
});

router.get('/nbr-of-borders-per-lake', function (req, res) {
    var client = new pg.Client(conString);
    client.connect();

    var query = client.query(nbrOfBordersPerLake_query);
    query.then((response) => res.send(response.rows[0].json_build_object));
    // query.then((response) => console.log(response.rows));
});

router.get('/intersectionModel', function (req, res) {
    var id1 = req.query.id1;
    var id2 = req.query.id2;
    var intersectionModel_query = `SELECT ST_Relate(a.geom, b.geom)  FROM 
                                (SELECT id, geom FROM bezirk_poly WHERE id = ${id1}) as a,
                                (SELECT id, geom FROM bezirk_poly WHERE id = ${id2}) as b;`;
    var client = new pg.Client(conString);
    client.connect();

    var query = client.query(intersectionModel_query);
    query.then((response) => res.send(response.rows[0]));
    // query.then((response) => console.log(response.rows));
});

router.get('/nearestStation', function (req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var nearestStation_query = `SELECT json_build_object('type', 'Feature', 
                                                        'geometry', ST_AsGeoJSON(sub.geom)::json,
                                                        'properties', json_build_object('name', sub.remark, 'meters', distance))
                            FROM (SELECT  MIN(ST_DISTANCE(ST_Transform(s.geom, 3857 ), ST_Transform(ST_GeomFromText('SRID=4326;POINT(${lng} ${lat})'), 3857 ))) as distance, 
                                            s.remark, s.geom FROM sbb_points as s GROUP BY s.remark, s.geom) as sub
                            ORDER BY sub.distance 
                            LIMIT 1;`;
    var client = new pg.Client(conString);
    client.connect();

    var query = client.query(nearestStation_query);
    query.then((response) => res.send(response.rows[0].json_build_object));
});

router.get('/camping_place', function (req, res) {
    var distanceToWater = req.query.distanceWater;
    var distanceToStation = req.query.distanceStation;
    var nearestStation_query = `SELECT json_build_object('type', 'FeatureCollection', 
                                                        'features', json_agg(json_build_object(
                                                            'type', 'Feature',
                                                            'geometry', ST_AsGeoJSON(sub.geom)::json, 
                                                            'properties', json_build_object('id', sub.id, 'name', sub.name, 'distanceToLake', sub.distance_to_lake, 'distanceToRiver', sub.distance_to_river, 'distanceToStation', sub.distance_to_train_station))))
                            FROM (SELECT id, geom, name, distance_to_river, distance_to_lake, distance_to_train_station FROM camping_points_w_distance as cp `;

    if (distanceToWater != '' && distanceToStation != '') {
        nearestStation_query += `WHERE (distance_to_river <= ${distanceToWater} or distance_to_lake <= ${distanceToWater}) AND distance_to_train_station <= ${distanceToStation}) as sub;`;
    } else if (distanceToWater != '') {
        nearestStation_query += `WHERE (distance_to_river <= ${distanceToWater} or distance_to_lake <= ${distanceToWater})) as sub;`;
    } else if (distanceToStation != '') {
        nearestStation_query += `WHERE distance_to_train_station <= ${distanceToStation}) as sub;`;
    } else {
        nearestStation_query += ') as sub;';
    }

    var client = new pg.Client(conString);
    client.connect();

    var query = client.query(nearestStation_query);
    query.then((response) => res.send(response.rows[0].json_build_object));
});

router.get('/train_station', function (req, res) {
    var distanceToWater = req.query.distanceWater;
    var nearestStation_query = `SELECT json_build_object('type', 'FeatureCollection', 
                                                        'features', json_agg(json_build_object(
                                                            'type', 'Feature',
                                                            'geometry', ST_AsGeoJSON(sub.geom)::json, 
                                                            'properties', json_build_object('id', sub.id, 'name', sub.remark, 'distanceToLake', sub.distance_to_lake, 'distanceToRiver', sub.distance_to_river))))
                            FROM (SELECT id, geom, remark, distance_to_river, distance_to_lake FROM train_station_w_distance `;

    if (distanceToWater != '') {
        nearestStation_query += `WHERE (distance_to_river <= ${distanceToWater} or distance_to_lake <= ${distanceToWater})) as sub;`;
    } else {
        nearestStation_query += ') as sub;';
    }

    var client = new pg.Client(conString);
    client.connect();

    var query = client.query(nearestStation_query);
    query.then((response) => res.send(response.rows[0].json_build_object));
});

/* GET the map page */
router.get('/map', function (req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query(coffee_query);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json
        res.render('map', {
            title: "Express API",
            jsonData: data
        });
    });
});

/* GET the filtered page */
router.get('/filter', function (req, res) {
    var name = req.query.name;
    if (name.indexOf("--") > -1 || name.indexOf("'") > -1 || name.indexOf(";") > -1 || name.indexOf("/*") > -1 || name.indexOf("xp_") > -1) {
        console.log("Bad request detected");
        res.redirect('/map');
        return;
    } else {
        console.log("Request passed")
        var filter_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, name)) As properties FROM cambridge_coffee_shops As lg WHERE lg.name = \'" + name + "\') As f) As fc";
        var client = new pg.Client(conString);
        client.connect();
        var query = client.query(filter_query);
        query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            var data = result.rows[0].row_to_json
            res.render('map', {
                title: "Express API",
                jsonData: data
            });
        });
    };
});


