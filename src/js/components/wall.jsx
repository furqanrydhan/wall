import React from 'react';
import WallList from './wall-list.jsx';
import ChatBackground from './chat-background.jsx';
import assert from 'assert';

class Wall extends React.Component {

  constructor() {
    super();
    this.state = {

    };
    this.onPost = this.onPost.bind(this);
    this.onReply = this.onReply.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentWillMount() {
  }

  onPost() {
    this.props.navigate("post", {});
  }

  onReply(quote) {
    console.log("Reply clicked", quote);
    this.props.navigate("post", {quote: quote});
  }

  onDelete(post) {
    console.log("Delete clicked", post);
    this.props.navigate("post-delete", post);
  }

  onEdit(post) {
    console.log("Edit clicked", post);
    this.props.navigate("post", post);
  }

  render() {
    console.log('this.props.minimized', this.props.minimized);
    assert(this.props.me);
    return (
      <div className={ this.props.minimized ? ' chat is-minimized' : 'chat'}>
        <div className="chat-new-post" onTouchStart={this.onPost}>
          <svg viewBox="0 0 90 92" version="1.1">
              <g id="pen" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <path d="M71.768,1.732 C70.792,0.755 69.208,0.755 68.233,1.732 L60,9.965 L81.035,31 L89.267,22.768 C90.244,21.791 90.244,20.209 89.267,19.233 L71.768,1.732 L71.768,1.732 Z" id="Shape" fill="#FFFFFF"></path>
                  <path d="M0.732,90.268 C1.22,90.756 1.86,91 2.5,91 C3.14,91 3.78,90.756 4.268,90.268 L6.253,88.283 L26.703,83.738 L7.262,64.297 L2.718,84.747 L0.733,86.732 C-0.244,87.709 -0.244,89.291 0.732,90.268 L0.732,90.268 Z" id="Shape" fill="#FFFFFF"></path>
                  <rect id="Rectangle-path" fill="#FFFFFF" transform="translate(43.750404, 47.248946) rotate(45.000000) translate(-43.750404, -47.248946) " x="28.8765462" y="14.3937615" width="29.7477147" height="65.7103698"></rect>
              </g>
          </svg>
        </div>
        <div className="chat-upper" >
          <WallList 
                    disabledScroll={this.props.minimized}
                    messages={this.props.messages}
                    newMsg={this.props.newMsg}
                    offset={this.props.offset}
                    hasMore={this.props.hasMore}
                    loadMore={this.props.loadMore}
                    reply={this.onReply}
                    deletePost={this.onDelete}
                    editPost={this.onEdit}
                    navigate={this.props.navigate}
                    post={this.onPost}
                    me={this.props.me}
                    db={this.props.db} />
          <ChatBackground />
        </div>
      </div>
    );
  }
}

Wall.displayName = 'Wall';

export default Wall;
