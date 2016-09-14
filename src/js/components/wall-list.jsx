import React from 'react';
import WallItem from './chat-item.jsx';
import InfiniteScroll from 'react-infinite-scroller';


class WallList extends React.Component {

  constructor() {
    super();
    this.state = {
      maxCount: 50,
      unloadedMessages: [],
      usersTypingCount: 0,
      newMsgCnt: 0,
      newMsgPost: false,
    };
    this.usersTyping = {};
    // this.handleEventUpdate = this.handleEventUpdate.bind(this);
    // this.handleMessageEvent = this.handleMessageEvent.bind(this);
    // this.addNewMessages = this.addNewMessages.bind(this);
    this.handlePresenceUpdates = this.handlePresenceUpdates.bind(this);
    this.scrollWallToTop = this.scrollWallToTop.bind(this);
    this.updatePresence = this.updatePresence.bind(this);
    // this.handleListClick = this.handleListClick.bind(this);
    this.renderNoChatsMessage = this.renderNoChatsMessage.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.renderMessagesBadge = this.renderMessagesBadge.bind(this);
    this.renderUsersAreTyping = this.renderUsersAreTyping.bind(this);
    this.renderWallList = this.renderWallList.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.newMsg !== this.state.newMsgCnt) {
      var update = {newMsgCnt: nextProps.newMsg};
      if (this.refs.chats.scrollTop) {
        update.newMsgPost = true;
      }
      this.setState(update);
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    // this.registerUrlClickHandler(this.chatList);
  }

  componentWillUpdate(prevProps, prevState) {
    this.saveScrollPosition();
  }

  componentDidUpdate(prevProps, prevState) {
    // this.refs.chats.scrollTop = this.scrollTop + ( this.refs.chats.scrollHeight - this.scrollHeight);
    this.keepScrollPosition();

    // if (this.state.newMsgCnt > 0) {
    // }
  }

  saveScrollPosition() {
    this.scrollTop = this.refs.chats.scrollTop;
    this.scrollHeight = this.refs.chats.scrollHeight;
    console.log("SCROLL", this.scrollTop, this.scrollHeight);
  }

  onScroll(e) {
    console.log("onScroll", this.scrollTarget, e.currentTarget.scrollTop);
    // clear message if scroll, but not auto-scroll
    if (this.state.newMsgPost && this.scrollTarget !== e.currentTarget.scrollTop ) {
      console.log("clearing new msg indication");
      this.setState({newMsgPost: false});
    }
  }

  keepScrollPosition() {
    if (this.scrollTop !== 0) {
      this.scrollTarget = this.scrollTop + ( this.refs.chats.scrollHeight - this.scrollHeight);
      this.refs.chats.scrollTop = this.scrollTarget;
    }
  }

  scrollWallToTop() {
    this.refs.chats.scrollTop = 0;
    this.setState({newMsgPost: false});
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



  // handleListClick() {
  //   this.props.blurChat();
  // }

  // Renders

  renderNoChatsMessage() {
    return <div className="chat-list--no-messages" />;
  }

  renderMessagesBadge() {
    if (this.state.newMsgPost) {
      return (<div className="chat-list--unseen-messages" onClick={this.scrollWallToTop}>
        <span className="chat-list--unseen-messages--text">New Posts above.</span>
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
    // if (this.props.messages && this.props.messages.length > 0) {
      var posts = this.props.messages.map((i) => (
        <li className="chat-item" key={i.id}>
          <WallItem me={this.props.me}
            type="post"
            reply={this.props.reply}
            deletePost={this.props.deletePost}
            editPost={this.props.editPost}
            navigate={this.props.navigate}
            db={this.props.db} item={i}/>
        </li>));
    return (<ul ref="chats" className="chat-list--inner--list" onScroll={this.onScroll}>
              <InfiniteScroll pageStart={this.props.offset}
                hasMore={this.props.hasMore}
                loadMore={this.props.loadMore}
                useWindow={false}>
                    {posts}
              </InfiniteScroll>
            </ul>);
    // }
    // return (<ul className="chat-list--inner--list">
    //   {this.renderNoChatsMessage}
    // </ul>);
  }

  render() {
    const count = this.state.usersTypingCount;
    return (<div className="chat-list">
        {this.renderMessagesBadge()}
        <div style={count > 0 ? { transform: 'translate3d(0,-37px,0)' } : {}} ref="chatListInner" className="chat-list--inner"  onClick={this.handleListClick}>
            {this.renderWallList()}
        </div>
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
