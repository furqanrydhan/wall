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

class WallItem extends React.Component {

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
    this.renderViewed = this.renderViewed.bind(this);
    this.reply = this.reply.bind(this);
    this.interceptHref = this.interceptHref.bind(this);
  }

  componentWillMount() {
    const obj = this.props.item;
    if (this.props.item.username === '') {
      obj.username = obj.user_id.substr(0, 7);
    }
    this.setState({ item: obj });
  }

  componentDidMount() {
    if (this.props.type === "post"
      && this.props.item.user_id !== this.props.me.user_id
      && !this.props.item.viewed_ids.has(this.props.me.user_id)) {
        this.props.db.incrViewedPost(this.props.item);
    }
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
      return;
    }
    if (this.props.type === "quote") {
      return;
    }
    return <WallItem type="quote" db={this.props.db} item={this.props.item.quote} />;
  }

  interceptHref(e) {
    if (e.target.href) {
      Bebo.openURI(e.target.href);
      e.preventDefault();
    }
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
       <span className="chat-item--inner--message--content" onClick={this.interceptHref} dangerouslySetInnerHTML={message}></span>
      </div>)
  }

  renderMedia() {
    if(!this.props.item.media) {
      return;
    }
    for (var i = 0 ; i< this.props.item.media.length; i++) {
      this.props.item.media[i].key = i+1;
    }
    return (
      <div className="chat-item--inner--images">
        {this.props.item.media.map((i) =>
          <div key={i.key} className={"image"}
               style={{backgroundImage: "url(" + (i.url) + ")"}}></div>)}
      </div>
    )
  };

  reply(e) {
    console.log("reply clicked");
    this.props.reply(this.state.item);
  }

  renderViewed() {
    return <div>{this.props.item.viewed_cnt}</div>;
  }

  render() {
    return (
      <div className="chat-item chat-item--inner">
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
          {this.renderMedia()}
          {this.renderQuote()}
          {this.renderViewed()}
        </div>
      </div>
    );
  }
}

WallItem.displayName = 'WallItem';

// Uncomment properties you need
WallItem.propTypes = {
  item: React.PropTypes.object.isRequired,
  // handleNewMessage: React.PropTypes.func.isRequired,
};
// ChatItem.defaultProps = {};

export default WallItem;
