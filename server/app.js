
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes/index'),
    http = require('http'),
    path = require('path'),
    jsdom = require('jsdom'),
    nano = require('nano')('http://localhost:5984/haltestellen'),
    core = require('./core');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(function (req, res, next) {
        req.nano = nano;
        next();
    });
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/:id', routes.departureTimes);
app.get('/', routes. index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
