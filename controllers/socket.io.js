/**
 * init socket.io
 */

var users = require('../models/users');
var sheet = require('../models/sheet');

var controller = {
  selectCell: function(data) {
    var user = users.find(data.id);
    user.activeCell = data.cell;
  },
  setCell: function(data) {
    sheet.set(data.cell, data.value);
  },
  randomColor: function() {
    var color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    return color.length === 7 ? color : this.randomColor();
  },
  setName: function(data) {
    var user = users.find(data.id);
    user.name = data.name;
  }
};

module.exports = function(socket) {
  socket.on('connection', function(client) {
    var id = client.sessionId
      , color = controller.randomColor();
  
    users.add({id: id, color: color});
  
    client.send(JSON.stringify({
      action: 'sync',
      data: {
        users: users.getStorage(),
        sheet: sheet.getStorage()
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
};
