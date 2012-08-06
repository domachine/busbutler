var core = require('../core');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.departureTimes = function(req, res){
    var id = req.params.id;
    req.nano.get(id, function(err, doc){
        var now = Number(new Date());
        if(doc.lastUpdate >== now-60)
            res.end(JSON.stringify(doc.departures));
        else
            core.update(doc, function(doc){
                res.end(JSON.stringify(doc.departures));
            }, nano);
    });
};