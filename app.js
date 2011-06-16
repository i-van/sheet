/**
 * module dependencies
 */

var express = require('express')
  , io = require('socket.io');

var app = module.exports = express.createServer()
  , socket = io.listen(app, {transports: ['websocket', 'xhr-polling', 'xhr-multipart']});

// configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({src: __dirname + '/public', enable: ['sass']}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure('production', function() {
  app.use(express.errorHandler());
});

// routes

require('./config/routes')(app);

// socket.io

require('./controllers/socket.io')(socket);

// run

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
