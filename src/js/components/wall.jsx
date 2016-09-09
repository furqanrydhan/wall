import React from 'react';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';

class Wall extends React.Component {

  constructor() {
    super();
    this.state = {

    };
    this.onPost = this.onPost.bind(this);
    this.onReply = this.onReply.bind(this);
  }

  componentWillMount() {
  }

  onPost() {
    console.log("Post clicked");
    this.props.navigate("post");
  }

  onReply(quote) {
    console.log("Reply clicked", quote);
    this.props.navigate("post", {quote: quote});
  }

  render() {

    return (
      <div className="chat">
        <div className="chat-new-post">
          <div className="chat-fake-input" onClick={this.onPost}>
            <div className="chat-fake-input--input">New Post...</div>
            <div className="chat-fake-input--send-btn">Post</div>
          </div>
        </div>
        <div className="chat-upper" >
          <ChatList messages={this.props.messages}
                    reply={this.onReply}
                    post={this.onPost}
                    actingUser={this.props.me}
                    db={this.props.db} />
          <ChatBackground />
        </div>
      </div>
    );
  }
}

Wall.displayName = 'Wall';

export default Wall;
