import React from 'react';

class RosterItem extends React.Component {

  constructor() {
    super();
    this.state = {
    );
  }

  render() {

    var badge = <div class="roster-list-item--user--chat-badge"><img src="assets/img/icDM.png"></div>;
    if (this.props.unread) {
      badge = <div class="roster-list-item--user--chat-badge unread-badge">1</div>;
    }
    var widget = "";
    var online = "";
    if (this.props.online) {
      online = <span class="circle"></span>;
    }
    return (
      <div className="roster-list-item roster-list-item--content" data-thread-id={this.props.thread_id}>
        <div className="roster-list-item--image">
          <img src={this.props.image_url}/>
        </div>
        <div class="roster-list-item--user">
          <span class="roster-list-item--user--name">{this.props.username}{online}</span>
          <span class="roster-list-item--user--desc">{}</span>
        </div>
        {badge}
      </div>
    )
  }

}
