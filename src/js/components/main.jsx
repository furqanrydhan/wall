import React from 'react';
import Promise from 'bluebird';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import ChatInput from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';
import Helper from '../helper.js';
import Roster from './roster.jsx';
import DirectMessageThread from './dm-thread.jsx';

function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

var hasLocalStorage = false;
if (storageAvailable('localStorage')) {
  hasLocalStorage = true;
}

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
    this.db = {};
    this.stream_id = Bebo.getStreamId();
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
    this.roster = {};
    this.db.getImageUrl = this.getImageUrl.bind(this);
  }

  componentWillMount() {
    console.timeStamp && console.timeStamp("Main.componentWillMount");
    var that = this;
    this.initialRosterFromStorage();
    this.getFullRoster()
    .then(function() {
      return that.getUnreadAndUpdate();
    }).then(function() {
      Bebo.onViewerUpdate(that.viewerUpdate);
      Bebo.onEvent(that.handleEventUpdate);
    });
  }

  initialRosterFromStorage() {
    if (!hasLocalStorage) {
      return;
    }
    var json = window.localStorage.getItem("roster:" + this.stream_id);
    if (!json) {
      return;
    }
    this.roster = JSON.parse(json);
    var online = _.filter(_.values(this.roster), {online: true});
    var offline = _.filter(_.values(this.roster), {online: false});
    this.setState({online: online,
                   offline: offline});
  };

  persistRoster(roster) {
    if (! hasLocalStorage) {
      return;
    }
    var json = JSON.stringify(roster);
    window.localStorage.setItem("roster:" + this.stream_id, json);
  }
  /*
   * Roster Data
   */

  setRosterState(roster) {
    this.roster = roster;
    this.persistRoster(roster);
    var online = _.filter(_.values(this.roster), {online: true});
    var offline = _.filter(_.values(this.roster), {online: false});
    this.setState({online: online,
                   offline: offline});
  }

  getUnreadAndUpdate(thread_id) {
    var that = this;
    var params = {user_id: this.state.me.user_id, count: 200};
    if (thread_id) {
      params.thread_id = thread_id;
    }
    return Bebo.Db.getAsync('unread', params)
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
    var props = { roster: Bebo.getRosterAsync(),
                  stream: Bebo.getStreamFullAsync() };
    if (!this.state.me.user_id) {
      props.me = this.getMe();
    } else {
      props.unread = Bebo.Db.getAsync('unread', {user_id: this.state.me.user_id, count: 200});
    }
    return Promise.props(props)
      .then(function (data) {
      console.timeStamp && console.timeStamp("GotFullRosterData");

      var me = that.state.me.user_id && that.state.me || data.me && data.me.user_id && data.me;
      var roster = {};
      var l = data.roster.length;
      for (var i=0; i< l; i++) {
        var user = data.roster[i];
        user.image_url = user.image_url + "?h=72&w=72";
        user.online = false;
        roster[user.user_id] = user;
        roster[user.user_id].thread_id = Helper.mkThreadId(me, user.user_id);
      }
      l = data.stream.viewer_ids.length;
      for (var i=0; i< l; i++) {
        var viewer_id = data.stream.viewer_ids[i];
        roster[viewer_id].online = true;
      }
      if (data.unread) {
        l = data.unread.length;
        for (var i=0; i< l; i++) {
          var unread = data.unread[i];
          var user_id = Helper.getPartnerFromThreadId(me, unread.thread_id);
          if (roster[user_id]) {
            roster[user_id].unread = unread.unread_cnt;
          }
        }
      }
      delete roster[me.user_id];
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
    Bebo.Db.get('dm', { thread_id: thread_id, count: count}, (err, data) => {
      if (err) {
        console.error('error getting list');
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
    if (data.message) {
      this.handleMessageEvent(data.message);
    } else if (data.presence) {
      this.handlePresenceUpdates(data.presence);
    } else {
      console.warn("Unexpected event", data);
    }
  }

  handlePresenceUpdates(presence) {
    if (this.onPresenceUpdate) {
      this.onThreadPresenceUpdate(presence);
    }
  }

  incrUnreadMessage(thread_id, to_user_id) {
    return Bebo.Db.getAsync('unread', {user_id: to_user_id, thread_id: thread_id})
      .then(function(data) {
        var row;
        if (data && data.length > 0) {
          row = data[0];
        }
        if (! row) {
          row = { user_id: to_user_id,
                  thread_id: thread_id,
                  unread_cnt: 0 };
        }
        row.unread_cnt = row.unread_cnt + 1;
        return Bebo.Db.saveAsync('unread', row);
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
    return Bebo.Db.getAsync('unread', {user_id: this.state.me.user_id, thread_id: thread_id})
      .then(function(data) {
        var row;
        if (data && data.length > 0) {
          row = data[0];
        }
        if (! row) {
          return;
        }
        row.unread_cnt = 0;
        return Bebo.Db.saveAsync('unread', row);
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
    console.timeStamp && console.timeStamp("Bebo.User.me request");
    return Bebo.User.getAsync("me")
      .then(function(user) {
        console.timeStamp && console.timeStamp("Bebo.User.me response");
        user.image_url = user.image_url + "?w=144&h=144";
        that.setState({me: user});
        return user;
      });
  }

  getImageUrl(user_id) {
    if (user_id === this.state.me.user_id) {
      return this.state.me.image_url;
    }
    var user = this.roster[user_id];
    if (user) {
      return user.image_url;
    }
    return Bebo.getImageUrl() + "image/user/" + user_id  + "?w=72&h=72";
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
        db={this.db}
        onPresenceEvent={this.onThreadPresenceEvent}
        thread_id={this.state.page}
        threadName={this.state.threadName}/>
    }
  }
}

App.displayName = 'App';

export default App;
