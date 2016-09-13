/*eslint-disable */
import './style.scss';                                                                                                                                                                                                                                                                                                   
// require('../shared/error-reporter');
//
console.timeStamp && console.timeStamp("app.js load");

var Promise = require('bluebird');

var App = require('./app.jsx');

Bebo.onReady(function () {
  console.timeStamp && console.timeStamp("Bebo.onReady");
  Bebo.User.getAsync = Promise.promisify(Bebo.User.get);
  Bebo.uploadImageAsync = Promise.promisify(Bebo.uploadImage);
  Bebo.User.updateAsync = Promise.promisify(Bebo.User.update);
  Bebo.Db.saveAsync = Promise.promisify(Bebo.Db.save);

  var getAsync = Promise.promisify(Bebo.Db.get);
  Bebo.Db.getAsync = function(table, params) {
    return getAsync(table, params)
      .then(function(json) {
        if (json.code != 200) {
          throw new Error("Not 200");
        } else {
          return json.result;
        }
      });
  };

  Bebo.Db.deleteAsync = Promise.promisify(Bebo.Db.delete);
  if (Bebo.getStreamFull) {
    Bebo.getStreamFullAsync = Promise.promisify(Bebo.getStreamFull);
  } else {
    Bebo.getStreamFullAsync = Promise.promisify(Bebo.getStream);
  }
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
  };
  Bebo.UI.disableKeyboardDoneStrip();
  var app = App.init();
  if (app) {
    app.online();
  }
});
