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
                                                                        'properties', json_build_object('name', sub.name, 'nbrOfCampings', sub.nbrOfCampings))))
                                            FROM (SELECT b.name as name, count(cp.geom) as nbrOfCampings, b.geom as geom FROM bezirk_poly as b LEFT JOIN camping_points as cp 
                                            ON st_contains(b.geom,cp.geom) 
                                            GROUP BY b.name, b.geom) as sub;`

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

/* GET the map page */
router.get('/map', function(req, res) {
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
router.get('/filter*', function (req, res) {
    var name = req.query.name;
    if (name.indexOf("--") > -1 || name.indexOf("'") > -1 || name.indexOf(";") > -1 || name.indexOf("/*") > -1 || name.indexOf("xp_") > -1){
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


