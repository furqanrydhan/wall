/*eslint-disable */

// require('../shared/error-reporter');
var Promise = require('bluebird');

var App = require('./app.jsx');

document.addEventListener('DOMContentLoaded', function () {

  Bebo.onReady(function () {
    Bebo.User.getAsync = Promise.promisify(Bebo.User.get);
    Bebo.User.updateAsync = Promise.promisify(Bebo.User.update);
    Bebo.getStreamFullAsync = Promise.promisify(Bebo.getStreamFull);
    var getRosterAsync = Promise.promisify(Bebo.getRoster);
    Bebo.getRosterAsync= function () {
      return getRosterAsync()
        .then(function(json) {
          if (json.code != 200) {
            throw new Error("Not 200");
          } else {
            return json.result;
          }
        });
    }
    Bebo.UI.disableKeyboardDoneStrip();
    App.init();
  });
});
