import React from 'react';
import DropZone from 'react-dropzone';
import LoadImage from 'blueimp-load-image';
import uuid from 'node-uuid';

/*
 * value: list of media
 *
 * medium: key:
 *         url:
 *         state: "done"
 *         mimeType: "image/jpeg", ..
 *
 */

// .bebo-upload svg {
//     margin: auto;
//     height: 90%;
//     width: 90%;
// }
//
import styles from './uploaderStyles.css';
console.log(styles);
const cameraSvg = <svg className={styles['bebo-uploader-overlay']} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M64 96h64v64H64V96zM96 192c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32S113.7 192 96 192zM448 304c0 61.8-50.2 112-112 112s-112-50.2-112-112 50.2-112 112-112S448 242.2 448 304zM416 304c0-44.1-35.9-80-80-80s-80 35.9-80 80 35.9 80 80 80S416 348.1 416 304zM512 96v352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96c0-35.3 28.7-64 64-64V0h64v32h320C483.3 32 512 60.7 512 96zM160 480V64H64c-17.6 0-32 14.4-32 32v352c0 17.7 14.4 32 32 32H160zM480 96c0-17.6-14.3-32-32-32H192v416h256c17.7 0 32-14.3 32-32V96zM416 96h-32c-17.7 0-32 14.3-32 32s14.3 32 32 32h32c17.7 0 32-14.3 32-32S433.7 96 416 96z"/></svg>;


class Upload extends React.Component {

  constructor(params) {
    super(params);
    this.state = {
      uploadState: "showButton",
      media: [],
    }
    this.onClick = this.onClick.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.newImage = this.newImage.bind(this);
  }

  componentWillMount() {
    if (this.props.value) {
      for(var i=0; i< this.props.value.length; i++) {
        if (!this.props.value[i].key) {
          this.props.value[i].key = uuid.v4();
        }
      }
      this.setState({media: this.props.value});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value) {
      for(var i=0; i< nextProps.value.length; i++) {
        if (!nextProps.value[i].key) {
          nextProps.value[i].key = uuid.v4();
        }
      }
      this.setState({media: nextProps.value});
    }
  }

  isAllDone(media) {
    var test = function (m) { return m.state !== undefined && m.state !== "done" };
    return _.findIndex(media, test) === -1
  }

  newImage(image) {
    var media = this.state.media;
    if (this.isAllDone(media)) {
      if (this.props.onBusy) {
        this.props.onBusy();
      }
    }
    media.push(image);
    this.setState({media: media});
    this.uploadImage(image);
  }

  uploadImage(image) {
    var that = this;
    return Bebo.uploadImage(image.raw)
      .then(function(image_url) {
        image.state = "done";
        image.url = image_url;
        delete image.raw;
        var media = that.state.media;
        var idx = _.findIndex(that.state.media, {key: image.key});
        if (idx === -1) {
          console.log("Lost image", image, media);
          return;
        }
        media[idx] = image;
        if (that.isAllDone(media)) {
          if(that.props.onChange) {
            that.props.onChange(media);
          }
        }
        that.setState({media: media});
      });
  }

  onDrop(files) {
    var that = this;

    files.forEach(function(file) {
      LoadImage.parseMetaData(file, (data) => {
        let orientation = 0;
        if (data.exif) {
          orientation = data.exif.get('Orientation');
        }
        LoadImage(
          file,
          (canvas) => {
            const base64data = canvas.toDataURL('image/jpeg');
            var mimeType = base64data.split(':')[1].split(';')[0];
            that.newImage({raw: base64data,
                           key: uuid.v4(),
                           mimeType: mimeType,
                           state: "uploading"});
          }, {
            orientation,
            canvas: true,
            aspectRatio: window.innerWidth / window.innerHeight,
            maxWidth: 500,
            cover: true,
          }
        );
      });
    });
  }

  renderButton() {
    // // var style = { backgroundImage: 'url(' + this.props.me.image_url + ')'};
    // // var uploadImage = cameraSvg;
    
    //   // var cameraStyle = { backgroundImage: 'url(' + "assets/img/icCamera.png" + ')'};

    // var className = styles.beboUploader + (this.props.className && " " + this.props.className || "");
    // return <div className={className}>
    //         {cameraSvg}
    //        </div>;
  }

  onClick(e) {
    if (this.state.uploadState === "showButton") {
      this.refs.dropZone.open();
    }
  }

  addImage() {
    // TODO state protection?
    this.refs.dropZone.open();
  }

  renderMedium(m) {
    var itemClassName = (this.props.itemClassName && " " + this.props.itemClassName || "");
    // return <div height='20px' width='20px' key={i.key} className={"photo " + i.state}
    //            style={{backgroundImage: "url(" + (i.url || i.base64) + ")"}}></div>)}
    console.log("M", m);
    var style = {backgroundImage: 'url(' + (m.url || m.raw) + ')'};
    return (
      <div className={itemClassName} style={style}>
      </div>
    )
  }

        // {this.props.context.media.map((i) =>
    // {this.props.context.media.map((i) =>
        //   <div height='20px' width='20px' key={i.key} className={"photo " + i.state}
        //        style={{backgroundImage: "url(" + (i.url || i.base64) + ")"}}></div>)}

  render() {
    var className = styles["bebo-uploader"] + (this.props.className && " " + this.props.className || "");
    var itemClassName = (this.props.itemClassName && " " + this.props.itemClassName || "");
    var dropZone = <DropZone multiple={this.props.multiple || false}
                             inputProps={{ capture: 'camera' }}
                             onDrop={this.onDrop}
                             ref="dropZone"
                             style={{ display: 'none' }}
                             accept="image/*" />;

    var uploadImage, button;
    if (this.state.uploadState === "uploading") {
      var style = {backgroundImage: 'url(' + this.state.raw + ')'};
      uploadImage = (
        <div className={styles["bebo-uploader-image--uploading"] + itemClassName} style={style}>
          <div className={styles["bebo-uploader--spinner"]} />
        </div>
      )
    } else if (this.state.uploadState === "showButton") {
      // button = cameraSvg;
    }

    return (
      <div className={className} onClick={this.onClick}>
        {this.state.media.map((i) => this.renderMedium(i))}
        {dropZone}
        {button}
      </div>
    )
    // return this.renderButton();
      // var style = { backgroundImage: 'url(' + this.props.me.image_url + ')'};
      // var cameraStyle = { backgroundImage: 'url(' + "assets/img/icCamera.png" + ')'};
      // var className = "bebo-upload" + (this.props.className && " " + this.props.className || "");
    // return 
      // image = (
      //   <div className={className}>
      //     <div className="image" style={style} />
      //     <input id="file" type="file" onChange={this.fileUpload} accept="image/*" />
      //     <div className="fileOverlay" style={cameraStyle} />
      //   </div>)
  }
}

Upload.displayName = 'Uploader';

export default Upload;
