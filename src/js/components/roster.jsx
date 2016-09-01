import Promise from 'bluebird';
import React from 'react';
import Helper from '../helper.js';
import RosterItem from './roster-item.jsx';

class Roster extends React.Component {

  constructor() {
    super();
    this.state = {
      username: "",
      editState: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.editUserName = this.editUserName.bind(this);
    this.onUserNameChange= this.onUserNameChange.bind(this);
    this.saveUserName = this.saveUserName.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
  }

  componentWillMount() {
    if (this.props.me.username) {
      this.setState({username: this.props.me.username});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.username !== nextProps.me.username) {
      this.setState({username: nextProps.me.username});
    }
  } 

  renderOnline() {
    return this.props.online.map(
      (i) => <RosterItem key={i.thread_id} unread={i.unread} thread_id={i.thread_id} image_url={i.image_url} online={i.online} username={i.username} navigate={this.props.navigate}/>
    )
  }

  renderOffline() {
    return this.props.offline.map(
      (i) => <RosterItem key={i.thread_id} unread={i.unread} thread_id={i.thread_id} image_url={i.image_url} online={i.online} username={i.username} navigate={this.props.navigate}/>
    )
  }

  editUserName(e) {
    this.setState({editState: true});
  }

  saveUserName(e) {
    var that = this;
    this.props.updateUser({username: this.state.username})
      .then(function(user) {
        that.setState({editState: false});
      });
  }

  onUserNameChange(e) {
    this.setState({username: _.toLower(_.trim(e.target.value))});
  }

  fileUpload(e) {
    var that = this;
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
      var url = reader.result;
      that.setState({editState: "uploading",
                     image_url: url});
      that.props.uploadImage(url)
      .then(function() {
        that.setState({editState: false,
                       image_url: null});
      }).catch(function(err) {
        console.error("upload failed", err);
        that.setState({editState: false,
                       image_url: null});
      });
    }
    reader.onerror = function(err) {
      console.error("error reading file", err);
      that.setState({editState: false,
                     image_url: null});
    }
    reader.readAsDataURL(file);
  }

  renderMe() {
    var username, edit, image;
    if (this.state.editState === true) {
      username = (
        <span className="roster-list-item--user--name">
          <form>
          <input type="text"
            className="roster-list-item--user--name--edit"
            value={this.state.username}
            onChange={this.onUserNameChange}/>
        </form>
        </span>
      )
      edit = (
        <span className="edit-settings edit" onClick={this.saveUserName}>
          <img src="assets/img/ok.svg" className="save-icon"/>
        </span>
      )
      var style = { backgroundImage: 'url(' + this.props.me.image_url + ')'};
      var cameraStyle = { backgroundImage: 'url(' + "assets/img/icCamera.png" + ')'};
      image = (
        <div className="roster-list-item--image" >
          <div className="image" style={style} />
          <input id="file" type="file" onChange={this.fileUpload} accept="image/*" />
          <div className="fileOverlay" style={cameraStyle} />
        </div>)

    } else if (this.state.editState === "uploading") {
      username = <span className="roster-list-item--user--name">{this.props.me.username} <span className="circle"></span></span>;
      edit = (
          <span className="edit-settings edit" onClick={this.editUserName}>
          </span>
      )
      var style = {backgroundImage: 'url(' + this.state.image_url + ')'};
      image = (
        <div className="roster-list-item--image" style={style}>
          <div className="loading"/>
        </div>
      )
          
    } else {
      username = <span className="roster-list-item--user--name">{this.props.me.username} <span className="circle"></span></span>;
      edit = (
          <span className="edit-settings edit" onClick={this.editUserName}>
            <img src="assets/img/icSettings.png" className="edit-icon"/>
          </span>
      )
      var style = {backgroundImage: 'url(' + this.props.me.image_url + ')'};
      image = (<div className="roster-list-item--image" style={style}>
               </div>)
    }
    if (! this.props.me || ! this.props.me.user_id) {
      return (
        <div className="roster-me">
          <div className="roster-list-item--settings"></div>
          <span className="edit-settings edit">
            <img src="assets/img/icSettings.png" className="edit-icon"/>
          </span>
        </div>
      )
    }
    return (
      <div className="roster-me roster-list-item">
        {image}
        <div className="roster-list-item--user">
          {username}
        </div>
        <div className="roster-list-item--settings"></div>
        {edit}
      </div>
    )
  }

  render() {
    return (
      <div className="roster">
        {this.renderMe()}
        <div className="roster-header roster-online-header"><span className="roster-online-header--count"></span> ONLINE</div>
        <div className="roster-list roster-online-list" style={{opacity: 1.0}}>
          {this.renderOnline()}
        </div>
        <div className="roster-header roster-offline-header"><span className="roster-offline-header--count"></span> OFFLINE</div>
        <div className="roster-list roster-offline-list" style={{opacity: 1.0}}>
          {this.renderOffline()}
        </div>
      </div>)
  }
}

Roster.displayName = 'Roster';

export default Roster;
