exports.views = {
    allByName: {
        map: function(doc) {
            if(doc.geometry.features && doc.geometry.features[0]){
                var oldid = Math.floor(doc.geometry.features[0].properties.olifid/100);
                emit(doc.ort + " " + doc.bezeichnung, oldid );
            }
        }
    },
    allByCoords: {
        map: function(doc) {
            if(doc.geometry.features && doc.geometry.features[0]){
                var oldid =
                        Math.floor(doc.geometry.features[0].properties.olifid
                                   /100);
                emit(doc.geometry.features[0].geometry.coordinates,
                     {oldid: oldid,
                      location: doc.ort + " " + doc.bezeichnung});
            }
        }
    }
};

/*
 [{['', '']}]
 */

exports.lists = {
    next: function (head, req) {
        var row;
        var coords = JSON.parse(req.query.coords);
        var range = 0.005;
        var choices = [];
        while ((row = getRow())) {
            var distance = Math.sqrt(Math.pow(row.key[0] - coords[0], 2) +
                                     Math.pow(row.key[1] - coords[1], 2));
            if (distance <= range)
                choices.push({id: row.id,
                              oldid: row.value.oldid,
                              location: row.value.location,
                              distance: distance});
        }
        choices.sort(function(a, b) {
            if (a.distance < b.distance)
                return -1;
            else if (a.distance === b.distance)
                return 0;
            else
                return 1;
        });
        send(JSON.stringify({total_rows: choices.length,
                             rows: choices}));
    }
};
