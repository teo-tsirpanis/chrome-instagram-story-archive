import React, { Component } from 'react';
import Lightbox from 'lightbox-react';
import {getLiveVideoManifestObject, getTimeElapsed} from '../../../../../utils/Utils';
import { MediaPlayer } from 'dashjs';

class StoryGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isOpen: false,
      isZoomEnabled: true,
      currentIndex: 0
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if(nextProps.isOpen) {
      this.setInitialZoom(nextProps.currentItem);
    }
  }
  
  // calculate if zoom should be enabled by default based on the first gallery item
  setInitialZoom(storyItems) {
    var isZoomEnabled = true;
    // live videos and live video replays should not have zoom enabled
    if(storyItems.dash_abr_playback_url) {
      isZoomEnabled = false;  
    } else if(storyItems.broadcasts) {
      isZoomEnabled = false;
    } else {
      var firstStoryItem = (storyItems.reel) ? storyItems.reel.items[0] : storyItems.items[0];
      // if the first story item is a video, disable zoom
      if(firstStoryItem.video_versions) {
        isZoomEnabled = false;
      }
    }
    this.setState({isZoomEnabled: isZoomEnabled});
  }
  
  handleStoryGalleryChange(index) {
    var currentStoryItem = this.getCurrentStoryGalleryItemObject();
    if(this.props.type === 'userStory') {
      var nextStoryItem = (this.props.currentItem.reel) ? this.props.currentItem.reel.items[index] : this.props.currentItem.items[index];
      if(currentStoryItem.video_versions) {
        var video = document.getElementById(currentStoryItem.id);
        if(!video.paused) {
          // pause the current video
          video.pause();
        }
      }
      if(nextStoryItem.video_versions) {
        var video = document.getElementById(nextStoryItem.id);
        if(video.paused) {
          // play the next video
          video.play();
        }
        this.setState({isZoomEnabled: false});
      } else {
        this.setState({isZoomEnabled: true});
      }
    } else if (this.props.type === 'liveReplay') {
      var nextStoryItem = this.props.currentItem.broadcasts[index];
      let player = MediaPlayer().create();
      player.initialize(document.querySelector('#liveVideoPlayer-' + nextStoryItem.id));
      // a post-live video object contains a string representation of the manifest that needs to be parsed
      var manifestObject = getLiveVideoManifestObject(nextStoryItem.dash_manifest);
      player.attachSource(manifestObject);
      player.getDebug().setLogToBrowserConsole(false);
      player.play();
    }
  }
  
  moveStoryGalleryNext = () => {
    const nextIndex = (this.state.currentIndex + 1) % this.props.items.length;
    this.handleStoryGalleryChange(nextIndex);
    this.setState({
      currentIndex: nextIndex
    });
  }
  
  moveStoryGalleryPrev = () => {
    const prevIndex = (this.state.currentIndex + this.props.items.length - 1) % this.props.items.length;
    this.handleStoryGalleryChange(prevIndex);
    this.setState({
      currentIndex: prevIndex
    });
  }
  
  getCurrentStoryGalleryItemObject() {
    switch(this.props.type) {
      case 'userStory':
      return (this.props.currentItem.reel) ? this.props.currentItem.reel.items[this.state.currentIndex] : this.props.currentItem.items[this.state.currentIndex];
      case 'liveReplay':
      return this.props.currentItem.broadcasts[this.state.currentIndex];
      case 'live':
      return this.props.currentItem;
    }
  }
  
  getCurrentStoryGalleryUser() {
    var currentStoryGalleryItemObject = this.getCurrentStoryGalleryItemObject();
    if(currentStoryGalleryItemObject.user) {
      return currentStoryGalleryItemObject.user;
    } else if(currentStoryGalleryItemObject.owner) {
      return currentStoryGalleryItemObject.owner;
    } else if (currentStoryGalleryItemObject.broadcast_owner) {
      return currentStoryGalleryItemObject.broadcast_owner;
    }
    return null;
  }
  
  render() {
    if(!this.props.isOpen) {
      return(<div></div>);
    }
    
    const {currentIndex} = this.state;
    const {items} = this.props;
    var imageTitle;
    
    if(this.props.type === 'live') {
      imageTitle = (
        <span>
          <img src={chrome.extension.getURL('img/icon_live.png')} style={{height: '20px'}} className="center-vertical"/>
          <img src={this.getCurrentStoryGalleryUser()['profile_pic_url']} className="storyAuthorImage center-vertical"/>
          <span className="storyAuthorUsername center-vertical">
            {(this.getCurrentStoryGalleryUser().username) ? this.getCurrentStoryGalleryUser().username : this.getCurrentStoryGalleryUser().name} - {this.getCurrentStoryGalleryItemObject().viewer_count + " viewers"}
          </span>
        </span>
      );
    } else if (this.props.type === 'liveReplay') {
      imageTitle = (
        <span>
          {(currentIndex + 1) + '/' + items.length}
          <img src={this.getCurrentStoryGalleryUser()['profile_pic_url']} className="storyAuthorImage center-vertical"/>
          <span className="storyAuthorUsername center-vertical">
            {(this.getCurrentStoryGalleryUser().username) ? this.getCurrentStoryGalleryUser().username : this.getCurrentStoryGalleryUser().name} - {getTimeElapsed(this.getCurrentStoryGalleryItemObject()['published_time'])}
          </span>
        </span>
      );
    } else if (this.props.type === 'userStory') {
      imageTitle = (
        <span>
          {(currentIndex + 1) + '/' + items.length}
          <img src={this.getCurrentStoryGalleryUser()['profile_pic_url']} className="storyAuthorImage center-vertical"/>
          <span className="storyAuthorUsername center-vertical">
            {(this.getCurrentStoryGalleryUser().username) ? this.getCurrentStoryGalleryUser().username : this.getCurrentStoryGalleryUser().name} - {getTimeElapsed(this.getCurrentStoryGalleryItemObject()['taken_at'])}
          </span>
        </span>
      );
    }
    
    return (
      <Lightbox
        mainSrc={items[currentIndex]}
        nextSrc={(items.length > 1) ? items[(currentIndex + 1) % items.length] : undefined}
        prevSrc={(items.length > 1) ? items[(currentIndex + items.length - 1) % items.length] : undefined}
        imageTitle={imageTitle}
        onCloseRequest={() => {
          this.setState({currentIndex: 0});
          this.props.onCloseRequest();
        }}
        onMoveNextRequest={this.moveStoryGalleryNext}
        onMovePrevRequest={this.moveStoryGalleryPrev}
        enableZoom={this.state.isZoomEnabled}
        />
    )
  }
}

export default StoryGallery;