module.exports = {
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
  }
};