/**
 * main controller
 */

module.exports = {
  index: function(req, res) {
    res.render('index', {
      title: 'Sheet'
    });
  },
  dump: function(req, res) {
    res.send(
      'users:' + '<br />' + JSON.stringify(require('../models/users').getStorage()) + '<br />' + 
      'sheet:' + '<br />' + JSON.stringify(require('../models/sheet').getStorage())
    );
  }
};