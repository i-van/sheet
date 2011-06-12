var Spreadsheet = function() {
  this.init.apply(this, arguments);
}
Spreadsheet.prototype = {
  init: function(id, cols, rows) {
    this._wrapper = $('#' + id);
    this._cols = cols || 10;
    this._rows = rows || 15;
    this._instance = 0;
    
    this._wrapper.css({
      '-moz-user-select': 'none',
      '-khtml-user-select': 'none',
      'user-select': 'none'
    });
    
    this._initTable();
    this._initInput();
    this._initSelect();
    
    for (var i = 0, n = this._cols; i < n; ++i) {
      this.setWidth(i, 65);
    }
  },
  _initSelect: function() {
    var that = this;
    this._table.delegate('td', 'click', function() {
      that.selectCell(that._parseCell($(this)));
    });
  },
  selectCell: function(cell) {
    if (!!this._selectedCell) {
      this._findCell(this._selectedCell).css({'background-color': 'inherit'});
    }
    this._selectedCell = cell;
    this._findCell(this._selectedCell).css({'background-color': '#C8C8C8'});
  },
  _initInput: function() {
    this._input = $('<input />')
      .attr('type', 'text')
      .css({position: 'absolute', 'z-index': 100, display:'none'})
      .appendTo(this._wrapper);
      
    var that = this;
    this._table.delegate('td', 'dblclick', function() {
      var e = $(this)
        , position = e.position();
      that._input
        .css({left:position.left - 1 + 'px', top: position.top - 1 + 'px'})
        .width(e.width())
        .height(e.height())
        .val(e.text())
        .show()
        .focus();
        
      that._activeCell = that._parseCell(e);
    });
    this._input.blur(function() {
      var e = $(this).hide();
      that.setCell(that._activeCell, e.val());
    });
  },
  _initTable: function() {
    this._table = $('<table></table>')
      .addClass('spreadsheet')
      .attr('cellspacing', 0)
      .attr('cellpadding', 0)
      .appendTo(this._wrapper);

    var body = []
      , n = this._rows
      , m = this._cols
      , id;
    for (var i = 0; i < n; ++i) {
      if (i == 0) {
        body.push('<tr>');
        body.push('<th></th>');
        for (var j = 0; j < m; ++j) {
          id = ['column', this._instance, j].join('-');
          body.push('<th id="' + id + '"></th>');
        }
        body.push('</tr>');
      }
      body.push('<tr>');
      id = ['row', this._instance, i].join('-');
      body.push('<th id="' + id + '"></th>');
      for (var j = 0; j < m; ++j) {
        id = ['cell', this._instance, i, j].join('-');
        body.push('<td id="' + id + '">' + i + ' ' + j + '</td>');
      }
      body.push('</tr>');
    }
    this._table.html(body.join(''));
    
    this._findCell({row: 0, column: 0}).css({'border-width': '1px'});
    for (var i = 1; i < n; ++i) {
      this._findCell({row: i, column: 0}).css({'border-width': '0 1px 1px 1px'});
    }
    for (var i = 1; i < m; ++i) {
      this._findCell({row: 0, column: i}).css({'border-width': '1px 1px 1px 0'});
    }
  },
  setWidth: function(column, width) {
    $('#' + ['column', this._instance, column].join('-')).width(width);
    return this;
  },
  setHeight: function(row, height) {
    $('#' + ['row', this._instance, row].join('-')).height(height);
    return this;
  },
  setCell: function(cell, data) {
    this._findCell(cell).html(data);
    return this;
  },
  _findCell: function(cell) {
    return $('#' + ['cell', this._instance, cell.row, cell.column].join('-'));
  },
  _parseCell: function(element) {
    var parts = element.attr('id').split('-');
    return {row:parts[2], column:parts[3]};
  }
};
