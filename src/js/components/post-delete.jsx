import React from 'react';
import WallItem from './chat-item.jsx';

class PostDelete extends React.Component {
  constructor() {
    super();
    this.home = this.home.bind(this);
    this.doDelete = this.doDelete.bind(this);
  }

  home() {
    this.props.navigate("home", null);
	}

  doDelete() {
    this.props.doDelete(this.props.context);
  }

  componentWillMount() {
  }




  renderActions(){

  }

  render() {
    return <div className='modal modal-dialog'>
    <div className='dialog'> 
      <span className='dialog--haeder'>{this.props.title}</span>
      <span className='dialog--body'>{this.props.body}</span>
      <span className='dialog--actions'>
        <button className='dialog--actions-btn' onClick={this.dbDelete}>{this.props.actionLabel1}</button>
        <button className='dialog--actions-btn' onClick={this.dbDelete}>{this.props.actionLabel2}</button>
      </span>
    </div>
    <div className='modal-overlay'></div>
    </div>
  }
}

PostDelete.displayName = "PostDelete";
export default PostDelete;
