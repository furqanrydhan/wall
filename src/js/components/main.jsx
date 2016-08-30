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
      me: {},
      threadName: "",
    };
    this.navigate = this.navigate.bind(this);
  }
  
  componentWillMount() {
    var that = this;
    Bebo.User.getAsync("me")
      .then(function(user) {
        that.setState({me: user});
      });
  }

  navigate(page, threadName) {
    threadName === threadName || "";
    this.setState({page: page, threadName: threadName});
  }

  render() {
    if (this.state.page === "home") {
      return <Roster me={this.state.me} navigate={this.navigate} ></Roster>
    } else {
      return <DirectMessageThread me={this.state.me} navigate={this.navigate} thread_id={this.state.page} threadName={this.state.threadName}/>
    }
  }
}

App.displayName = 'App';

export default App;
