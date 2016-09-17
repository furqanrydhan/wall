/*eslint-disable */
import './style.scss';                                                                                                                                                                                                                                                                                                   
// require('../shared/error-reporter');
//
console.timeStamp && console.timeStamp("app.js load");

var App = require('./app.jsx');

Bebo.onReady(function () {
  console.timeStamp && console.timeStamp("Bebo.onReady");
  var dbGet = Bebo.Db.get;
  Bebo.Db.get = function(table, params) {
    return dbGet(table, params)
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
