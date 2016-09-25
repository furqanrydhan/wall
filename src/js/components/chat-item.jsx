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
    this.renderMeta = this.renderMeta.bind(this);
    this.like = this.like.bind(this);
    this.editPost = this.editPost.bind(this);
    this.deletePost = this.deletePost.bind(this);
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
    var that = this;
    if (this.props.type === "post"
      && this.props.item.user_id !== this.props.me.user_id
      && !this.props.item.viewed_ids.has(this.props.me.user_id)) {
        this.props.db.incrViewedPost(this.props.item)
          .then(function(row) {
            if(row) {
              that.setState({item: row});
            }
          });
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
    if (e.target.href) {
      Bebo.openURI(e.target.href);
      e.preventDefault();
    }
  }

  viewPhoto(e) {
    // FIXME don't allow this on the edit page!
    console.log("View Photo", e);
    this.props.navigate("photo-viewer", {"mediaUrl": e.currentTarget.dataset.mediaUrl});
  }

  like(e) {
    console.log("reply clicked");
    this.props.likePost(this.state.item);
  }

  editPost(e) {
    this.props.editPost(this.state.item);
  }

  deletePost(e) {
    this.props.deletePost(this.state.item);
  }


  renderMeta() {
    var postDelete, postEdit;

    if (this.props.me.user_id === this.props.item.user_id) {
      postEdit = <div className="chat-item--edit--button" data-post-id={this.props.item.id} onClick={this.editPost}></div>
        postDelete = <div className="chat-item--delete--button" data-post-id={this.props.item.id} onClick={this.deletePost}></div>
    }

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

  renderMedia(){
    if(this.props.item.media && this.props.item.media.length){
      for (var i = 0 ; i< this.props.item.media.length; i++) {
        this.props.item.media[i].key = i+1;
      }
      return (
        <div className='wall-item--media'>
          <ul className={'wall-item--media--list ' + 'item-count-' + this.props.item.media.length}>
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
    if (this.props.type === 'post') {
      message = {__html: md.render(message)};
    } else {
      message = {__html: quoteMd.render(message)};
    }
    return <div className='wall-item--message'>
      <span className={'wall-item--message--text ' + this.props.type}
        onClick={this.interceptHref}
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

    if (this.props.type === 'quote') {
      return;
    }

    var viewed, viewed_cnt;
    if (this.state.item.viewed_cnt) {
      var viewers = [];
      var iter = this.state.item.viewed_ids.values();
      for (var i=0; i<3 ; i++) {
        var next = iter.next().value;
        if (next) {
          viewers.push(
            <div className='viewers--profiles--item' key={next}>
              <img src={this.props.db.getImageUrl(next)} role='presentation'/>
            </div>)
        }
      }

      viewed = (
        <div className={'wall-item--footer--viewers--profiles count-' + this.state.item.viewed_cnt}>
          {viewers}
        </div>);

      viewed_cnt = <span className='wall-item--footer--viewers--count'>{this.state.item.viewed_cnt} views</span>;

    }

    return <div className="wall-item--footer">
      <div className='wall-item--footer--viewers'>
        {viewed}
        {viewed_cnt}
      </div>
      <button onClick={this.like} className='wall-item--footer--reply'>
      <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ5Mi43MTkgNDkyLjcxOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDkyLjcxOSA0OTIuNzE5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8ZyBpZD0iSWNvbnNfMThfIj4KCQk8cGF0aCBkPSJNNDkyLjcxOSwxNjYuMDA4YzAtNzMuNDg2LTU5LjU3My0xMzMuMDU2LTEzMy4wNTktMTMzLjA1NmMtNDcuOTg1LDAtODkuODkxLDI1LjQ4NC0xMTMuMzAyLDYzLjU2OSAgICBjLTIzLjQwOC0zOC4wODUtNjUuMzMyLTYzLjU2OS0xMTMuMzE2LTYzLjU2OUM1OS41NTYsMzIuOTUyLDAsOTIuNTIyLDAsMTY2LjAwOGMwLDQwLjAwOSwxNy43MjksNzUuODAzLDQ1LjY3MSwxMDAuMTc4ICAgIGwxODguNTQ1LDE4OC41NTNjMy4yMiwzLjIyLDcuNTg3LDUuMDI5LDEyLjE0Miw1LjAyOWM0LjU1NSwwLDguOTIyLTEuODA5LDEyLjE0Mi01LjAyOWwxODguNTQ1LTE4OC41NTMgICAgQzQ3NC45ODgsMjQxLjgxMSw0OTIuNzE5LDIwNi4wMTcsNDkyLjcxOSwxNjYuMDA4eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />
      <span>Like</span>
    </button>
    </div>
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

  render() {
    return  <div className={"wall-item " + this.props.type }>
      <div className='wall-item--fake-overlay'></div>
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
};
// ChatItem.defaultProps = {};

export default WallItem;
