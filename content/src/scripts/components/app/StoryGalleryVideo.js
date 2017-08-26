import React, { Component } from 'react';

class StoryGalleryVideo extends Component {  
  
  componentDidMount() {
    if(this.props.autoPlay) {
      var video = document.getElementById(this.props.id);
      if(video.paused) {
        video.play();
      }
    }
  }
  
  render() {
    const styles = {
      video: {
        maxHeight: '100vh',
        margin: 'auto'
      }
    }
    
    return (
      <div>
        <video style={styles.video} loop id={this.props.id} controls src={this.props.src} />
      </div>
    )
  }
}

export default StoryGalleryVideo;