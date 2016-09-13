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
    assert(this.props.me);

    return (
      <div className="chat">
        <div className="chat-new-post">
          <div className="chat-fake-input" onClick={this.onPost}>
            <div className="chat-fake-input--input">New Post...</div>
            <div className="chat-fake-input--send-btn">Post</div>
          </div>
        </div>
        <div className="chat-upper" >
          <WallList messages={this.props.messages}
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
