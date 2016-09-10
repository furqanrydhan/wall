import React from 'react';
import WallItem from './chat-item.jsx';


class WallList extends React.Component {

  constructor() {
    super();
    this.state = {
      maxCount: 50,
      scrolledPastFirstMessage: false,
      isScrolling: false,
      unloadedMessages: [],
      usersTypingCount: 0,
      newMsgCnt: 0,
    };
    this.usersTyping = {};
    // this.getOldMessages = this.getOldMessages.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    // this.handleEventUpdate = this.handleEventUpdate.bind(this);
    // this.handleMessageEvent = this.handleMessageEvent.bind(this);
    // this.addNewMessages = this.addNewMessages.bind(this);
    this.handlePresenceUpdates = this.handlePresenceUpdates.bind(this);
    this.scrollChatToBottom = this.scrollChatToBottom.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.updatePresence = this.updatePresence.bind(this);
    // this.handleListClick = this.handleListClick.bind(this);
    this.renderNoChatsMessage = this.renderNoChatsMessage.bind(this);
    this.renderMessagesBadge = this.renderMessagesBadge.bind(this);
    this.renderUsersAreTyping = this.renderUsersAreTyping.bind(this);
    this.renderWallList = this.renderWallList.bind(this);
  }

  componentWillMount() {
    // this.props.getOldMessages(this.props.thread_id, 50, 0);
    // Bebo.onEvent(this.handleEventUpdate);
    this.setState({scrolledPastFirstMessage: false, newMsgCnt: 0});
    // this.props.onPresenceEvent(this.handlePresenceUpdates);
  }

  componentDidMount() {
    this.handleNewMessage();
  }

  componentWillUpdate(prevProps, prevState) {
    var newMsgCnt = prevProps.messages.length - this.props.messages.length;
    if (prevProps.messages.length > 0 && this.state.newMsgCnt !== newMsgCnt) {
      this.setState({newMsgCnt: newMsgCnt});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.newMsgCnt > 0) {
      this.handleNewMessage();
    }
  }

  handleScroll() {
    const list = this.refs.chatListInner;
    const item = this.refs.chats.lastChild;

    const diff = list.scrollHeight - list.offsetHeight - item.clientHeight;

    if (list.scrollTop <= diff && !this.state.scrolledPastFirstMessage) {
      this.setState({ scrolledPastFirstMessage: true , newMsgCnt: 0});
    } else if (list.scrollTop >= diff && this.state.scrolledPastFirstMessage) {
      this.scrollChatToBottom();
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.newMessages) {
  //     for (var i=0; i< nextProps.newMessages.length; i++) {
  //       var msg = nextProps.newMessages[i];
  //     }

  //   }
  // }

  // handleEventUpdate(data) {
  //   if (data.message) {
  //     this.handleMessageEvent(data.message);
  //   } else if (data.presence) {
  //     this.handlePresenceUpdates(data.presence);
  //   }
  // }

  // handleMessageEvent(message) {
  //   if (!this.state.scrolledPastFirstMessage) {
  //     this.addNewMessages([message]);
  //     if (message.user_id === this.props.actingUser.user_id) { this.scrollChatToBottom(); }
  //   } else {
  //     const messages = this.state.unloadedMessages;
  //     messages.push(message);
  //     this.setState({ unloadedMessages: messages });
  //   }
  // }

  // addNewMessages(arr) {
  //   const messages = this.state.messages.concat(arr);
  //   this.setState({
  //     messages,
  //     unloadedMessages: [],
  //   });
  // }

  handlePresenceUpdates(user) {

    if (user.started_typing === this.props.me.user_id || user.stopped_typing === this.props.me.user_id) {
      return;
    }

    if (user.started_typing) {
      this.usersTyping[user.started_typing] = Date.now();

      if (!this.presenceInterval) {
        this.updatePresence();
        this.presenceInterval = setInterval(this.updatePresence, 3000);
      }
    } else if (user.stopped_typing && this.usersTyping[user.stopped_typing]) {
      delete this.usersTyping[user.stopped_typing];
      this.updatePresence();
    }
  }

  updatePresence() {
    const usersTypingCount = Object.keys(this.usersTyping).length;
    this.setState({ usersTypingCount });
  }

  scrollChatToBottom() {
    return;

    // if (this.state.unloadedMessages.length > 0) {
    //   this.addNewMessages(this.state.unloadedMessages);
    // }
    // if (this.refs.chatListInner) {
    //   this.refs.chatListInner.scrollTop = this.refs.chatListInner.scrollHeight;
    // }

    // this.setState({
    //   scrolledPastFirstMessage: false,
    // });
  }

  handleNewMessage() {
    if (!this.state.scrolledPastFirstMessage) {
      this.scrollChatToBottom();
    }
  }

  // handleListClick() {
  //   this.props.blurChat();
  // }

  // Renders

  renderNoChatsMessage() {
    return <div className="chat-list--no-messages" />;
  }

  renderMessagesBadge() {
    if (this.state.newMsgCnt > 0) {
      return (<div className="chat-list--unseen-messages" onClick={this.scrollChatToBottom}>
        <span className="chat-list--unseen-messages--text">{`${this.state.newMsgCnt} New Messages`}</span>
      </div>);
    }
    return null;
  }

  renderUsersAreTyping() {
    const count = this.state.usersTypingCount;
    return (<div className="chat-list--users-typing" style={count > 0 ? {} : { transform: 'translate3d(0,100%,0)' }}>
      <span className="chat-list--users-typing--text">{count === 1 ? '1 person is typing right now...' : `${count} people are typing right now...`}</span>
    </div>);
  }

  renderWallList() {
    if (this.props.messages && this.props.messages.length > 0) {
      var posts = this.props.messages.map((i) => (
        <li className="chat-item" key={i.id}>
          <WallItem me={this.props.me} type="post" reply={this.props.reply} handleNewMessage={this.handleNewMessage} db={this.props.db} item={i}/>
        </li>));
      return (<ul ref="chats" className="chat-list--inner--list">
                {posts}
              </ul>);
    }
    return (<ul className="chat-list--inner--list">
      {this.renderNoChatsMessage}
    </ul>);
  }

  render() {

    const count = this.state.usersTypingCount;
    return (<div className="chat-list">
      {this.renderMessagesBadge()}
      <div style={count > 0 ? { transform: 'translate3d(0,-37px,0)' } : {}} ref="chatListInner" className="chat-list--inner" onScroll={this.handleScroll} onClick={this.handleListClick}>
        {this.renderWallList()}
      </div>
      {this.renderUsersAreTyping()}
    </div>);
  }

}

WallList.displayName = 'WallList';

// Uncomment properties you need
WallList.propTypes = {
  // blurChat: React.PropTypes.func.isRequired,
  me: React.PropTypes.object.isRequired,
};
// WallList.defaultProps = {};

export default WallList;
