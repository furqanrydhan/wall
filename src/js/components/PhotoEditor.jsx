import React from 'react';
import 'fabric';
import { HueSpectrum } from 'react-color-picker';
import 'react-color-picker/index.css';

const textBoxSettings = {
  default: {
    backgroundColor: 'rgba(33, 35, 38, .66)',
    lockMovementX: true,
    left: 0,
    width: window.innerWidth,
    textAlign: 'center',
    fill: '#ffffff',
    fontFamily: 'Arial',
    hasBorders: false,
    hasControls: false,
    hasRotatingPoint: false,
    fontSize: 24,
    fontWeight: 400,
    cursorColor: '#ffffff',
    editable: false,
    lockRotation: true,
    angle: 0,
    lockScalingFlip: true,
    lockScalingX: true,
    lockScalingY: true,
    selectable: true,
  },
  movable: {
    backgroundColor: 'rgba(33, 35, 38, 0)',
    lockMovementX: false,
    textAlign: 'left',
    fill: '#ffffff',
    fontFamily: 'Arial',
    hasBorders: false,
    hasControls: false,
    hasRotatingPoint: false,
    fontSize: 48,
    fontWeight: 700,
    cursorColor: '#ffffff',
    editable: false,
    lockRotation: false,
    lockScalingFlip: false,
    lockScalingX: false,
    lockScalingY: false,
    selectable: true,
  },
  centered: {
    backgroundColor: 'rgba(33, 35, 38, 0)',
    lockMovementX: false,
    textAlign: 'center',
    fill: '#ffffff',
    fontFamily: 'Arial',
    hasBorders: false,
    hasControls: false,
    hasRotatingPoint: false,
    fontSize: 48,
    fontWeight: 700,
    cursorColor: '#ffffff',
    editable: false,
    lockRotation: false,
    lockScalingFlip: false,
    lockScalingX: false,
    lockScalingY: false,
    selectable: true,
  },
};

class PhotoEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      textInput: '',
      isEditing: false,
      drawingMode: false,
      paths: [],
      drawColor: 'rgb(254,18,99)',
    };
    this.toggleText = this.toggleText.bind(this);
    this.toggleDraw = this.toggleDraw.bind(this);
    this.saveImage = this.saveImage.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.startEditing = this.startEditing.bind(this);
    this.stopEditing = this.stopEditing.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.undoDraw = this.undoDraw.bind(this);
    this.handleColorDrag = this.handleColorDrag.bind(this);
  }

  componentWillMount() {
    // eslint-disable-next-line
    Bebo.hangup();
  }

  componentDidMount() {
    this.refs.singleLineText.addEventListener('blur', () => {
      this.stopEditing();
    });
    // eslint-disable-next-line
    this.canvas = new fabric.Canvas('c', {
      height: window.innerHeight,
      width: window.innerWidth,
    });
    // eslint-disable-next-line
    fabric.Object.prototype.selectable = false;
    debugger;
    this.canvas.setBackgroundImage(this.props.photo.base64, this.canvas.renderAll.bind(this.canvas), {
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0,
      width: this.canvas.width,
      height: window.innerHeight,
      crossOrigin: 'Anonymous',
    });
    this.canvas.on('path:created', (cb) => {
      const { paths } = this.state;
      const { path } = cb;
      if(this.textBox) {
        this.canvas.bringToFront(this.textBox);
      }
      paths.push(path);
      this.setState({ paths });
      console.log('path:created', path, paths);
    });
    // eslint-disable-next-line
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
  }

  componentWillUnmount() {
    this.refs.singleLineText.removeEventListener('blur', () => {
      this.stopEditing();
    });
  }

  saveImage() {
    let pixelRatio = 1;
    let multiplier = 1;
    if (window.devicePixelRatio) {
      pixelRatio = window.devicePixelRatio;
    }
    if(pixelRatio > 2) {
      multiplier = 0.8;
    }
    const base64String = this.canvas.toDataURL({
      multiplier,
      format: 'jpeg',
      quality: 0.97,
    });
    this.props.savePhoto(base64String);
  }

  handleTextChange(e) {
    if (this.textBox) {
      this.setState({ textInput: e.target.value }, () => {
        this.textBox.set({text: this.state.textInput });
        this.canvas.renderAll();
      });
    }
  }
  handleKeyDown(e) {
    if (e.keyCode === 13){
      this.stopEditing();
    }
  }
  startEditing() {
    if (!this.state.isEditing) {
      this.setState({ isEditing: true }, () => {
        this.refs.singleLineText.focus();
      });
    }
  }
  stopEditing() {
    if (this.state.isEditing) {
      this.setState({ isEditing: false }, () => {
        this.refs.singleLineText.blur();
      });
    }
  }

  toggleText() {
    if (!this.textBox) {
      // eslint-disable-next-line
      this.textBox = new fabric.Textbox('', Object.assign({}, textBoxSettings.default, {top: 50})).on({
        mousedown: (e) => {
          this.tapTimer = Date.now();
          e.e.preventDefault();
          e.e.stopPropagation();
        },
        mouseup: (e) => {
          e.e.preventDefault();
          e.e.stopPropagation();
          if (this.tapTimer && ((Date.now() - this.tapTimer) < 200)) {
            this.startEditing();
          }
        },
      });
      this.setState({ textLayout: 1 });
      this.canvas.add(this.textBox);
      this.startEditing();
    } else {
      if (this.state.textLayout === 1) {
        this.textBox.set(textBoxSettings.movable);
        this.canvas.renderAll();
        this.setState({ textLayout: 2 });
      }
      if (this.state.textLayout === 2) {
        this.textBox.set(textBoxSettings.centered);
        this.canvas.renderAll();
        this.setState({ textLayout: 3 });
      }
      if(this.state.textLayout === 3) {
        this.textBox.set(textBoxSettings.default);
        this.canvas.renderAll();
        this.setState({ textLayout: 1 });
      }
    }
  }

  toggleDraw() {
    const c = this.canvas;
    if(!c) {
      return false;
    }
    if(c.freeDrawingBrush) {
      // eslint-disable-next-line
      c.freeDrawingBrush.color = 'rgb(254,18,99)';
      c.freeDrawingBrush.width = 7;
      console.log('brush', c.freeDrawingBrush, c);
    }
    c.isDrawingMode = !c.isDrawingMode;
    this.setState({ drawingMode: c.isDrawingMode }, () => {
      if(this.textBox) {
        c.bringToFront(this.textBox);
      }
    });
  }

  undoDraw() {
    const { paths } = this.state;
    if(!paths || !paths.length || !this.canvas){return}
    const popped = paths.pop();
    this.setState({paths});
    this.canvas.remove(popped);
  }

  handleColorDrag(color) {
    if(color === '#000000'){return;}
    console.log(color);
    this.setState({drawColor: color}, () => {
      if(this.canvas && this.canvas.freeDrawingBrush) {
        this.canvas.freeDrawingBrush.color = color;
      }
    })
  }

  calculateAddTextStyles() {
    const { drawingMode, isEditing } = this.state;
    if(drawingMode){
      return {opacity: 0, transform: 'translateY(-45px)'}
    }
    if(isEditing) {
      return {transform: 'translateX(45px)'}
    }
    return { opacity: 1 };
  }

  calculateAddDrawStyles() {
    const { drawingMode, isEditing } = this.state;
    if(drawingMode){
      return {opacity: 1}
    }
    if(isEditing) {
      return {transform: 'translateX(45px)', opacity: 0}
    }
    return { opacity: 1 };
  }
  calculateUndoDrawStyles() {
    const { drawingMode, paths } = this.state;
    if(!paths.length) {
      return { opacity: 0, transform: 'translateY(-45px)' }
    }
    if(drawingMode){
      return {opacity: 1}
    }
    return {transform: 'translateX(-45px)', opacity: 0}
  }
  calculateCloseStyles() {
    const { drawingMode, isEditing } = this.state;
    if(drawingMode || isEditing) {
      return {opacity: 0, transform: 'translateY(-45px)'}
    }
    return { opacity: 1 };
  }

  calculateColorContainerStyles() {
    const { drawingMode } = this.state;
    if(drawingMode) {
      return { opacity: 1}
    }
    return {transform: 'translateX(-45px)', opacity: 0}
  }


  render() {
    return (<div className="editor">
      <div className="drop-shadow" />
      <div className="cropperContainer">
        <div className="close-button" onClick={this.props.closeEditor} style={this.calculateCloseStyles()}>
          <svg x="0px" y="0px" viewBox="0 0 212.982 212.982" width="512px" height="512px">
            <g id="Close">
              <path d="M131.804,106.491l75.936-75.936c6.99-6.99,6.99-18.323,0-25.312   c-6.99-6.99-18.322-6.99-25.312,0l-75.937,75.937L30.554,5.242c-6.99-6.99-18.322-6.99-25.312,0c-6.989,6.99-6.989,18.323,0,25.312   l75.937,75.936L5.242,182.427c-6.989,6.99-6.989,18.323,0,25.312c6.99,6.99,18.322,6.99,25.312,0l75.937-75.937l75.937,75.937   c6.989,6.99,18.322,6.99,25.312,0c6.99-6.99,6.99-18.322,0-25.312L131.804,106.491z" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
        <div className="undoDraw" onClick={this.undoDraw} style={this.calculateUndoDrawStyles()}>
          <svg fill="#FFFFFF" height="48" viewBox="0 0 24 24" width="48">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
          </svg>
        </div>
        <div className="addText" onClick={this.toggleText} style={this.calculateAddTextStyles()}>
          <svg fill="#FFFFFF" height="48" viewBox="0 0 24 24" width="48">
            <path d="M5 4v3h5.5v12h3V7H19V4z"/>
            <path d="M0 0h24v24H0V0z" fill="none"/>
          </svg>
        </div>
        <div className="addDraw" onClick={this.toggleDraw} style={this.calculateAddDrawStyles()}>
          <svg fill={this.state.drawingMode ?  this.state.drawColor : '#fff'} height="48" viewBox="0 0 24 24" width="48">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
        </div>
        <div className="color-container" style={this.calculateColorContainerStyles()}>
          <div className="color-container--inner">
            <HueSpectrum value={this.state.drawColor} defaultColor="rgb(254,18,99)" width={10} height={150} onChange={this.handleColorDrag} onDrag={this.handleColorDrag} />
          </div>
        </div>
        <canvas id="c" />
      </div>
      <div className="actionContainer">
        <button className="saveImage" onClick={this.saveImage} />
      </div>
      <div className="hiddenCanvasRefs">
        <input style={{ opacity: 0, zIndex: '-1', position: 'absolute', top: '-100vh' }} type="text" ref="singleLineText" value={this.state.textInput} onKeyDown={this.handleKeyDown} onChange={this.handleTextChange} />
      </div>
    </div>);
  }
}

PhotoEditor.displayName = 'PhotoEditor';

// Uncomment properties you need
PhotoEditor.propTypes = {
  photo: React.PropTypes.object.isRequired,
  closeEditor: React.PropTypes.func.isRequired,
  savePhoto: React.PropTypes.func.isRequired,
};
// PhotoEditor.defaultProps = {};

export default PhotoEditor;
