/**
 * init routes
 */

var mainController = require('../controllers/main');

module.exports = function(app) {
  app.get('/', mainController.index);
  app.get('/dump', mainController.dump);
};
