import React from 'react';
import Promise from 'bluebird';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import GiphyBrowser from './giphy-browser.jsx';
import Helper from '../helper.js';
import Wall from './wall.jsx';
import PhotoEditor from './PhotoEditor.jsx';
import Post from './chat-input.jsx';
import DropZone from 'react-dropzone';
import LoadImage from 'blueimp-load-image';

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
      context: {},
      messages: [],
      me: {},
      threadName: ""
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
    this.onClosePhotoEditor = this.onClosePhotoEditor.bind(this);
    this.onPhotoUpload = this.onPhotoUpload.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.online = this.online.bind(this);
    this.roster = {};
    this.db.getImageUrl = this.getImageUrl.bind(this);
  }

  online() {
    var that = this;
    this.getFullRoster()
    .then(function() {
      return that.getUnreadAndUpdate();
    }).then(function() {
      Bebo.onViewerUpdate(that.viewerUpdate);
      Bebo.onEvent(that.handleEventUpdate);
    });
  }

  componentWillMount() {
    console.timeStamp && console.timeStamp("Main.componentWillMount");
    var that = this;
    this.getOldMessages();
  }

  componentDidMount() {
    console.timeStamp && console.timeStamp("Main.componentDidMount");
  }

  initialRosterFromStorage() {
    var online = this.read("online");
    var offline = this.read("offline");
    var me = this.read("me");
    if (!me || !offline) {
      return;
    }
    console.timeStamp && console.timeStamp("initialRosterFromStorage complete");
    this.setState({online: online,
                   offline: offline,
                   me: me});
  };

  read(key) {
    if (!hasLocalStorage) {
      return;
    }
    var json = window.localStorage.getItem("dm:" + key + ":" + this.stream_id);
    if (!json) {
      return;
    }
    return JSON.parse(json);
  }

  persist(key, value) {
    if (! hasLocalStorage) {
      return;
    }
    var json = JSON.stringify(value);
    window.localStorage.setItem("dm:" + key + ":" + this.stream_id, json);
  }
  /*
   * Roster Data
   */

  setRosterState(roster) {
    this.roster = roster;
    var online = _.filter(_.values(this.roster), {online: true});
    var offline = _.filter(_.values(this.roster), {online: false});
    this.persist("online", online);
    this.persist("offline", offline);
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

  getOldMessages(thread_id,  count, offset) {
    // handle thread Id later
    var that = this;
    Bebo.Db.get('post', {count: count}, (err, data) => {
      if (err) {
        console.error('error getting list');
        return;
      }
      
      // TODO merge and sort
      const list = data.result;
      that.store.wall = list;
      that.setState({ messages: list });
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
        that.persist("me", user);
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

  navigate(page, context) {
    var update = {page: page};
    if (context !== undefined) {
      update.context = context;
    }
    this.setState(update);

    // if (page !== 'home') {
    //   this.getOldMessages(page, 50, 0);
    //   if (this.store[page]) {
    //     currentThread = this.store[page];
    //   } 
    //   this.clearUnreadMessage(page);
    // }
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

  renderPostEdit() {
    if ( this.state.page === "post") {
			return <Post me={this.state.me}
									 navigate={this.navigate}
									 context={this.state.context}
									 uploadPhoto={this.onPhotoUpload}
									 db={this.db}
									 actingUser={this.props.me} />;
		}
  }
 
  onPhotoUpload() {
    console.log("Photo Upload - open dropzone");
    this.refs.dropZone.open();
  }

  renderPhotoLoader() {
        return (<div className="initial-load-container">
          <div className="loader">
            <svg  id="Layer_1" x="0px" y="0px" viewBox="0 0 81 45">
              <circle className="circle1" fill="#fe1263" cx="13.5" cy="22.5" r="4.5"/>
              <circle className="circle2" fill="#fe1263" cx="31.5" cy="22.5" r="4.5"/>
              <circle className="circle3" fill="#fe1263" cx="49.5" cy="22.5" r="4.5"/>
              <circle className="circle4" fill="#fe1263" cx="67.5" cy="22.5" r="4.5"/>
            </svg>
          </div>
        </div>);
  }

  onClosePhotoEditor(photo) {
    var that = this;
    var context = this.state.context;
    if (!photo) {
     this.navigate("post", context);
    }
    var data = { photo: photo, state: "uploading" };
    if (! context.photos) {
      context.photos = [];
    } 
    context.photos.push(data);
    this.navigate("post", context);
    return Bebo.uploadImageAsync(photo)
      .then(function(image_url) {
          data.state = "done" ;
          data.url = image_url;
          that.setState({context: context});
        });
  }

  renderPhotoEditor() {
    if (this.state.page === "photo-editor") {
			return (<PhotoEditor photo={{base64: this.state.context.rawPhoto}} closeEditor={this.onClosePhotoEditor} savePhoto={this.onClosePhotoEditor} />);
		}
  }

  onDrop(files) {
    this.navigate("photo-loader");
    const file = files[0];

    LoadImage.parseMetaData(file, (data) => {
      let orientation = 0;
      if (data.exif) {
        orientation = data.exif.get('Orientation');
      }
      LoadImage(
        file,
        (canvas) => {
          const base64data = canvas.toDataURL('image/jpeg');
          var context = this.state.context;
          context.rawPhoto =  base64data;
          this.navigate("photo-editor", context);
        }, {
          orientation,
          canvas: true,
          aspectRatio: window.innerWidth / window.innerHeight,
          maxWidth: 500,
          cover: true,
        }
      );
    });
  }

  renderPhotoUpload () {
    return (<DropZone multiple={false} inputProps={{ capture: 'camera' }} onDrop={this.onDrop} ref="dropZone" style={{ display: 'none' }} accept="image/*" />);
  }


  renderWall() {
    if (this.state.page === "home") {
      return (<Wall 
        messages = {this.state.messages}
        me={this.state.me}
        navigate={this.navigate}
        db={this.db}/>);
    }
  }

  render() {
    return (
      <div className="app-root">
				{this.renderWall()}
				{this.renderPostEdit()}
				{this.renderPhotoEditor()}
				{this.renderPhotoUpload()}
      </div>);
  }
}

App.displayName = 'App';

export default App;
