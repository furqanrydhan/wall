import React from 'react';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import ChatInput from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';

class Thread extends React.Component {

  constructor() {
    super();
    this.state = {
      blurInput: true,
      mode: 'text',
      open: false,
      closing: false,
    };
    this.blurInput = this.blurInput.bind(this);
    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.home = this.home.bind(this);
  }

  componentWillMount() {
  }

  blurInput() {
    this.setState({ blurInput: true });
    this.handleSwitchMode('text');
  }

  handleSwitchMode(mode) {
    if (this.state.mode === 'gif') {
      this.setState({ mode: 'text', closing: true, open: false }, () => {
        setTimeout(() => {
          this.setState({ closing: false });
        }, 333);
      });
    }
    if (this.state.mode === 'text' && mode !== 'text') {
      this.setState({ mode }, () => {
        setTimeout(() => {
          this.setState({ open: true });
        }, 5);
      });
    }
  }
  home() {
    this.props.navigate("home");
  }

  render() {
    const giphyOpen = this.state.open === true;
    const giphyClosing = this.state.closing === true;
    var giphyBrowser = <GiphyBrowser style={giphyOpen ? { transform: 'translate3d(0,0,0)' } : {}}
                                     actingUser={this.props.me}
                                     incrUnreadMessage={this.props.incrUnreadMessage}
                                     thread_id={this.props.thread_id}
                                     switchMode={this.handleSwitchMode} />;
    return (<div className="chat">
      <div className="chat-header">
        <div onClick={this.home} className="back-button"><img src="./assets/img/icBack.png" alt="back"/></div>
        <div className="chat-thread-name">{this.props.threadName}</div>
      </div>
      <div className="chat-upper"
           style={this.state.mode === 'gif' ?  { transform: 'translate3d(40vw,0,0)' } : {}}>
        <ChatList messages={this.props.messages}
                  blurChat={this.blurInput}
                  onPresenceEvent={this.props.onPresenceEvent}
                  actingUser={this.props.me}
                  thread_id={this.props.thread_id} />
        <ChatBackground />
      </div>
      <div className="chat-lower"
           style={this.state.mode === 'gif' ? { transform: 'translate3d(40vw,0,0)' } : {}}>
        <ChatInput blurChat={this.state.blurInput}
                   actingUser={this.props.me}
                   incrUnreadMessage={this.props.incrUnreadMessage}
                   thread_id={this.props.thread_id}
                   switchMode={this.handleSwitchMode}
                   setChatInputState={this.blurInput} />
      </div>
      {(giphyOpen || giphyClosing || this.state.mode === 'gif') && giphyBrowser}
    </div>);
  }
}

Thread.displayName = 'Thread';

// Uncomment properties you need
// App.propTypes = {};
// App.defaultProps = {};


export default Thread;
