/* eslint-disable no-unused-expressions */

import React from 'react';
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
    this.incrUnreadMessage = this.incrUnreadMessage.bind(this);
    this.clearUnreadMessage = this.clearUnreadMessage.bind(this);
    // this.getUnreadAndUpdate = this.getUnreadAndUpdate.bind(this);
    this.onClosePhotoEditor = this.onClosePhotoEditor.bind(this);
    this.onPhotoUpload = this.onPhotoUpload.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.online = this.online.bind(this);
    this.db.getImageUrl = this.getImageUrl.bind(this);
  }

  online() {
    Bebo.onEvent(this.handleEventUpdate);
    this.getOldMessages();
    this.getMe();
  }

  componentWillMount() {
    console.timeStamp && console.timeStamp("Main.componentWillMount");
    this.getOldMessages();
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
    } else {
      console.warn("Unexpected event", data);
    }
  }


  incrUnreadMessage(thread_id, to_user_id) {
  }

  clearUnreadMessage(thread_id) {
  }

  handleMessageEvent(message) {
    this.getOldMessages(message.thread_id, 50, 0);
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


  renderPostEdit() {
    if ( this.state.page === "post") {
			return <Post me={this.state.me}
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
					// FIXME not in prod?
          image_url = image_url.replace("null", "https://a.imgdropt-dev.com/image/");
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
        messages={this.state.messages}
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
