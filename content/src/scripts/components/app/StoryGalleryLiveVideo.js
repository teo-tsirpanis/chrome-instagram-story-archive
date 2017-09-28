import React, { Component } from 'react';
import { MediaPlayer } from 'dashjs';
import {getLiveVideoManifestObject} from '../../../../../utils/Utils';

class StoryGalleryLiveVideo extends Component {
  
  componentDidMount() {
    if(this.props.autoPlay) {
      this.playLiveVideo();
    }
  }
  
  playLiveVideo() {
    let player = MediaPlayer().create();
    if(this.props.isLiveVideoReplay) {
      player.initialize(document.querySelector('#liveVideoPlayer-' + this.props.liveItem.id));
      // a post-live video object contains a string representation of the manifest that needs to be parsed
      var manifestObject = getLiveVideoManifestObject(this.props.liveItem.dash_manifest);
      player.attachSource(manifestObject);
    } else {
      player.initialize(document.querySelector('#liveVideoPlayer-' + this.props.liveItem.id), this.props.liveItem.dash_playback_url, true);
    }
    
    player.getDebug().setLogToBrowserConsole(false);
    player.play();
  }
  
  render() {
    const styles = {
      liveVideoContainer: {
        height: '100%'
      },
      liveVideo: {
        height: '100%'
      }
    }
    
    return (
      <div style={styles.liveVideoContainer}>
        <video id={"liveVideoPlayer-" + this.props.liveItem.id} style={styles.liveVideo} poster={this.props.liveItem.cover_frame_url} src={(this.props.isLiveVideoReplay) ? '' : this.props.liveItem.dash_playback_url}/>}
        </div>
      )
    }
  }
  
  export default StoryGalleryLiveVideo;