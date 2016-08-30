import Promise from 'bluebird';
import React from 'react';
import Helper from '../helper.js';
import RosterItem from './roster-item.jsx';

class Roster extends React.Component {

  constructor() {
    super();
    this.state = {
      page: "home",
      online: [],
      offline: [],
    };
    this.poll = this.poll.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
  }

  poll() {
    var that = this;
    Bebo.getStreamFullAsync()
      .then(function(stream) {
        var resync = false;
        var rosterList = _.values(that.roster);
        var l = rosterList.length;
        for (var i=0; i< l; i++) {
          rosterList[i].online = false;
        }
        var roster = that.roster;
        var l = stream.viewer_ids.length;
        for (var i=0; i< l; i++) {
          var viewer_id = stream.viewer_ids[i];
          if (viewer_id === that.props.me.user_id) {
            continue;
          } else if (roster[viewer_id]) {
            roster[viewer_id].online = true;
          } else {
            resync = true;
          }
        }
        var online = _.filter(_.values(roster), {online: true});
        var offline = _.filter(_.values(roster), {online: false});
        that.setState({online: online,
                       offline: offline});
        if (resync === true) {
          if (that.pollTimer) {
            clearInterval(that.pollTimer);
          }
          _.defer(that.componentWillMount);
        }
      });
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

  onUserNameChange(e) {
    // FIXME
    console.log("FIXME - username changed", e);
  }
  renderMe() {
    if (! this.props.me || ! this.props.me.user_id) {
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
    var username = <span className="roster-list-item--user--name">{this.props.me.username} <span className="circle"></span></span>;
    if (this.state.editUsername) {
      username = (
        <span className="roster-list-item--user--name">
          <input type="text" className="roster-list-item--user--name--edit" name="username" value={this.props.me.username} onChange={this.onUserNameChange}/>
        </span>
      )
    }
    return (
      <div className="roster-me">
        <div className="roster-list-item--image">
          <img src={this.props.me.image_url}/>
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
