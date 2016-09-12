import React from 'react';

class PhotoViewer extends React.Component {
  constructor() {
    super();
    this.home = this.home.bind(this);
  }

  home() {
    this.props.navigate("home", null);
	}

  componentWillMount() {
  }

  render() {
    var bg = {backgroundImage: "url(" + this.props.context.mediaUrl + "?w=2048&h=2048)" };
    return (
      <div className="photo-viewer">
        <div className="sub-header">
          <div onClick={this.home} className="sub-back-button"></div>
          <div className="sub-name"></div>
          <div className="sub-action"></div>
        </div>
        <div className="photo-viewer--main" style={bg}>
        </div>
      </div>
    )
  }
}

PhotoViewer.displayName = "PhotoViewer";
export default PhotoViewer;
