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

  render() {
    return (
      <div className="post-delete modal">
        <div className="sub-header">
          <div onClick={this.home} className="sub-back-button">Delete Post</div>
          <div className="sub-name"></div>
          <div className="sub-action"></div>
        </div>
        <div className="post-delete--post">
        <WallItem me={this.props.me}
          type="quote"
          db={this.props.db}
          item={this.props.context}/>
        </div>
        <div className="post-delete--main">
          <h1>Do you want to delete this post?</h1>
          <div className="post-delete--confirm">
            <button onClick={this.home} className="">Cancel</button>
            <button onClick={this.doDelete} className="">Delete</button>
          </div>
        </div>
      </div>
    )
  }
}

PostDelete.displayName = "PostDelete";
export default PostDelete;
