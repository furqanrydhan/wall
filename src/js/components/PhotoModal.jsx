import React from 'react';

import PhotoEditor from './PhotoEditor.jsx';
import PhotoTaker from './PhotoTaker.jsx';

class Modal extends React.Component {

  renderModal() {
    switch (this.props.modal) {
      case 'photo-editor':
        return <PhotoEditor photo={this.props.photo} closeEditor={this.props.closeModal} savePhoto={this.props.savePhoto} />;
      case 'photo-taker':
        return <PhotoTaker photo={this.props.photo} close={this.props.closeModal} />;
      case 'loader':
        return (<div className="initial-load-container">
          <div className="loader">
            <svg  id="Layer_1" x="0px" y="0px" viewBox="0 0 81 45">
              <circle className="circle1" fill="#fe1263" cx="13.5" cy="22.5" r="4.5"/>
              <circle className="circle2" fill="#fe1263" cx="31.5" cy="22.5" r="4.5"/>
              <circle className="circle3" fill="#fe1263" cx="49.5" cy="22.5" r="4.5"/>
              <circle className="circle4" fill="#fe1263" cx="67.5" cy="22.5" r="4.5"/>
            </svg>
          </div>
        </div>);
      default:
        return null;
    }
  }

  render() {
    return (<div className="modal">
      {this.renderModal()}
    </div>);
  }


}

Modal.displayName = 'Modal';

// Uncomment properties you need
Modal.propTypes = {
  modal: React.PropTypes.string.isRequired,
  photo: React.PropTypes.object,
  closeModal: React.PropTypes.func.isRequired,
  savePhoto: React.PropTypes.func,
};
// Modal.defaultProps = {};

export default Modal;
