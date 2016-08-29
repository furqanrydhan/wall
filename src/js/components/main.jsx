import React from 'react';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import ChatInput from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';
import Roster from './roster.jsx';
import DirectMessageThread from './dm-thread.jsx';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      page: "home",
      actingUser: {},
    };
  }

  render() {
    if (this.state.page === "home") {
      return <Roster navigate={this.navigate} ></Roster>
    } else {
      return <DirectMessageThread thread_id={this.state.thread_id}/>
    }
  }
}

App.displayName = 'App';

export default App;
