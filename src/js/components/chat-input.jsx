import React from 'react';
import Helper from '../helper.js';
import uuid from 'node-uuid';
import Remarkable from 'remarkable';

var quoteMd = new Remarkable(
  {html: false,
  breaks: false,
  linkify: true});

class ChatInput extends React.Component {

  constructor() {
    super();
    this.state = {
      messageText: '',
      // blurInput: false,
    };
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.resetTextarea = this.resetTextarea.bind(this);
    this.broadcastChat = this.broadcastChat.bind(this);
    this.submitPost = this.submitPost.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.blurChat === this.props.blurChat) {
    //   return
    // }
    // if (nextProps.blurChat) {
    //   this.refs.textarea.blur();
    // } else if (!nextProps.blurChat) {
    //   this.refs.textarea.focus();
    // }
  }

  handleInputChange(e) {
    this.setState({ messageText: e.target.value });
  }

  submitPost(e) {
    var that = this;
    var text = this.state.messageText.trim();
    var parent_id = this.props.quote && this.props.quote.id || null;
    var thread_id = this.props.quote && (this.props.quote.thread_id || this.props.quote.id) || null;
    var id = uuid.v4();
    if (!thread_id) {
      thread_id = id;
    }
    if (text.length > 0) {
      const message = {
        id: id,
        thread_id: thread_id,
        parent_id: parent_id,
        type: 'message',
        username: this.props.actingUser.username,
        user_id: this.props.actingUser.user_id,
        message: text,
        quote: this.props.quote,
      };

      // TODO mention stuff in users[]

      Bebo.Db.saveAsync('post', message)
        .then(that.broadcastChat)
        .then(that.props.home);
      this.resetTextarea();
    } else {
      console.warn('no message, returning');
    }
  }
  resetTextarea() {
    this.setState({ messageText: '' });
  }

  notifyUser(users, msg) {
    // TODO: "send you 3 messages ( text ...);
    // console.log('notifying user: ', users, msg);
    var message = _.truncate(msg, {lenght:60, omission:"..."});
    Bebo.Notification.roster('{{{user.username}}} posted:',
      msg,
      { rate_limit_key: "test_" + `${_.join(users, ":")}_${Math.floor(Date.now() / 1000 / 60 / 60)}` }
      , function(err, data) {
          if (err) {
            console.error('error sending notification', err);
          }
      });
  }

  broadcastChat(data) {
    const m = data.result[0];
    this.notifyUser(m.users, m.message);
    // console.log("message from db", m);
    Bebo.emitEvent({ message: {thread_id: this.props.thread_id, "newMsg": 1, "dm_id": m.id }});
    // TODO check if any user is in str
  }

  handleInputFocus() {
    // this.props.setChatInputState(true);
      this.refs.textarea.focus();
  }

  handleInputBlur() {
    this.refs.textarea.blur();
  }

  renderMenu() {
    return (
    <div className="post-edit-menu-long">
      <div className="post-edit-menu-item-long">
        <div className="post-edit-menu-item-icon">
          <img src="./assets/img/icCamera.png"/>
        </div>
        <span>Upload or take a photo</span>
      </div>
      <div className="post-edit-menu-item-long">
        <div className="post-edit-menu-item-icon">
          <svg viewBox="1024 508 24 18" version="1.1">
            <path d="M1024,511.994783 C1024,509.788525 1025.78429,508 1027.99005,508 L1044.00995,508 C1046.21359,508 1048,509.791716 1048,511.994783 L1048,522.005217 C1048,524.211475 1046.21571,526 1044.00995,526 L1027.99005,526 C1025.78641,526 1024,524.208284 1024,522.005217 L1024,511.994783 Z M1035.5,514 L1037,514 L1037,520 L1035.5,520 L1035.5,514 Z M1033,514 L1030,514 C1029.4,514 1029,514.5 1029,515 L1029,519 C1029,519.5 1029.4,520 1030,520 L1033,520 C1033.6,520 1034,519.5 1034,519 L1034,517 L1032.5,517 L1032.5,518.5 L1030.5,518.5 L1030.5,515.5 L1034,515.5 L1034,515 C1034,514.5 1033.6,514 1033,514 Z M1043,515.5 L1043,514 L1038.5,514 L1038.5,520 L1040,520 L1040,518 L1042,518 L1042,516.5 L1040,516.5 L1040,515.5 L1043,515.5 Z" id="Combined-Shape" stroke="none" fill="#FC5287" fillRule="evenodd"></path>
          </svg>
        </div>
        <span>Post a giphy</span>
      </div>
    </div>);
  }

  renderQuote() {
    if (!this.props.quote) {
      return "";
    }
    var message = this.props.quote.message;
    message = {__html: quoteMd.render(message)};
    return (
      <div className="post-edit-quote">
        <div className="chat-quote-left">
          <div className="chat-quote-avatar">
            <img src={this.props.db.getImageUrl(this.props.quote.user_id)} role="presentation" />
          </div>
        </div>
        <div className = "chat-quote-right">
          <div className="chat-quote--username">
            {this.props.quote.username}
          </div>
          <div className="chat-quote--text" dangerouslySetInnerHTML={message}></div>
        </div>
      </div> 
    )
  }

            // onFocus={this.handleInputFocus}
            // onBlur={this.handleInputBlur}
  render() {
    var placeholder = this.props.quote ? "reply..." : "type a message..";
    var userImgStyle = {backgroundImage: 'url(' + this.props.me.image_url + ')'};

    return (
      <div className="post-edit">
        <div className="sub-header">
          <div onClick={this.props.home} className="sub-back-button"><img src="./assets/img/icBack.png" alt="back"/></div>
          <div className="sub-name">Post to Bebo</div>
          <div className="sub-action" onClick={this.submitPost}>Post</div>
        </div>
        <div className="post-edit-header">
          <div className="post-edit-header--image" style={userImgStyle}></div>
          <div className="post-edit-header--username">{this.props.me.username}</div>
        </div>
        
        <div className="post-edit-middle">
          <textarea
            rows="8"
            ref="textarea"
            placeholder={placeholder}
            onChange={this.handleInputChange}
            value={this.state.messageText}
          />
        </div>
        {this.renderQuote()}
        {this.renderMenu()}
      </div>)
  }
}

ChatInput.displayName = 'ChatInput';

// Uncomment properties you need
ChatInput.propTypes = {
  // setChatInputState: React.PropTypes.func.isRequired,
  // switchMode: React.PropTypes.func.isRequired,
};
// ChatInput.defaultProps = {};

export default ChatInput;
