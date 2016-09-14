/* eslint-disable no-unused-expressions */

import React from 'react';
import Wall from './wall.jsx';
import PhotoEditor from './PhotoEditor.jsx';
import PostEditor from './post-editor.jsx';
import PostDelete from './post-delete.jsx';
import PhotoViewer from './photo-viewer.jsx';
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

const POST_CNT = 10;

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      page: "home",
      context: {},
      messages: [],
      newMsg: 0,
      hasMore: true,
      offset: 0,
      me: {},
      threadName: ""
    };
    this.db = {};
    this.stream_id = Bebo.getStreamId();
    this.store = {wall:[]};
    this.navigate = this.navigate.bind(this);
    this.handleEventUpdate = this.handleEventUpdate.bind(this);
    this.getOldMessages = this.getOldMessages.bind(this);
    this.onClosePhotoEditor = this.onClosePhotoEditor.bind(this);
    this.onPhotoUpload = this.onPhotoUpload.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.online = this.online.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.db.getImageUrl = this.getImageUrl.bind(this);
    this.db.incrViewedPost = this.incrViewedPost.bind(this);
    this.deletePost = this.deletePost.bind(this);
  }

  online() {
    Bebo.onEvent(this.handleEventUpdate);
    // this.getOldMessages(undefined, POST_CNT, 0);
    this.getMe();
  }

  componentWillMount() {
    console.timeStamp && console.timeStamp("Main.componentWillMount");
    // this.getOldMessages(undefined, POST_CNT, 0);
    this.getMe();
  }

  componentDidMount() {
    console.timeStamp && console.timeStamp("Main.componentDidMount");
  }


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

  loadMore(pageToLoad) {
    var offset = (pageToLoad - 1) * POST_CNT; // infinite-scroller does + 1
    return this.getOldMessages(null, POST_CNT, offset);
  }

  getOldMessages(thread_id,  count, offset) {
    // handle thread Id later
    if (!offset) {
      offset = 0;
    }
    var that = this;
    var options = {count: count, offset: offset, sort_by:"created_dttm"};
    Bebo.Db.get('post', options)
    .then(function(list) {
      
      for (var i=0; i<list.length ; i++) {
        list[i].viewed_ids = new Set(list[i].viewed_ids || []);
      }
      var hasMore = list.length === count;
      list = _.filter(list, function(i) { return !i.deleted_dttm});
      that.store.wall = _.unionBy(list, that.store.wall, "id");
      that.store.wall = _.orderBy(that.store.wall, "created_dttm", "desc");
      var pageToLoad = that.store.wall.length;
      that.setState({ messages: that.store.wall, offset: offset, hasMore: hasMore, pageToLoad: pageToLoad});
    }).catch(function(err) {
      console.log("Can't get messages", err);
    });
  }

  handleEventUpdate(data) {
    if (data.message) {
      this.handleMessageEvent(data.message);
    } else {
      console.warn("Unexpected event", data);
    }
  }

  incrViewedPost(postItem) {
    var user_id = this.state.me.user_id;

    return Bebo.Db.get('post', {id: postItem.id})
      .then(function(data) {
        var row;
        if (data && data.length > 0) {
          row = data[0];
        }

        if (!row ) {
          return;
        } else if (!row.viewed_ids) {
          row.viewed_ids = [];
        } else if (row.viewed_ids.includes(user_id)) {
          return;
        }
        row.viewed_ids.push(user_id);
        row.viewed_cnt = row.viewed_ids.length;
        return Bebo.Db.save('post', row);
      });
  }

  deletePost(postItem) {
    var that = this;
    if (!postItem.id) {
      return;
    }
    var update = {id: postItem.id, message: "[deleted]", media: null, deleted_dttm: new Date()};
    return Bebo.Db.save('post', update)
      .then(function() {
        Bebo.emitEvent({ message: {id: postItem.id, deleted_dttm: update.deleted_dttm}});
      })
      .then(function() {
        that.navigate("home");
      });
  }

  handleMessageEvent(message) {
    if (message.deleted_dttm) {
      this.store.wall = _.filter(this.store.wall, function(i) { return i.id !== message.id});
      this.setState({ messages: this.store.wall });
    } else {
      this.setState({ newMsg: this.state.newMsg+1});
      this.getOldMessages(message.thread_id, POST_CNT, 0);
    }
  }

  getMe() {
    var that = this;
    console.timeStamp && console.timeStamp("Bebo.User.me request");
    return Bebo.User.get("me")
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
    return Bebo.getImageUrl() + "image/user/" + user_id  + "?w=72&h=72";
  }

  navigate(page, context) {
    console.log("navigate ->", page, context);
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

  renderPostEditor() {
    if ( this.state.page === "post") {
			return <PostEditor me={this.state.me}
									 navigate={this.navigate}
									 context={this.state.context}
									 uploadPhoto={this.onPhotoUpload}
									 db={this.db}
									 actingUser={this.state.me} />;
		}
  }
 
  onPhotoUpload(context) {
    this.setState(context: context);
    console.log("Photo Upload - open dropzone", context);
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
    console.log("onClosePhotoEditor", this.state.context);
    var mimeType = photo.split(':')[1].split(';')[0];
    var that = this;
    var context = this.state.context;
    if (!photo) {
     this.navigate("post", context);
    }
    var data = { base64: photo,
                 mimeType: mimeType,
                 state: "uploading" };
    if (! context.media) {
      context.media = [];
    } 
    context.media.push(data);
    this.navigate("post", context);
    return Bebo.uploadImage(photo)
      .then(function(image_url) {
          data.state = "done";
          data.url = image_url;
          delete data.base64;
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


  renderPhotoViewer() {
    if (this.state.page === "photo-viewer") {
      return (<PhotoViewer
                   me={this.state.me}
									 navigate={this.navigate}
									 context={this.state.context}
                   db={this.db}/>);
    }
  }

  renderPostDelete() {
    if (this.state.page === "post-delete") {
      return (<PostDelete
                   me={this.state.me}
									 navigate={this.navigate}
									 context={this.state.context}
                   doDelete={this.deletePost}
                   db={this.db}/>);
    }
  }

  renderWall() {
    // always render wall in the background - the rest are all modals on top
    return (<Wall
      minimized={this.state.page === 'post' ? true : false}
      messages={this.state.messages}
      newMsg={this.state.newMsg}
      hasMore={this.state.hasMore}
      offset={this.state.offset}
      loadMore={this.loadMore}
      me={this.state.me}
      navigate={this.navigate}
      db={this.db}/>);
  }

  render() {
    return (
      <div className="app-root">
				{this.renderWall()}
				{this.renderPostEditor()}
				{this.renderPhotoViewer()}
				{this.renderPhotoEditor()}
				{this.renderPhotoUpload()}
				{this.renderPostDelete()}
      </div>);
  }
}

App.displayName = 'App';

export default App;
