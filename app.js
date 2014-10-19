/**
 * Module dependencies
 */

var express = require('express'),
    routes = require('./routes'),
    api = require('./routes/api'),
    socket = require('./routes/socket.js'),
    http = require('http'),
    path = require('path'),
    socketio = require('socket.io');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = socketio.listen(server);
/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
    // TODO
};


/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/*
 Socket.io Communication
 Handle all incoming connections in the connection event listener of the io.sockets object
*/
io.sockets.on('connection', socket);

/**
 * Start Server
 */

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
