import React from 'react';
import Promise from 'bluebird';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import ChatInput from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';
import Helper from '../helper.js';
import Roster from './roster.jsx';
import DirectMessageThread from './dm-thread.jsx';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      page: "home",
      currentThread: [],
      me: {},
      online: [],
      offline: [],
      threadName: "",
    };
    this.store = {};
    this.navigate = this.navigate.bind(this);
    this.handleEventUpdate = this.handleEventUpdate.bind(this);
    this.getOldMessages = this.getOldMessages.bind(this);
    this.onThreadPresenceEvent = this.onThreadPresenceEvent.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.viewerUpdate= this.viewerUpdate.bind(this);
    this.getFullRoster = this.getFullRoster.bind(this);
    this.setRosterState = this.setRosterState.bind(this);
    this.incrUnreadMessage = this.incrUnreadMessage.bind(this);
    this.clearUnreadMessage = this.clearUnreadMessage.bind(this);
    this.getUnreadAndUpdate = this.getUnreadAndUpdate.bind(this);
    Bebo.onViewerUpdate(this.viewerUpdate);
    this.roster = {};
  }

  componentWillMount() {
    this.getMe().then(this.getFullRoster);
    Bebo.onEvent(this.handleEventUpdate);
  }

  /*
   * Roster Data
   */

  setRosterState(roster) {
    this.roster = roster;
    var online = _.filter(_.values(this.roster), {online: true});
    var offline = _.filter(_.values(this.roster), {online: false});
    this.setState({online: online,
                   offline: offline});
  }

  getUnreadAndUpdate(thread_id) {
    var that = this;
    var params = {count: 200};
    if (thread_id) {
      params.thread_id = thread_id;
    }
    return Bebo.Db.getAsync('dm_unread_' + this.state.me.user_id, params)
      .then(function(data) {
        var l = data.length;
        var roster = that.roster;
        for (var i=0; i< l; i++) {
          var unread = data[i];
          var user_id = Helper.getPartnerFromThreadId(that.state.me, unread.thread_id);
          if (roster[user_id]) {
            roster[user_id].unread = unread.unread_cnt;
          }
        }
        that.setRosterState(roster);
      });
  }

  getFullRoster() {
    var that = this;
    var props = { unread: Bebo.Db.getAsync('dm_unread_' + that.state.me.user_id, {count: 200}),
                  roster: Bebo.getRosterAsync(),
                  stream: Bebo.getStreamFullAsync() };
    return Promise.props(props)
      .then(function (data) {
      var roster = {};
      var l = data.roster.length;
      for (var i=0; i< l; i++) {
        var user = data.roster[i];
        user.online = false;
        roster[user.user_id] = user;
        roster[user.user_id].thread_id = Helper.mkThreadId(that.state.me, user.user_id);
      }
      l = data.stream.viewer_ids.length;
      for (var i=0; i< l; i++) {
        var viewer_id = data.stream.viewer_ids[i];
        roster[viewer_id].online = true;
      }
      console.log("Unread DATA", data.unread);
      l = data.unread.length;
      for (var i=0; i< l; i++) {
        var unread = data.unread[i];
        var user_id = Helper.getPartnerFromThreadId(that.state.me, unread.thread_id);
        if (roster[user_id]) {
          roster[user_id].unread = unread.unread_cnt;
        }
      }
      delete roster[that.state.me.user_id];
      that.setRosterState(roster);
    });
  }

  viewerUpdate(viewer_ids) {
    var resync = false;
    var rosterList = _.values(this.roster);
    var l = rosterList.length;
    for (var i=0; i< l; i++) {
      rosterList[i].online = false;
    }
    var roster = this.roster;
    var l = viewer_ids.length;
    for (var i=0; i< l; i++) {
      var viewer_id = viewer_ids[i];
      if (viewer_id === this.state.me.user_id) {
        continue;
      } else if (roster[viewer_id]) {
        roster[viewer_id].online = true;
      } else {
        resync = true;
      }
    }
    this.setRosterState(roster);
    if (resync === true) {
      _.defer(this.getFullRoster);
    }
  }

  /*
   * Message Data
   */

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

  incrUnreadMessage(thread_id, to_user_id) {
    return Bebo.Db.getAsync('dm_unread_' + to_user_id, { thread_id: thread_id})
      .then(function(data) {
        console.log("THREAD COUNTER DATA", data);
        var row;
        if (data && data.length > 0) {
          row = data[0];
        }
        if (! row) {
          row = { thread_id: thread_id,
                  unread_cnt: 0 };
        }
        row.unread_cnt = row.unread_cnt + 1;
        return Bebo.Db.saveAsync('dm_unread_' + to_user_id, row);
      });
  }

  // FIXME put this back in once we have delete working - no need to have this
  // in the table and fetch it
  // :w
  // 
  // clearUnreadMessage(thread_id) {
  //   var params = {thread_id: thread_id};
  //   console.log("DELETE", to_user_id, params);
  //   return Bebo.Db.deleteAsync('dm_unread_' + to_user_id, { thread_id: thread_id});
  // }
  clearUnreadMessage(thread_id) {
    var user_id = Helper.getPartnerFromThreadId(this.state.me, thread_id);
    if (this.roster[user_id]) {
      this.roster[user_id].unread = 0;
    }
    this.setRosterState(this.roster);
    var that = this;
    return Bebo.Db.getAsync('dm_unread_' + this.state.me.user_id, { thread_id: thread_id})
      .then(function(data) {
        var row;
        if (data && data.length > 0) {
          row = data[0];
        }
        if (! row) {
          return;
        }
        row.unread_cnt = 0;
        return Bebo.Db.saveAsync('dm_unread_' + that.state.me.user_id, row);
      });
  }

  onThreadPresenceEvent(callback) {
    this.onThreadPresenceUpdate = callback;
  }

  handleMessageEvent(message) {
    if (message.thread_id === this.state.page) {
      var count = Math.max(this.state.currentThread.length, 50) + 1;
      this.getOldMessages(message.thread_id, count, 0);
    } else {
      this.getUnreadAndUpdate(message.thread_id);
      this.getOldMessages(message.thread_id, 50, 0);
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
  

  navigate(page, threadName) {
    threadName === threadName || "";

    var currentThread = [];
    if (page !== 'home') {
      this.getOldMessages(page, 50, 0);
      if (this.store[page]) {
        currentThread = this.store[page];
      } 
      this.clearUnreadMessage(page);
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

  uploadImage(url) {
    var that = this;
    return Bebo.uploadImageAsync(url)
      .then(function(image_url) {
        console.log("uploded image to bebo", image_url);
        return that.updateUser({image_url: image_url});
      });
  }

  render() {
    if (this.state.page === "home") {
      return <Roster me={this.state.me}
                     online={this.state.online}
                     offline={this.state.offline}
                     updateUser={this.updateUser}
                     uploadImage={this.uploadImage}
                     navigate={this.navigate} ></Roster>
    } else {
      return <DirectMessageThread
        messages = {this.state.currentThread}
        me={this.state.me}
        incrUnreadMessage={this.incrUnreadMessage}
        navigate={this.navigate}
        onPresenceEvent={this.onThreadPresenceEvent}
        thread_id={this.state.page}
        threadName={this.state.threadName}/>
    }
  }
}

App.displayName = 'App';

export default App;
