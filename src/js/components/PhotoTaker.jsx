import React from 'react';


class PhotoTaker extends React.Component {

  constructor(props) {
    super(props);
    this.closeTaker = this.closeTaker.bind(this);
  }

  closeTaker() {
    // eslint-disable-next-line
    Bebo.hangup();
    this.props.close();
  }


  render() {
    return (<div className="taker">
      <div className="close-button" onClick={this.closeTaker}>
        <svg x="0px" y="0px" viewBox="0 0 212.982 212.982" width="512px" height="512px">
          <g id="Close">
            <path d="M131.804,106.491l75.936-75.936c6.99-6.99,6.99-18.323,0-25.312   c-6.99-6.99-18.322-6.99-25.312,0l-75.937,75.937L30.554,5.242c-6.99-6.99-18.322-6.99-25.312,0c-6.989,6.99-6.989,18.323,0,25.312   l75.937,75.936L5.242,182.427c-6.989,6.99-6.989,18.323,0,25.312c6.99,6.99,18.322,6.99,25.312,0l75.937-75.937l75.937,75.937   c6.989,6.99,18.322,6.99,25.312,0c6.99-6.99,6.99-18.322,0-25.312L131.804,106.491z" fill="#FFFFFF" />
          </g>
        </svg>
      </div>
    </div>);
  }
}

PhotoTaker.displayName = 'PhotoEditor';

// Uncomment properties you need
PhotoTaker.propTypes = {
  close: React.PropTypes.func.isRequired,
};
// PhotoTaker.defaultProps = {};

export default PhotoTaker;
