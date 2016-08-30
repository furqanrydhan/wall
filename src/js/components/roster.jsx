import Promise from 'bluebird';
import React from 'react';
import Helper from '../helper.js';
import RosterItem from './roster-item.jsx';

class Roster extends React.Component {

  constructor() {
    super();
    this.state = {
      page: "home",
      me: {},
      online: [],
      offline: [],
    };
  }

  componentWillMount() {
    console.log("Roster.componentWillMount");
    var that = this;
    var props = { me: Bebo.User.getAsync("me"),
                  roster: Bebo.getRosterAsync(),
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
        roster[user.user_id].thread_id = Helper.mkThreadId(props.me, user.user_id);
      }
      l = data.stream.viewer_ids.length;
      for (var i=0; i< l; i++) {
        var viewer_id = data.stream.viewer_ids[i];
        roster[viewer_id].online = true;
      }
      delete roster[data.me.user_id];
      that.roster = roster;
      var online = _.filter(_.values(roster), {online: true});
      var offline = _.filter(_.values(roster), {online: false});
      that.setState({me: data.me,
                     online: online,
                     offline: offline});
    });
  }

  renderOnline() {
    return this.state.online.map(
      (i) => <RosterItem key={i.thread_id} unread={i.unread} thread_id={i.thread_id} image_url={i.image_url} online={i.online} username={i.username}/>
    )
  }

  renderOffline() {
    return this.state.offline.map(
      (i) => <RosterItem key={i.thread_id} unread={i.unread} thread_id={i.thread_id} image_url={i.image_url} online={i.online} username={i.username}/>
    )
  }

  onUserNameChange(e) {
    console.log("FIXME - username changed", e);
  }
  renderMe() {
    if (! this.state.me || ! this.state.me.user_id) {
      return (
        <div className="roster-me">
          <div className="roster-list-item--settings"></div>
          <span className="edit-settings edit">
            <img src="assets/img/settings.svg" className="edit-icon"/>
            <img src="assets/img/ok.svg" className="save-icon"/>
          </span>
        </div>
      )
    }

    var username = "";
    var username = <span className="roster-list-item--user--name">{this.state.me.username} <span className="circle"></span></span>;
    if (this.state.editUsername) {
      username = (
        <span className="roster-list-item--user--name">
          <input type="text" className="roster-list-item--user--name--edit" name="username" value={this.state.me.username} onChange={this.onUserNameChange}/>
        </span>
      )
    }
    return (
      <div className="roster-me">
        <div className="roster-list-item--image">
          <img src={this.state.me.image_url}/>
        </div>
        <div className="roster-list-item--user">
          {username}
        </div>
        <div className="roster-list-item--settings"></div>
        <span className="edit-settings edit">
          <img src="assets/img/settings.svg" className="edit-icon"/>
          <img src="assets/img/ok.svg" className="save-icon"/>
        </span>
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
