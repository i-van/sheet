module.exports = ({
  _cols: 10,
  _rows: 25,
  _storage: [],
  _default: '',
  set: function(cell, value) {
    this._storage[cell.row][cell.column] = value;
  },
  get: function(cell) {
    return this._storage[cell.row][cell.column];
  },
  init: function() {
    var n = this._rows
      , m = this._cols
      , row;
      
    for (var i = 0; i < n; ++i) {
      row = [];
      for (var j = 0; j < m; ++j) {
        row.push(this._default);
      }
      this._storage.push(row);
    }
    
    return this;
  }
}).init();