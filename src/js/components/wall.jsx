import React from 'react';
import WallList from './wall-list.jsx';
import ChatBackground from './chat-background.jsx';

class Wall extends React.Component {

  constructor() {
    super();
    this.state = {
      // mode: 'text',
      // open: false,
      // closing: false,
    };
    // this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.onPost = this.onPost.bind(this);
    this.onReply = this.onReply.bind(this);
  }

  componentWillMount() {
  }

  // blurInput() {
  //   this.setState({ blurInput: true });
  //   this.handleSwitchMode('text');
  // }

  // handleSwitchMode(mode) {
  //   if (this.state.mode === 'gif') {
  //     this.setState({ mode: 'text', closing: true, open: false }, () => {
  //       setTimeout(() => {
  //         this.setState({ closing: false });
  //       }, 333);
  //     });
  //   }
  //   if (this.state.mode === 'text' && mode !== 'text') {
  //     this.setState({ mode }, () => {
  //       setTimeout(() => {
  //         this.setState({ open: true });
  //       }, 5);
  //     });
  //   }
  // }

  onPost() {
    this.props.navigate("post", {});
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
          <WallList messages={this.props.messages}
                    offset={this.props.offset}
                    hasMore={this.props.hasMore}
                    loadMore={this.props.loadMore}
                    reply={this.onReply}
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

// Uncomment properties you need
// App.propTypes = {};
// App.defaultProps = {};

export default Wall;
