import React from 'react';
import moment from 'moment';
import Remarkable from 'remarkable';

var md = new Remarkable(
  {html: false,
  breaks: true,
  linkify: true});

var quoteMd = new Remarkable(
  {html: false,
  breaks: false,
  linkify: true});

class ChatItem extends React.Component {

  constructor() {
    super();
    this.state = {
      item: null,
      imageLoaded: false,
    };
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
    this.renderAvatar = this.renderAvatar.bind(this);
    this.renderTimestamp = this.renderTimestamp.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.reply = this.reply.bind(this);
  }

  componentWillMount() {
    const obj = this.props.item;
    if (this.props.item.username === '') {
      obj.username = obj.user_id.substr(0, 7);
    }
    this.setState({ item: obj });
  }

  componentDidMount() {
    // this.props.handleNewMessage();
  }

  handleImageLoaded() {
    this.setState({ imageLoaded: true });
  }

  renderAvatar() {
    return (<div className="ui-avatar">
      <img src={this.props.db.getImageUrl(this.state.item.user_id)} role="presentation" />
    </div>);
  }

  renderTimestamp() {
    return moment(this.props.item.created_at).format('LT');
  }

  renderQuote() {
    if (!this.props.item.quote) {
      return "";
    }
    var message = this.props.item.quote.message;
    message = {__html: quoteMd.render(message)};
    return (
      <div className="chat-quote">
        <div className="chat-quote-left">
          <div className="chat-quote-avatar">
            <img src={this.props.db.getImageUrl(this.props.item.quote.user_id)} role="presentation" />
          </div>
        </div>
        <div className="chat-quote-right">
          <div className="chat-quote--username">
            {this.props.item.quote.username}
          </div>
          <div className="chat-quote--text" dangerouslySetInnerHTML={message}></div>
        </div>
      </div> 
    )
  }

  renderContent() {
    const { type, image } = this.props.item;
    if (type === 'image') {
      const { webp, url, width, height } = image;
      const ratio = 120 / height;
      const gifUrl = Bebo.getDevice() === 'android' ? webp || url : url;
      return (
        <div className="chat-item--inner--message">
          <span className={`chat-item--inner--message--content ' ${this.state.imageLoaded ? 'is-loaded' : 'is-loading'}`}>
            <div className="chat-item--inner--message--content--image">
              <div style={{ backgroundImage: `url(${gifUrl.replace('http://', 'https://')})`, height: `${height * ratio}px`, width: `${width * ratio}px` }} />
            </div>
          </span>
        </div>
      );
    }
    var message = this.props.item.message;
    message = {__html: md.render(message)};
    return (
      <div className="chat-item--inner--message">
       <span className="chat-item--inner--message--content" dangerouslySetInnerHTML={message}></span>
      </div>)
  }

  renderImages() {
    if(!this.props.item.images) {
      return;
    }
    for (var i = 0 ; i< this.props.item.images.length; i++) {
      this.props.item.images[i].key = i+1;
    }
    return (
      <div className="chat-item--inner--images">
        {this.props.item.images.map((i) =>
          <div key={i.key} className={"image"}
               style={{backgroundImage: "url(" + (i.url) + ")"}}></div>)}
      </div>
    )
  };

  reply(e) {
    console.log("reply clicked");
    this.props.reply(this.state.item);
  }

  render() {
    return (<li className="chat-item">
      <div className="chat-item--inner">
        <div className="chat-item--inner--left">
          <div className="chat-item--inner--avatar">
            {this.renderAvatar()}
          </div>
        </div>
        <div className="chat-item--inner--right">
          <div className="chat-item--inner--meta">
            <span className="chat-item--inner--meta--username">{this.props.item.username}</span>
            <span className="chat-item--inner--meta--time">
              {this.renderTimestamp()}
            </span>
            <div className="chat-item--reply--button" data-post-id={this.props.item.id} onClick={this.reply}></div>
          </div>
          {this.renderContent()}
          {this.renderImages()}
          {this.renderQuote()}
        </div>
      </div>
    </li>);
  }
}

ChatItem.displayName = 'ChatItem';

// Uncomment properties you need
ChatItem.propTypes = {
  item: React.PropTypes.object.isRequired,
  handleNewMessage: React.PropTypes.func.isRequired,
};
// ChatItem.defaultProps = {};

export default ChatItem;
