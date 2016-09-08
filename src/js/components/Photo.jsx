import React from 'react';
import TweenMax from 'gsap';

import '../../styles/_photo.scss';

const touchPoint = {
  x: 0,
  y: 0,
};

class Photo extends React.Component {

  constructor() {
    super();
    this.state = {
      showUserHandle: null,
      isTouching: 0,
      isLoading: false,
      isAnimating: false,
    };
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }
  componentDidMount() {
    if (!Object.keys(this.refs).length) {
      return;
    }
    const { circleOne, circleTwo, circleThree} = this.refs;
    this.tweenOne = TweenMax.to(circleOne, 2, {
      attr: {
        r: 22,
        'stroke-width': 1,
        'stroke-opacity': 1,
      },
      opacity: 0,
      repeat: -1,
      delay: 1,
    }).pause(0);
    this.tweenTwo = TweenMax.to(circleTwo, 1, {
      attr: {
        r: 22,
        'stroke-width': 1,
        'stroke-opacity': 1,
      },
      opacity: 0,
      repeat: -1,
    }).pause(0);
    this.tweenThree = TweenMax.to(circleThree, 0.8, {
      attr: {
        r: 22,
        'stroke-width': 1,
        'stroke-opacity': 1,
      },
      opacity: 0,
      repeat: -1,
      delay: 1.5,
    }).pause(0);
  }

  handleTouchStart(e) {
    touchPoint.x = e.touches[0].clientX - 75;
    touchPoint.y = e.touches[0].clientY - 75;
    this.refs.touchCenter.style.transform = `translate3d(${touchPoint.x}px, ${touchPoint.y}px, 0)`;
    this.setState({ isTouching: Date.now() });
    this.touchTimeout = setTimeout(() => {
      this.setState({ isLoading: true });
      this.tweenOne.restart();
      this.tweenTwo.restart();
      this.tweenThree.restart();
    }, 200);
  }
  componentWillUnMount() {
    clearTimeout(this.touchTimeout);
  }

  handleTouchEnd() {
    this.tweenOne.pause(0);
    this.tweenTwo.pause(0);
    this.tweenThree.pause(0);
    const { isTouching } = this.state;
    if (isTouching + 200 >= Date.now()) {
      clearTimeout(this.touchTimeout);
      this.props.nextPhoto();
      touchPoint.x = 0;
      touchPoint.y = 0;
    } else {
      // animate the like explosion here
      this.setState({ isAnimating: true, isTouching: 0, isLoading: false }, () => {
        this.props.likePhoto(this.props.photo, Object.assign({}, touchPoint, { w: window.innerWidth, h: window.innerHeight }));
        setTimeout(() => {
          this.setState({ isAnimating: false });
          touchPoint.x = 0;
          touchPoint.y = 0;
        }, 700);
      });
    }
  }
  handleTouchMove(e) {
    touchPoint.x = e.touches[0].clientX - 75;
    touchPoint.y = e.touches[0].clientY - 75;
    this.refs.touchCenter.style.transform = `translate3d(${touchPoint.x}px, ${touchPoint.y}px, 0)`;
  }

  renderTouchPoint() {
    const { isTouching, isLoading, isAnimating } = this.state;
    if (!this.props.style) {
      return (<div ref="touchCenter" className="touch-center" style={isTouching || isAnimating ? {} : { display: 'none' }}>
        <svg style={{ visibility: isTouching && isLoading ? 'visible' : 'hidden' }} className="loader2" height="50" stroke="#fff" viewBox="0 0 45 45" width="50">
          <g fill="none" strokeWidth="2" transform="translate(1 1)">
            <circle ref="circleOne" cx="22" cy="22" r="6" strokeOpacity="0" />
            <circle ref="circleTwo" cx="22" cy="22" r="6" strokeOpacity="0" />
            <circle ref="circleThree" cx="22" cy="22" r="8" strokeOpacity="0" />
          </g>
        </svg>
        <div className="photo-like-container" style={{ visibility: isAnimating ? 'visible' : 'hidden' }}>
          <div className={isAnimating ? 'heart is_animating' : 'heart'} />
        </div>
      </div>);
    }
    return null;
  }

  renderPhotoUser() {
    const { actingUser, photo, currentAt } = this.props;
    if (photo && actingUser && currentAt) {
      const { image_url: imageUrl, username } = photo.user;
      const sinceSeconds = Math.floor((currentAt - photo.created_at) / 1000);
      const h = Math.floor(sinceSeconds / 60 / 60);
      const m = Math.floor((sinceSeconds - (h * 60 * 60)) / 60);
      const s = Math.floor((sinceSeconds - (h * 60 * 60) - (m * 60)));
      const sinceTaken = { h, m, s };
      const humanReadable = () => {
        if (sinceTaken.h) {
          return `${h}h`;
        }
        if (sinceTaken.m) {
          return `${m}m`;
        }
        return 'now';
      };
      return (<div className="posting-user">
        <div className="posting-user--container">
          <div className="posting-user--image" style={{ backgroundImage: `url(${imageUrl})` }} />
          <div className="posting-user--name">{username}</div>
          <div className="posting-user--timesince">{humanReadable()}</div>
        </div>
      </div>);
    }
    return null;
  }

  render() {
    const photo = this.props.photo;
    return (<div className="photo" style={this.props.style || {}}>
      {this.renderPhotoUser()}
      <div
        className="photo-img"
        onTouchStart={this.handleTouchStart}
        onTouchEnd={this.handleTouchEnd}
        onTouchMove={this.handleTouchMove}
        style={{ backgroundImage: `url(${photo.image_url})` }}
      >
      </div>
      <div className="photo-gradient"></div>
      {this.renderTouchPoint()}
    </div>);
  }

}

Photo.displayName = 'Photo';

// Uncomment properties you need
Photo.propTypes = {
  photo: React.PropTypes.object.isRequired,
  actingUser: React.PropTypes.object.isRequired,
  nextPhoto: React.PropTypes.func.isRequired,
  currentAt: React.PropTypes.number.isRequired,
  likePhoto: React.PropTypes.func.isRequired,
  style: React.PropTypes.object,
};
// Photo.defaultProps = {};

export default Photo;
