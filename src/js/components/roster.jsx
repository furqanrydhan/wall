import Promise from 'bluebird';
import React from 'react';
import Helper from '../helper.js';
import RosterItem from './roster-item.jsx';

class Roster extends React.Component {

  constructor() {
    super();
    this.state = {
      page: "home",
      username: "",
      online: [],
      offline: [],
      editUserName: false,
    };
    this.viewerUpdate= this.viewerUpdate.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.editUserName = this.editUserName.bind(this);
    this.onUserNameChange= this.onUserNameChange.bind(this);
    this.saveUserName = this.saveUserName.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
    Bebo.onViewerUpdate(this.viewerUpdate);
  }

  componentWillMount() {
    if (this.props.me.username) {
      this.setState({username: this.props.me.username});
    }
  }

  // componentDidUpdate() {
  //   if (this.state.editUserName) {
  //     var element = document.getElementById('file');
  //     element.value = null;
  //     element.onclick = function () {
  //       element.value = null;
  //     }
  //     element.onchange = this.fileUpload;
  //   }
  // }

  componentWillReceiveProps(nextProps) {
    if (this.state.username !== nextProps.me.username) {
      this.setState({username: nextProps.me.username});
    }
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
      if (viewer_id === this.props.me.user_id) {
        continue;
      } else if (roster[viewer_id]) {
        roster[viewer_id].online = true;
      } else {
        resync = true;
      }
    }
    var online = _.filter(_.values(roster), {online: true});
    var offline = _.filter(_.values(roster), {online: false});
    this.setState({online: online,
                   offline: offline});
    if (resync === true) {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
      }
      _.defer(this.componentWillMount);
    }
  }

  componentWillMount() {
    // Bebo.onWidgetUpdate(function(err, data) {
    //   console.log("Widget Update", err, data);
    // });
    console.log("Roster.componentWillMount");
    var that = this;
    var props = { roster: Bebo.getRosterAsync(),
                  stream: Bebo.getStreamFullAsync() };
    Promise.props(props)
      .then(function (data) {
      console.log("Roster.componentWillMount - got data", data);
      // var online = new Set(stream.viewer_ids);
      var roster = {};
      var l = data.roster.length;
      for (var i=0; i< l; i++) {
        var user = data.roster[i];
        user.online = false;
        roster[user.user_id] = user;
        roster[user.user_id].thread_id = Helper.mkThreadId(that.props.me, user.user_id);
      }
      l = data.stream.viewer_ids.length;
      for (var i=0; i< l; i++) {
        var viewer_id = data.stream.viewer_ids[i];
        roster[viewer_id].online = true;
      }
      delete roster[that.props.me.user_id];
      that.roster = roster;
      var online = _.filter(_.values(roster), {online: true});
      var offline = _.filter(_.values(roster), {online: false});
      that.setState({online: online,
                     offline: offline});
      that.pollTimer = setInterval(that.poll, 1000);
    });
  }

  renderOnline() {
    return this.state.online.map(
      (i) => <RosterItem key={i.thread_id} unread={i.unread} thread_id={i.thread_id} image_url={i.image_url} online={i.online} username={i.username} navigate={this.props.navigate}/>
    )
  }

  renderOffline() {
    return this.state.offline.map(
      (i) => <RosterItem key={i.thread_id} unread={i.unread} thread_id={i.thread_id} image_url={i.image_url} online={i.online} username={i.username} navigate={this.props.navigate}/>
    )
  }

  editUserName(e) {
    this.setState({editUserName: true});
  }

  saveUserName(e) {
    var that = this;
    this.props.updateUser({username: this.state.username})
      .then(function(user) {
        that.setState({editUserName: false});
      });
  }

  onUserNameChange(e) {
    this.setState({username: _.toLower(_.trim(e.target.value))});
  }

  fileUpload(e) {
    var that = this;
    console.log("fileUpload", e);
    var file = e.target.files[0];
    this.props.uploadImage(file, function() {
      that.setState({editUserName: false});
    });
  }

  renderMe() {
    var username, edit, image;
    if (this.state.editUserName) {
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
      image = (
        <div className="fileinput">
          <input id="file" type="file" onChange={this.fileUpload} accept="image/*" />
          <img src={this.props.me.image_url}/>
          <img className="fileOverlay" src={this.props.me.image_url}/>
        </div>)
          
    } else {
      username = <span className="roster-list-item--user--name">{this.props.me.username} <span className="circle"></span></span>;
      edit = (
          <span className="edit-settings edit" onClick={this.editUserName}>
            <img src="assets/img/icSettings.png" className="edit-icon"/>
          </span>
      )
      image = <img src={this.props.me.image_url}/>;
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
        <div className="roster-list-item--image">
          {image}
        </div>
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
