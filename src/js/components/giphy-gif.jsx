import React from 'react';
import Helper from '../helper.js';

class GiphyGif extends React.Component {

  constructor() {
    super();
    this.state = {};
    this.broadcastChat = this.broadcastChat.bind(this);
  }

  broadcastChat(data) {
    const m = data.result[0];
    // FIXME
    // Bebo.Notification.broadcast('{{{user.username}}}', ' just posted a GIF', { rate_limit_key: `${m.user_id}_${Math.floor(Date.now() / 1000 / 60 / 60)}` }, (error, resp) => {
    //   if (error) {
    //     return console.log('error sending notification', error);
    //   }
    //   return console.log('resp', resp); // an object containing success
    // });
    // console.log("Sending GIF", m);
    // Bebo.emitEvent({ message: m });
    Bebo.emitEvent({ message: {thread_id: this.props.thread_id, "newMsg": 1, "dm_id": m.id }});

    this.props.switchMode('text');
  }

  render() {
    var that = this;
    const { gif, actingUser, children, originalSize } = this.props;
    const { username, user_id } = actingUser;
    const { url, webp } = gif.images.fixed_width_downsampled;
    const gifUrl = Bebo.getDevice() === 'android' ? webp || url : url;
    return (<div
      className="gif-wrapper"
      onClick={this.props.onClick ? (this.props.onClick) : (() => {
        var user_id = Helper.getPartnerFromThreadId(this.props.actingUser, this.props.thread_id);
        const image = {
          preview: gif.images.downsized_still.url,
          url: gif.images.fixed_width_downsampled.url,
          webp: gif.images.fixed_width_downsampled.webp,
          width: gif.images.fixed_width_downsampled.width,
          height: gif.images.fixed_width_downsampled.height,
        };
        const message = {
          thread_id: this.props.thread_id,
          image,
          username: this.props.actingUser.username,
          user_id: this.props.actingUser.user_id,
          users: [user_id],
          type: 'image',
        };
        Bebo.Db.saveAsync('dm', message)
          .then(function(data) {
            return that.props.incrUnreadMessage(that.props.thread_id, user_id)
              .then(function() {
                return data
              });
          })
          .then(that.broadcastChat);
      })}
    >
      {originalSize ? (
        <img className="gif" style={{ paddingTop: 0 }} role="presentation" src={gifUrl.replace('http://', 'https://')} />
      ) : (
        <div className="gif" style={{ backgroundImage: `url(${gifUrl.replace('http://', 'https://')})` }} />
      )}

      {children}
    </div>);
  }
}

GiphyGif.displayName = 'GiphyGif';

// Uncomment properties you need
GiphyGif.propTypes = {
  gif: React.PropTypes.object,
  actingUser: React.PropTypes.object.isRequired,
  switchMode: React.PropTypes.func.isRequired,
  onClick: React.PropTypes.func,
  children: React.PropTypes.element,
  originalSize: React.PropTypes.bool,
};
// GiphyGif.defaultProps = {};


export default GiphyGif;
