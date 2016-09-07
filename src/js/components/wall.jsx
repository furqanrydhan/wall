import React from 'react';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import Post from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';

class Wall extends React.Component {

  constructor() {
    super();
    this.state = {
      post: false,
      quote: null,
      mode: 'text',
      open: false,
      closing: false,
    };
    // this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.home = this.home.bind(this);
    this.onPost = this.onPost.bind(this);
    this.onReply = this.onReply.bind(this);
  }

  componentWillMount() {
  }

  // blurInput() {
  //   this.setState({ blurInput: true });
  //   this.handleSwitchMode('text');
  // }

  home() {
    this.setState({post: false, quote: null});
  }

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

  renderPostEdit() {
    return <Post me={this.props.me}
                 home={this.home}
                 quote={this.state.quote}
                 db={this.props.db}
                 actingUser={this.props.me} />;
  }

  onPost() {
    console.log("Post clicked");
    this.setState({post: true});
  }

  onReply(quote) {
    console.log("Reply clicked", quote);
    this.setState({post: true, quote: quote});
  }

  render() {

    if (this.state.post) {
      return this.renderPostEdit();
    }
    return (
      <div className="chat">
        <div className="chat-new-post">
          <div className="chat-fake-input" onClick={this.onPost}>
            <input 
              type="text"
              placeholder="New Post..."
            />
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

// Uncomment properties you need
// App.propTypes = {};
// App.defaultProps = {};


export default Wall;
