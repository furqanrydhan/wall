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
    Bebo.Notification.users('⚡️' + this.props.actingUser.username + ': ',
      msg,
      users,
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
