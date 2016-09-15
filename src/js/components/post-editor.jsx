import React from 'react';
import uuid from 'node-uuid';
import WallItem from './chat-item.jsx';
import TextArea from 'react-textarea-autosize'


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
    console.log('focusing');
    document.getElementById('js-textarea').focus();
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
    console.log('input Change')
    this.scrollWindow();
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
      Bebo.Db.save('post', post)
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

    if (post.parent_id && post.quote && post.quote.user_id) {
      return Bebo.Notification.roster(title, body, [post.quote.user_id]);
    } else {
      Bebo.getRoster()
        .then(function(users) {
            console.log("ROSTER", users);
            var user_ids = _.map(users, "user_id");
            return Bebo.Notification.users(title, body, user_ids);
        });
    }
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

  renderQuote() {

    if (!this.props.context.quote) {
      return "";
    }
    return <WallItem type="quote" me={this.props.me} db={this.props.db} item={this.props.context.quote} />;
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
          <div height='20px' width='20px' key={i.key} className={"photo " + i.state}
               style={{backgroundImage: "url(" + (i.url || i.base64) + ")"}}></div>)}
      </div>
    )
  };

  home() {
    this.props.navigate("home", null);
	}

  scrollWindow(){
    console.log('scroll window');
    setTimeout(function(){
      window.scrollTo(0,1000)
    },10);
  }


  render() {
    var placeholder = this.props.context.quote ? "reply..." : "type a message..";
    var userImgStyle = {backgroundImage: 'url(' + this.props.me.image_url + ')'};

    return <div className='modal'>
      <div className='post-edit'>
        <button className='modal-close' onClick={this.home}>
          <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" >
              <polygon id="Shape" stroke="none" fill="#FFFFFF" fillRule="evenodd" points="14 1.4 12.6 0 7 5.6 1.4 0 0 1.4 5.6 7 0 12.6 1.4 14 7 8.4 12.6 14 14 12.6 8.4 7"></polygon>
          </svg>
        </button>
        <div className='wall-item'>
          <div className='wall-item--inner'>
          <div className="wall-item--meta">
          <div className='wall-item--meta--image'>
            <img src={this.props.db.getImageUrl(this.props.me.user_id)} role="presentation" />
          </div>
          <div className='wall-item--meta--text'>
            <span className='wall-item--meta--text--name'>{this.props.me.username}</span>
            <span className='wall-item--meta--text--info'>Now</span>
          </div>
        </div>
        <div className='wall-item--inner--body'>
          <div className='wall-item--message'>
            <TextArea placeholder={placeholder}
              value={this.state.message}
              onFocus={this.scrollWindow}
              onChange={this.handleInputChange}
              id='js-textarea' 
              ref='textarea' 
              className='wall-item--message--text'
            />
          </div>
          {this.renderQuote()}
        </div>
        </div>
          </div>
          <div className='post-edit--actions'>
            <div className='post-edit--options'>
              <button className='post-edit--options--item' style={{display: "none"}}>
                <svg width="25px" height="18px" viewBox="307 225 44 27" version="1.1">
                    <path d="M307,227.992634 C307,226.339848 308.340857,225 310.006981,225 L347.993019,225 C349.653729,225 351,226.338934 351,227.992634 L351,249.007366 C351,250.660152 349.659143,252 347.993019,252 L310.006981,252 C308.346271,252 307,250.661066 307,249.007366 L307,227.992634 Z M326.591,243.462 C325.752,243.748 324.164,244.141 322.575,244.141 C320.379,244.141 318.79,243.587 317.684,242.516 C316.576,241.481 315.97,239.91 315.988,238.142 C316.005,234.143 318.915,231.859 322.86,231.859 C324.414,231.859 325.609,232.163 326.199,232.449 L325.628,234.626 C324.967,234.34 324.145,234.109 322.826,234.109 C320.559,234.109 318.845,235.394 318.845,238 C318.845,240.481 320.397,241.945 322.628,241.945 C323.253,241.945 323.753,241.874 323.968,241.766 L323.968,239.25 L322.11,239.25 L322.11,237.125 L326.591,237.125 L326.591,243.462 L326.591,243.462 Z M331.274,244.016 L328.543,244.016 L328.543,231.984 L331.274,231.984 L331.274,244.016 L331.274,244.016 Z M340.807,234.215 L336.185,234.215 L336.185,236.965 L340.505,236.965 L340.505,239.179 L336.185,239.179 L336.185,244.016 L333.454,244.016 L333.454,231.984 L340.807,231.984 L340.807,234.215 L340.807,234.215 Z" id="Shape" stroke="none" fill="#000000" fillRule="evenodd"></path>
                </svg>
              </button>
              <button className='post-edit--options--item' onClick={this.onPhoto}>
                <svg width="25px" height="18px" viewBox="6833 3731 96 86" version="1.1">
                    <g id="noun_77833_cc" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(6833.000000, 3731.000000)">
                        <g id="Group" fill="#000000">
                          <path d="M73.1,14.7 L72.1,10.8 C70.6,5 64.3,0.4 58.2,0.4 L37.9,0.4 C31.8,0.4 25.5,5.1 23.9,10.8 L22.9,14.7 L14.5,14.7 C6.7,14.7 0.5,20.8 0.5,28 L0.5,72.1 C0.5,79.5 6.8,85.6 14.5,85.6 L81.6,85.6 C89.2,85.6 95.5,79.5 95.5,72.1 L95.5,28 C95.5,20.8 89.2,14.7 81.6,14.7 L73.1,14.7 L73.1,14.7 Z M48,73.1 C33.8,73.1 22.3,61.8 22.3,48 C22.3,34.2 33.8,22.9 48,22.9 C62.3,22.9 73.9,34.2 73.9,48 C73.9,61.8 62.3,73.1 48,73.1 L48,73.1 Z M65,48 C65,38.8 57.4,31.4 48,31.4 C38.6,31.4 31,38.8 31,48 C31,57.2 38.6,64.6 48,64.6 C57.4,64.5 65,57.1 65,48 L65,48 Z" id="Shape"></path>
                        </g>
                    </g>
                </svg>
              </button>
              <button className='post-edit--options--item' onClick={this.onPhoto}>
                <svg width="25px" height="18px" viewBox="0 0 146 118" version="1.1">
                  <path d="M145.8408,103.37677 L145.6,100.19077 L145.6,6.01002703 C145.6,3.73015541 143.8712,1.59459459 141.5844,1.59459459 L137.2792,1.59459459 C136.416,0.614317568 135.1224,0.0318918919 133.718,0.137135135 L114.2908,1.59459459 L17.2176,1.59459459 C14.934,1.59459459 13.2,3.73015541 13.2,6.01002703 L13.2,9.17888514 L4.3884,9.83984459 C2.0132,10.0180405 0.23,12.0878243 0.4096,14.4577905 L7.9072,113.724493 C8.0852,116.095257 10.1604,117.87602 12.5344,117.697824 L141.8648,107.995514 C144.242,107.817318 146.0196,105.747135 145.8408,103.37677 L145.8408,103.37677 Z M13.2,94.4430541 L7.3508,17.0007703 L13.2,16.5622568 L13.2,94.4430541 L13.2,94.4430541 Z M48.3352,24.1361824 C53.78,24.1361824 58.1956,28.5368649 58.1956,33.9620743 C58.1956,39.3856892 53.78,43.7851757 48.3352,43.7851757 C42.8936,43.7851757 38.4784,39.3860878 38.4784,33.9620743 C38.4784,28.5368649 42.8936,24.1361824 48.3352,24.1361824 L48.3352,24.1361824 Z M14.3884,110.175723 L13.9104,103.847973 C14.6244,104.926318 15.8168,105.641892 17.218,105.641892 L74.8224,105.641892 L14.3884,110.175723 L14.3884,110.175723 Z M130,89.2972973 L113.2368,89.2972973 L96.408,89.2972973 L62.7516,89.2972973 L29.2,89.2972973 L29.2,82.9819054 L54.386,64.0397162 L54.454,64.4766351 L71.1556,74.5955338 L96.3908,40.7578378 L117.408,53.3371959 L130,80.9591622 L130,89.2972973 L130,89.2972973 Z" id="Shape" stroke="none" fill="#000000" fillRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <button disabled={(this.state.message.length || this.props.context.media) ? false : true }
             onClick={this.submitPost}
             className='post-edit--send'> Send
            </button>
          </div>
        </div>
        <div className='modal-overlay' onClick={this.home}></div>
    </div>
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
