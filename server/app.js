
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes/index'),
    http = require('http'),
    path = require('path'),
    jsdom = require('jsdom'),
    nano = require('nano')('http://localhost:5984'),
    core = require('./core');

var app = express();

var db = nano.use('haltestellen');

db.list = function (designname, listname, viewname, callback) {
    var docpath = '_design/' + designname + '/_list/' +
            listname + '/' + viewname;
    nano.request({db: 'haltestellen',
                  doc: docpath,
                  method: 'GET'}, callback);
};

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(function (req, res, next) {
        req.db = nano;
        next();
    });
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/departure-times/:id', routes.departureTimes);
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
