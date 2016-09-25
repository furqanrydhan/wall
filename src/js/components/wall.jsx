import React from 'react';
import WallList from './wall-list.jsx';
import ChatBackground from './chat-background.jsx';

class Wall extends React.Component {

  constructor() {
    super();
    this.state = {

    };
    this.onPost = this.onPost.bind(this);
    this.onReply = this.onReply.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentWillMount() {
  }

  onPost() {
    this.props.navigate("post", {});
  }

  onReply(quote) {
    console.log("Reply clicked", quote);
    this.props.navigate("post", {quote: quote});
  }

  onDelete(post) {
    console.log("Delete clicked", post);
    this.props.navigate("post-delete", post);
  }

  onEdit(post) {
    console.log("Edit clicked", post);
    this.props.navigate("post", post);
  }

  render() {
    return (
      <div className={ this.props.minimized ? ' chat is-minimized' : 'chat'}>
        <div className="chat-new-post" onTouchStart={this.onPost}>
      <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQyIDQyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MiA0MjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxwYXRoIGQ9Ik0zNy4wNTksMTZIMjZWNC45NDFDMjYsMi4yMjQsMjMuNzE4LDAsMjEsMHMtNSwyLjIyNC01LDQuOTQxVjE2SDQuOTQxQzIuMjI0LDE2LDAsMTguMjgyLDAsMjFzMi4yMjQsNSw0Ljk0MSw1SDE2djExLjA1OSAgQzE2LDM5Ljc3NiwxOC4yODIsNDIsMjEsNDJzNS0yLjIyNCw1LTQuOTQxVjI2aDExLjA1OUMzOS43NzYsMjYsNDIsMjMuNzE4LDQyLDIxUzM5Ljc3NiwxNiwzNy4wNTksMTZ6IiBmaWxsPSIjRkZGRkZGIi8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />
    </div>
    <div className="chat-upper" >
          <WallList 
                    disabledScroll={this.props.minimized}
                    messages={this.props.messages}
                    newMsg={this.props.newMsg}
                    offset={this.props.offset}
                    hasMore={this.props.hasMore}
                    loadMore={this.props.loadMore}
                    like={this.onLike}
                    deletePost={this.onDelete}
                    editPost={this.onEdit}
                    navigate={this.props.navigate}
                    post={this.onPost}
                    me={this.props.me}
                    db={this.props.db} />
          <ChatBackground />
        </div>
      </div>
    );
  }
}

Wall.displayName = 'Wall';

export default Wall;
