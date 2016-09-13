import React from 'react';
import uuid from 'node-uuid';
import Remarkable from 'remarkable';
import WallItem from './chat-item.jsx';


class PostEdit extends React.Component {

  constructor() {
    super();
    this.state = {
      message: '',
      // blurInput: false,
    };
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.resetTextarea = this.resetTextarea.bind(this);
    this.broadcastChat = this.broadcastChat.bind(this);
    this.submitPost = this.submitPost.bind(this);
    this.onPhoto = this.onPhoto.bind(this);
    this.home = this.home.bind(this);
  }

  context2state(oldContext, nextContext) {
    var update = {};

	  var uploaded = true;
		if (nextContext.media) {
			for (var i; i < nextContext.media.length ; i++) {
				var p = nextContext.media[i];
				if (!p.url) {
					uploaded = false;
				}
			}
      update.uploaded = uploaded;
		}

    if (oldContext.message !== nextContext.message) {
      update.message = nextContext.message;
    }

    this.setState(update);
  }

  componentWillMount() {
    if (this.props.context) {
      this.context2state({}, this.props.context);
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.context) {
      this.context2state(this.props.context, nextProps.context);
    }
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
    this.setState({ message: e.target.value });
  }

  submitPost(e) {
    var that = this;
    var text = this.state.message.trim();
    var parent_id = (this.props.context.quote && this.props.context.quote.id) || null;
    var thread_id = (this.props.context.quote && (this.props.context.quote.thread_id || this.props.context.quote.id)) || null;
    var id = uuid.v4();
    if (this.props.context.id) {
      id = this.props.context.id;
    }

    if (!thread_id) {
      thread_id = id;
    }

    if (text.length > 0 || this.props.context.media) {
      const post = {
        id: id,
        thread_id: thread_id,
        parent_id: parent_id,
        type: 'message',
        username: this.props.actingUser.username,
        user_id: this.props.actingUser.user_id,
        media: this.props.context.media,
        message: text,
        quote: this.props.context.quote,
        edited: false,
        viewed_ids: [],
        viewed_cnt: 0,
      };

      // TODO mention stuff in users[]
      console.log("saving post", post);
      Bebo.Db.saveAsync('post', post)
        .then(function(data) {
          data = data.result[0];
					that.broadcastChat(data);
          that.notifyUsers(data);
          that.home();
      		// that.resetTextarea();
        });
    } else {
      console.warn('no post, returning');
    }
  }

  resetTextarea() {
    this.setState({ message: '' });
  }

  notifyUsers(post) {
    // TODO: "send you 3 messages ( text ...);
    // console.log('notifying user: ', users, msg);
    // FIXME: rate limit
    console.log("POST", post);
    var title = '{{{user.username}}}';
    var body = "";

    var message;
    if (post.message) {
      message = _.truncate(post.message, {lenght:60, omission:"..."});
    }
    
    if (post.parent_id && post.message) {
      body = "replied: " + message;
    } else if (post.parent_id && post.media) {
      body = "added a new image \uD83D\uDDBC";
    } else if (post.message) {
      body = "posted: " + message;
    } else if (post.media) {
      body = "posted a new image \uD83D\uDDBC";
    } else {
      console.error("UNKNOWN POST TYPE", post);
			body = "posted a new topic";
		}

    Bebo.getRosterAsync()
      .then(function(users) {
          console.log("ROSTER", users);
          var user_ids = _.map(users, "user_id");
      		return Bebo.Notification.users(title, body, user_ids);
      });
  }

  broadcastChat(data) {
    // FIXME: this is still the old DM way
    Bebo.emitEvent({ message: {thread_id: this.props.thread_id, "newMsg": 1, "dm_id": data.id }});
  }

  handleInputFocus() {
    // this.props.setChatInputState(true);
      this.refs.textarea.focus();
  }

  handleInputBlur() {
    this.refs.textarea.blur();
  }

  mergeContext() {
    var ctx = this.props.context;
    ctx.message = this.state.message;
    return ctx;
  }

  onPhoto() {
    var ctx = this.mergeContext();
    this.props.uploadPhoto(ctx);
  }

  renderMenu() {
    return (
    <div className="post-edit-menu-long">
      <div className="post-edit-menu-item-long" onClick={this.onPhoto}>
        <div className="post-edit-menu-item-icon camera-icon">
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

    if (!this.props.context.quote) {
      return "";
    }
    return <WallItem type="quote" db={this.props.db} item={this.props.context.quote} />;
  }

  renderImages() {

    if(!this.props.context.media) {
      return;
    }
    for (var i = 0 ; i< this.props.context.media.length; i++) {
      this.props.context.media[i].key = i+1;
    }
    return (
      <div className="media">
        {this.props.context.media.map((i) =>
          <div key={i.key} className={"photo " + i.state}
               style={{backgroundImage: "url(" + (i.url || i.base64) + ")"}}></div>)}
      </div>
    )
  };

  home() {
    this.props.navigate("home", null);
	}

  render() {
    console.log("componentWillReceiveProps");
    var placeholder = this.props.context.quote ? "reply..." : "type a message..";
    var userImgStyle = {backgroundImage: 'url(' + this.props.me.image_url + ')'};

    return (
      <div className="post-edit modal">
        <div className="sub-header">
          <div onClick={this.home} className="sub-back-button"></div>
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
            value={this.state.message}
          />
          {this.renderImages()}
        </div>
        {this.renderQuote()}
        {this.renderMenu()}
      </div>)
  }
}

PostEdit.displayName = 'PostEdit';

// Uncomment properties you need
PostEdit.propTypes = {
  // setChatInputState: React.PropTypes.func.isRequired,
  // switchMode: React.PropTypes.func.isRequired,
};
// ChatInput.defaultProps = {};

export default PostEdit;
