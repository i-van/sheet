// users

var users = {
  _storage: [],
  add: function(user) {
    this._storage.push(user);
  },
  remove: function(id) {
    for (var i = this._storage.length; i--;) {
      if (this._storage[i]['id'] == id) {
        this._storage.splice(i);
      }
    }
  },
  find: function(id) {
    for (var i = this._storage.length; i--;) {
      if (this._storage[i]['id'] == id) {
        return this._storage[i];
      }
    }
  },
  getCurrentUser: function() {
    return this.find(this._currentUserId);
  },
  setCurrentUserId: function(id) {
    this._currentUserId = id;
  }
};

// sheet

var sheet = new Spreadsheet('spreadsheet');
sheet.onSelect = function(cell) {
  var user = users.getCurrentUser();
  if (!!user.activeCell) {
    this.selectCell(user.activeCell, 'clear');
  }
  socket.send(JSON.stringify({action: 'selectCell', data:{cell: cell, id: user.id}}));
  this.selectCell(cell, user.color);
  user.activeCell = cell;
};

// socket

var socket = new io.Socket(
  '192.168.1.2',
  {port: 3000, rememberTransport: false, reconnect: true, reconnectionDelay: 100}
);

socket.on('connect', function() {
  console.log('connected');
});

socket.on('disconnect', function() {
  console.log('disconnected');
});

var controller = {
  initUsers: function(data) {
    users.setCurrentUserId(socket.transport.sessionid);
    for (var i = data.users.length; i--;) {
      users.add(data.users[i]);
      if (!!data.users[i].activeCell) {
        sheet.selectCell(data.users[i].activeCell, data.users[i].color);
      }
    }
  },
  newUser: function(data) {
    users.add(data.user);
  },
  selectCell: function(data) {
    var user = users.find(data.id);
    if (!!user.activeCell) {
      sheet.selectCell(user.activeCell, 'clear');
    }
    sheet.selectCell(data.cell, user.color);
    user.activeCell = data.cell;
  },
  forgetUser: function(data) {
    var user = users.find(data.id);
    if (!!user.activeCell) {
      sheet.selectCell(user.activeCell, 'clear');
    }
    users.remove(data.id);
  }
};

socket.on('message', function(res) {
  try {
    var res = JSON.parse(res);
    console.log(res);
    controller[res.action](res.data);
  } catch(e) {
    console.log(e);
  }
});

socket.connect();