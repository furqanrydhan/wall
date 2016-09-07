import React from 'react';
import moment from 'moment';

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
    return (
      <div className="chat-quote">
        <div className="chat-quote-left">
          <div className="chat-quote-avatar">
            <img src={this.props.db.getImageUrl(this.props.item.quote.user_id)} role="presentation" />
          </div>
        </div>
        <div className = "chat-quote-right">
          <div className="chat-quote--username">
            {this.props.item.quote.username}
          </div>
          <div className="chat-quote--text">
            {this.props.item.quote.message}
          </div>
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
      return (<span className={`chat-item--inner--message--content ' ${this.state.imageLoaded ? 'is-loaded' : 'is-loading'}`}>
        <div className="chat-item--inner--message--content--image">
          <div style={{ backgroundImage: `url(${gifUrl.replace('http://', 'https://')})`, height: `${height * ratio}px`, width: `${width * ratio}px` }} />
        </div>
      </span>);
    }
    return <span className="chat-item--inner--message--content">{this.props.item.message}</span>;
  }

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
          <div className="chat-item--inner--message">
            {this.renderContent()}
          </div>
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
