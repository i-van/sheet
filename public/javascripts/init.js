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
  },
  getCurrentUserId: function() {
    return this._currentUserId;
  },
  setCurrentUserName: function(name) {
    this._currentUserName = name || 'noname';
  },
  getCurrentUserName: function(name) {
    return this._currentUserName;
  },
  reset: function() {
    this._storage = [];
  },
  showList: function() {
    var area = $('#message-area')
      , list = area.find('#users-list')
      , body = [];
    if (list.length == 0) {
      list = $('<ul></ul>').attr('id', 'users-list').css({width: '200px'}).appendTo(area);
    }
    for (var i = this._storage.length; i--;) {
      var user = this._storage[i];
      if (!!user.name) {
        body.push('<li style="background-color: ' + user.color + '">');
        body.push(user.name);
        body.push('</li>');
      }
    }
    list.empty().html(body.join(''));
  }
};

// meggases

var area = $('#message-area')
  , message = $('<div></div>').text('Please enter your name').appendTo(area)
  , contact = $('<div></div>').appendTo(area);
  
contact.append('<input type="text" /><input type="button" value="ok" />')
  .find('input:button').click(function() {
    var name = $(this).parent().hide().find('input:text').val();
    users.setCurrentUserName(name);
    message.text('Please wait');
    socket.connect();
  });

// sheet

var sheet = new Spreadsheet('spreadsheet');
sheet.onSelect = function(cell) {
  var user = users.getCurrentUser();
  if (!!user.activeCell) {
    this.selectCell(user.activeCell, 'clear');
  }
  socket.send(JSON.stringify({action: 'selectCell', data: {cell: cell, id: user.id}}));
  this.selectCell(cell, user.color);
  user.activeCell = cell;
};

sheet.onEdit = function(cell) {
  var user = users.getCurrentUser()
    , value = this._input.val();
  this.setCell(cell, value);
  socket.send(JSON.stringify({action: 'setCell', data: {cell: cell, value: value, id: user.id}}));
};

// socket

var controller = {
  sync: function(data) {
    var id = socket.transport.sessionid
      , name = users.getCurrentUserName();
    users.setCurrentUserId(id);
    users.reset();
    for (var i = data.users.length; i--;) {
      if (!!data.users[i].activeCell) {
        sheet.selectCell(data.users[i].activeCell, data.users[i].color);
      }
      if (data.users[i]['id'] == id) {
        data.users[i]['name'] = name;
      }
      users.add(data.users[i]);
    }
    sheet.setData(data.sheet);
    users.showList();
    sheet.show();
    socket.send(JSON.stringify({action: 'setName', data: {name: name, id: id}}));
  },
  newUser: function(data) {
    users.add(data.user);
    users.showList();
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
    users.showList();
  },
  setCell: function(data) {
    sheet.setCell(data.cell, data.value);
  },
  setName: function(data) {
    var user = users.find(data.id);
    user.name = data.name;
    users.showList();
  }
};

var socket = new io.Socket(
  location.hostname,
  {port: location.port, rememberTransport: false, reconnect: true, reconnectionDelay: 100}
);

socket.on('connect', function() {
  console.log('connected');
  message.text('You are connected');
});

socket.on('disconnect', function() {
  console.log('disconnected');
  message.text('You are disconnected');
});

socket.on('message', function(res) {
  try {
    var res = JSON.parse(res);
    console.log(res);
    controller[res.action](res.data);
  } catch(e) {
    console.log(e);
  }
});
