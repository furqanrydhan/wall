import React from 'react';
import ReactDOM from 'react-dom';
import App from './js/components/main.jsx';


const chat = {
  init: () => {
    return ReactDOM.render(<App />, document.getElementById('app'));
  },
};

module.exports = chat;
