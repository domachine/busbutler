
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes/index'),
    http = require('http'),
    path = require('path'),
    startStopDaemon = require('start-stop-daemon'),
    nano = require('nano')('http://localhost:5984'),
    core = require('./core');

var app = express();

var db = nano.use('haltestellen');

var server;

db.list = function (designname, listname, viewname, params) {
    var docpath = '_design/' + designname + '/_list/' +
            listname + '/' + viewname;
    return nano.request({db: 'haltestellen',
                         doc: docpath,
                         method: 'GET',
                         params: params});
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
        req.nano = db;
        next();
    });
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/departure-times/:id', routes.departureTimes);
app.get('/allByName', routes.allByName);
app.get('/allByCoords', routes.allByCoords);
app.get('/', routes.index);

var options = {
    daemonFile: "log/server.dmn",
    outFile: "log/server.out",
    errFile: "log/server.err",
    onCrash: function(e){
        console.info("server crashed! Closing httpserver and restarting expressjs now ...", e);
        server.close();
        this.crashRestart();
    }
};

startStopDaemon(options, function() {
    server = http.createServer(app);
    server.listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
});