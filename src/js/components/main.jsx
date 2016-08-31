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
      currentThread: [],
      me: {},
      threadName: "",
    };
    this.store = {};
    this.navigate = this.navigate.bind(this);
    this.handleEventUpdate = this.handleEventUpdate.bind(this);
    this.getOldMessages = this.getOldMessages.bind(this);
    this.onThreadPresenceEvent = this.onThreadPresenceEvent.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }

  getOldMessages(thread_id, count, offset) {
    var that = this;
    Bebo.Db.get('dm_' + thread_id, { count: count}, (err, data) => {
      if (err) {
        console.log('error getting list');
        return;
      }
      
      // TODO merge and sort
      const list = data.result.reverse();
      that.store[thread_id] = list;
      if (that.state.page === thread_id) {
        that.setState({ currentThread: list });
      }
    });
  }

  handleEventUpdate(data) {
    console.log("New event", data);
    if (data.message) {
      this.handleMessageEvent(data.message);
    } else if (data.presence) {
      this.handlePresenceUpdates(data.presence);
    }
  }

  handlePresenceUpdates(presence) {
    if (this.onPresenceUpdate) {
      this.onThreadPresenceUpdate(presence);
    }
  }

  onThreadPresenceEvent(callback) {
    this.onThreadPresenceUpdate = callback;
  }

  handleMessageEvent(message) {
    if (message.thread_id === this.state.page) {
      var count = Math.max(this.state.currentThread.length, 50) + 1;
      this.getOldMessages(message.thread_id, count, 0);
    }
  }

  getMe() {
    var that = this;
    return Bebo.User.getAsync("me")
      .then(function(user) {
        that.setState({me: user});
        return user;
      });
  }
  
  componentWillMount() {
    this.getMe();
    Bebo.onEvent(this.handleEventUpdate);
  }

  navigate(page, threadName) {
    threadName === threadName || "";

    var currentThread = [];
    if (page !== 'home') {
      this.getOldMessages(page, 50, 0);
      if (this.store[page]) {
        currentThread = this.store[page];
      } 
    }
    this.setState({page: page, threadName: threadName, currentThread: currentThread});
  }

  updateUser(options) {
    var that = this;
    return Bebo.User.updateAsync(options)
      .then(function() {
        return that.getMe();
      });
  }

  uploadImage(file, callback) {
    var that = this;
    var reader = new FileReader();
    reader.onloadend = function () {
      Bebo.uploadImageAsync(reader.result)
        .then(function(image_url) {
          console.log("uploded image to bebo", image_url);
          return that.updateUser({image_url: image_url});
        }).then(callback);
    }
    reader.onerror = function(err) {
      console.error("error reading file", err);
    }
    reader.readAsDataURL(file);
  }

  render() {
    if (this.state.page === "home") {
      return <Roster me={this.state.me}
                     updateUser={this.updateUser}
                     uploadImage={this.uploadImage}
                     navigate={this.navigate} ></Roster>
    } else {
      return <DirectMessageThread messages = {this.state.currentThread} me={this.state.me} navigate={this.navigate} onPresenceEvent={this.onThreadPresenceEvent} thread_id={this.state.page} threadName={this.state.threadName}/>
    }
  }
}

App.displayName = 'App';

export default App;
