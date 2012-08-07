var core = require('../core');

/*
 * GET home page.
 */

exports.departureTimes = function(req, res){
    var id = req.params.id;
    req.nano.get(id, function(err, doc){
        if (err){
            res.end(JSON.stringify(err));
            return;
        }
        if (doc === undefined){
            res.end(JSON.stringify("Keine Daten verfügbar."));
            return;
        }
        var now = Number(new Date());
        if(now - doc.lastUpdate <= 45 * 1000)
            res.end(JSON.stringify({rows: doc.departures, lastUpdate: doc.lastUpdate}));
        else
            core.update(doc, function(err, doc){
                if (err)
                    res.end(JSON.stringify(err));
                else
                    res.end(JSON.stringify({rows: doc.departures, lastUpdate: now}));
            }, req.nano);
    });
};

exports.allByName = function(req, res){
    req.nano.view("view", "allByName", {}).pipe(res);
};

exports.allByCoords = function(req, res){
    req.nano.list("view", "next", "allByCoords", req.query).pipe(res);
};
