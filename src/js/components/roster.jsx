import Promise from 'bluebird';
import React from 'react';
import Helper from '../helper.js';


class Roster extends React.Component {

  constructor() {
    super();
    this.state = {
      page: "home",
      actingUser: {},
    };
  }

  componentWillMount() {
    var that = this;
    var props = { me: Bebo.User.getAsync,
                  roster: Bebo.getRosterAsync,
                  stream: Bebo.getStreamFullAsync };
    Promise.props(props, function (props) {
      // var online = new Set(stream.viewer_ids);
      var roster = {};
      var l = props.roster.length;
      for (var i=0; i< l; i++) {
        var user = props.roster[i];
        user.online = false;
        roster[user.user_id] = user;
      }
      l = props.stream.viewer_ids.length;
      for (var i=0; i< l; i++) {
        var viewer_id = props.stream.viewer_ids[i];
        roster[viewer_id].online = true;
      }
      that.roster = roster;
      that.roster[props.me.user_id].is_self = true;
      var online = _.filter(_.values(roster), {online: true});
      var offline = _.filter(_.values(roster), {online: false});
      that.setState({actingUser: props.me,
                     online: online,
                     offine: offline});
    });
  }

  renderOnline() {
    return this.state.online.map(
      (i) => <RosterItem unread={i.unread} thread_id={i.thread_id} image_url={i.thread_id} online={i.online} username={i.username}/>
    )
  }

  renderOffline() {
    return this.state.offline.map(
      (i) => <RosterItem unread={i.unread} thread_id={i.thread_id} image_url={i.thread_id} online={i.online} username={i.username}/>
    )
  }

  render() {
    return (
      <div className="roster">
        <div className="roster-me">
          <span className="edit-settings edit">
            <img src="assets/img/settings.svg" className="edit-icon"/>
            <img src="assets/img/ok.svg" className="save-icon"/>
          </span>
        </div>
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
