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
    this.renderMeta = this.renderMeta.bind(this);
    this.reply = this.reply.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.interceptHref = this.interceptHref.bind(this);
    this.viewPhoto = this.viewPhoto.bind(this);
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

  interceptHref(e) {
    if (e.target.href) {z
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

  viewPhoto(e) {
    // FIXME don't allow this on the edit page!
    console.log("View Photo", e);
    this.props.navigate("photo-viewer", {"mediaUrl": e.currentTarget.dataset.mediaUrl});
  }

  reply(e) {
    console.log("reply clicked");
    this.props.reply(this.state.item);
  }

  renderMeta(){
    var postReply, postDelete, postEdit;

    if (this.props.me.user_id === this.props.item.user_id) {
        postEdit = <div className="chat-item--edit--button" data-post-id={this.props.item.id} onClick={this.edit}></div>
        postDelete = <div className="chat-item--delete--button" data-post-id={this.props.item.id} onClick={this.delete}></div>
    }

  
    if (this.props.type === 'quote') {
      return <div className="wall-item--meta quote">
        <div className='wall-item--meta--image'>
           <img src={this.props.db.getImageUrl(this.state.item.user_id)} role="presentation" />
        </div>
        <div className='wall-item--meta--text'>
          <span className='wall-item--meta--text--label'>{this.props.item.username}</span>
        </div>
      </div>
    } else {
      return <div className="wall-item--meta">
        <div className='wall-item--meta--image'>
          <img src={this.props.db.getImageUrl(this.state.item.user_id)} role="presentation" />
        </div>
        <div className='wall-item--meta--text'>
          <span className='wall-item--meta--text--name'>{this.props.item.username}</span>
          <span className='wall-item--meta--text--info'>{moment(this.props.item.created_at).fromNow()}</span>
        </div>
        <div className='wall-item--meta--actions'>
            <div className='wall-item--action'>
              {postEdit}
              {postDelete}
           </div>
        </div>
      </div>
    }
  }

  renderMedia(){
    if(this.props.item.media && this.props.item.media.length){
      console.log("media", this.props.item);
      for (var i = 0 ; i< this.props.item.media.length; i++) {
        this.props.item.media[i].key = i+1;
      }
      return (
        <div className='wall-item--media'>
          <ul className='wall-item--media--list'>
            {this.props.item.media.map((i) =>  <div className='media-item'
              key={i.key}
              data-media-url={i.url}
              onClick={this.viewPhoto}
              style={{backgroundImage: "url(" + (i.url) + ")"}}></div>)}
          </ul>
        </div>
      )
    } else {
      return null
    }
  };

  renderMessage(){
    var message = this.props.item.message;
    message = {__html: md.render(message)};
    return <div className='wall-item--message'>
      <span className={'wall-item--message--text ' + this.props.type}
        dangerouslySetInnerHTML={message}>
      </span>
    </div>
  }

  renderBar(){
    if(this.props.type === 'quote'){
      return <div className='wall-item--bar'></div>    
    } else {
      return null
    }
  }

 renderFooter(){
    var text = '';
    if (this.props.item.viewed_cnt > 1){
      text = 'Seen by ' + this.props.item.viewed_cnt + ' people'
    } else if (this.props.item.viewed_cnt == 1){
      text = 'Seen by ' + this.props.item.viewed_cnt + ' person'
    } 

    if (this.props.type !== 'quote') {
    return <div className="wall-item--footer">
      <div className='wall-item--footer--viewers'>
        <div className='wall-item--footer--viewers--profiles'>
          <div className='viewers--profiles--item'>
            <img src='' role='presentation'/>
          </div>
          <div className='viewers--profiles--item'>
           <img src='' role='presentation' />
          </div>
          <div className='viewers--profiles--item'>
             <img src='' role='presentation' />
          </div>
        </div>
        <div className='wall-item--footer--viewers--count'>6 views</div>
      </div>
       <button onClick={this.reply} className='wall-item--footer--reply'>
       <svg width="19px" height="15px" viewBox="0 0 22 17">
        <path d="M21.7641471,13.76762 C20.0934412,10.06808 16.6811765,5.15236 10.2309706,4.53968 C9.48038235,4.46182 8.89220588,3.81514 8.86729412,3.02158 C8.866,3.00356 8.866,2.98588 8.866,2.96616 C8.866,2.94814 8.866,2.93182 8.86729412,2.9138 L8.86729412,0.7038 L8.866,0.7038 C8.866,0.31518 8.56285294,0 8.19047059,0 C8.02708824,0 7.87761765,0.0612 7.76114706,0.1615 C7.75338235,0.16762 7.74561765,0.1751 7.73720588,0.18258 L0.556470588,6.86018 C0.555823529,6.86154 0.554529412,6.86154 0.552911765,6.86324 L0.464911765,6.94552 C0.177617647,7.23384 0,7.63742 0,8.08418 C0,8.47552 0.137823529,8.83558 0.365264706,9.112 L0.625705882,9.36292 L7.71294118,16.1942 C7.72297059,16.2044 7.73170588,16.21528 7.74141176,16.22412 C7.86176471,16.33462 8.01867647,16.40058 8.19079412,16.40058 C8.56317647,16.40058 8.86632353,16.08676 8.86632353,15.69848 L8.86761765,15.69848 L8.86761765,12.93428 C8.86632353,12.91626 8.86632353,12.89858 8.86632353,12.88056 C8.86632353,12.86254 8.86632353,12.84486 8.86761765,12.82684 C8.89479412,11.9782 9.56417647,11.2999 10.3859412,11.2999 L10.3859412,11.29684 C14.5290588,11.38354 17.9154412,11.93162 20.6253235,14.50746 L20.6269412,14.50746 C20.6764412,14.5571 20.7278824,14.6047 20.7777059,14.65434 L20.779,14.6557 C20.8870588,14.7305 21.0164706,14.77538 21.1559118,14.77538 C21.5295882,14.77538 21.8311176,14.46156 21.8311176,14.07328 C21.8307941,13.96176 21.8081471,13.86044 21.7641471,13.76762 L21.7641471,13.76762 Z" id="Shape" stroke="none" fill="#232323"></path>
       </svg>
        <span>Reply</span>
      </button>
    </div>
    } else {
      return;
    }
  }

  renderQuote(){
    if (!this.props.item.quote) {
      return;
    }
    if (this.props.type === "quote") {
      return;
    }
    return <WallItem me={this.props.me} type="quote" db={this.props.db} item={this.props.item.quote} />;
  } 

  edit(e) {
    this.props.reply(this.state.item);
  }

  delete(e) {
    this.props.reply(this.state.item);
  }

  render() {
    console.log('render with', this.props);
    return  <div className={"wall-item " + this.props.type }>
     {this.renderBar()}
      <div className='wall-item--inner'>
        {this.renderMeta()}
        <div className='wall-item--inner--body'>
          {this.renderMessage()}
          {this.renderMedia()}
          {this.renderQuote()}
        </div>
        {this.renderFooter()}
      </div>
    </div>
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
