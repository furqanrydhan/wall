/*eslint-disable */

// require('../shared/error-reporter');
var Promise = require('bluebird');

var App = require('./app.jsx');

document.addEventListener('DOMContentLoaded', function () {

  Bebo.onReady(function () {
    Bebo.User.getAsync = Promise.promisify(Bebo.User.get);
    Bebo.getRosterAsync = Promise.promisify(Bebo.getRoster);
    Bebo.getStreamFullAsync = Promise.promisify(Bebo.getStreamFull);
    App.init();
  });
});
