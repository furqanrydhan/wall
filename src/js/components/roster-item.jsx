import React from 'react';

class RosterItem extends React.Component {

  constructor() {
    super();
    this.state = {
    };
  }

  navigate(e) {
    console.log("Nav", e);
    this.props.navigate(e.currentTarget.dataset.threadId, e.currentTarget.dataset.userName);
  }

  render() {

    var badge = <div className="roster-list-item--user--chat-badge"><img src="assets/img/icDM.png"/></div>;
    if (this.props.unread) {
      badge = <div className="roster-list-item--user--chat-badge unread-badge">1</div>;
    }
    var widget = "";
    var online = "";
    if (this.props.online) {
      online = <span className="circle"></span>;
    }
    return (
      <div className="roster-list-item roster-list-item--content" data-user-name={this.props.username} data-thread-id={this.props.thread_id} onClick={this.navigate.bind(this)}>
        <div className="roster-list-item--image">
          <img src={this.props.image_url}/>
        </div>
        <div className="roster-list-item--user">
          <span className="roster-list-item--user--name">{this.props.username} {online}</span>
          <span className="roster-list-item--user--desc">{}</span>
        </div>
        {badge}
      </div>
    )
  }
}
export default RosterItem;
