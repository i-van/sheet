/**
 * Module dependencies.
 */

var express = require('express')
  , io = require('socket.io');

var app = module.exports = express.createServer()
  , socket = io.listen(app, {transports: ['websocket', 'xhr-polling', 'xhr-multipart']});

// Configuration

app.configure( function() {
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

// Routes

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Sheet'
  });
});

app.get('/dump', function(req, res) {
  res.send(
    'users:' + '<br />' + JSON.stringify(users._storage) + '<br />' + 
    'sheet:' + '<br />' + JSON.stringify(sheet._storage)
  );
});

// socket.io

var users = require('./models/users');
var sheet = require('./models/sheet');

var controller = {
  selectCell: function(data) {
    var user = users.find(data.id);
    user.activeCell = data.cell;
  },
  setCell: function(data) {
    sheet.set(data.cell, data.value);
  },
  randomColor: function() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  },
  setName: function(data) {
    var user = users.find(data.id);
    user.name = data.name;
  }
};

socket.on('connection', function(client) {
  var id = client.sessionId
    , color = controller.randomColor();

  users.add({id: id, color: color});

  client.send(JSON.stringify({
    action: 'sync',
    data: {
      users: users._storage,
      sheet: sheet._storage
    }
  }));

  client.broadcast(JSON.stringify({
    action: 'newUser',
    data: {
      user: {id: id, color: color}
    }
  }));

  client.on('message', function(res) {
    client.broadcast(res);
    try {
      var res = JSON.parse(res);
      controller[res.action](res.data);
    } catch(e) {
      console.log(e);
    }
  });
  
  client.on('disconnect', function() {
    users.remove(id);
    client.broadcast(JSON.stringify({
      action: 'forgetUser',
      data: {
        id: id
      }
    }));
  });
});

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
