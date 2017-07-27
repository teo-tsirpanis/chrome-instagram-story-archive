import React, { Component } from 'react';
import StoryGallery from 'react-image-gallery';
import SingleProgressBar from './SingleProgressBar';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import VisibilityIcon from 'material-ui/svg-icons/action/visibility';
import { isVideo } from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

import {
  TAB_TEXT_COLOR_LIGHT_GRAY
} from '../../../../../utils/Constants';

class Story extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStoryViewersListActive: false,
      isDownloadingStory: false,
      isVideoPlaying: 0,
      storyLength: 0,
      progressBarsArray: [],
      currentlyPlaying: '',
      currentStoryItem: this.props.item.story.items[0],
      currentIndex: -1,
    };
    this._eventHandlers = {};
  }
  
  componentDidMount = () => {
    this.setState({storyLength: this.props.item.media.length});
    this.initProgressBars();
    setTimeout(function() {
      this.playStory(0);
    }.bind(this), 1);
  }
  
  componentWillUnmount() {
    clearInterval(this.state.isVideoPlaying);
  }
  
  initProgressBars = (shouldPlayStory) => {
    const createProgressBars = this.props.item.media.map((singleStory, key) => {
      let progressLength;
      if (isVideo(singleStory.original)) {
        progressLength = singleStory.videoDuration * 10
      } else {
        progressLength = 30
      }
      return {
        id: key,
        parent: singleStory.original,
        progressLength: progressLength
      }
    }
  );
  
  this.setState({progressBarsArray: createProgressBars});
  
  if(this.props.autoPlay || shouldPlayStory) {
    setTimeout(function() {
      this.playStory();
    }.bind(this), 1);
  }
}

resetProgressBars() {
  this.setState({progressBarsArray: []});
  var itself =this;
  setTimeout(function() {
    itself.initProgressBars(true);
  }, 1);
}

onStoryFinished(index) {
  this.resetProgressBars();
}

onSlide(currentIndex) {
  if(this.state.currentIndex >= 0) {
    var previousMedia = this.props.item.media[this.state.currentIndex];
    if(isVideo(previousMedia.original)) {
      var video = document.getElementById(previousMedia.id);
      if(!video.paused) {
        video.pause();
      }
    }
  }
  this.playStory(currentIndex);
}

isVideoPlaying = () => {
  clearInterval(this.state.isVideoPlaying);
  
  if(this._imageGallery !== null) {
    var itself = this;
    const checkVideoInterval = setInterval(() => {
      if(itself._imageGallery === null) {
        clearInterval(checkVideoInterval)
      }
      
      const currentMedia = itself.props.item.media[itself._imageGallery.getCurrentIndex()];
      const video = document.getElementById(currentMedia.id);
      
      if (video && !video.paused) {
        itself.setState({currentlyPlaying: currentMedia.original});
      } else {
        itself.setState({currentlyPlaying: {}});
      }
    }, 100);
    
    itself.setState({isVideoPlaying: checkVideoInterval})
  }
}

clearIsVideoPlaying = () => {
  clearInterval(this.state.isVideoPlaying);
  this.setState({isVideoPlaying: {}});
}

onStoryItemEnded() {
  if(this._imageGallery != null) {
    if(this.props.onStoryItemEnded) {
      var currentMedia = this.props.item.media[this._imageGallery.getCurrentIndex()];
      this.props.onStoryItemEnded(currentMedia);
    }
    
    this._imageGallery.slideToIndex(this._imageGallery.getCurrentIndex() + 1);
    if(this.props.item.media.length == 1) {
      this.onStoryFinished(this.props.index);
    }
  }
}

addEvent(node, event, handler, capture) {
  if (!(node in this._eventHandlers)) {
    // _eventHandlers stores references to nodes
    this._eventHandlers[node] = {};
  }
  if (!(event in this._eventHandlers[node])) {
    // each entry contains another entry for each event type
    this._eventHandlers[node][event] = [];
  }
  // capture reference
  this._eventHandlers[node][event].push([handler, capture]);
  node.addEventListener(event, handler, capture);
}

removeAllEvents(node, event) {
  if (node in this._eventHandlers) {
    var handlers = this._eventHandlers[node];
    if (event in handlers) {
      var eventHandlers = handlers[event];
      for (var i = eventHandlers.length; i--;) {
        var handler = eventHandlers[i];
        node.removeEventListener(event, handler[0], handler[1]);
      }
    }
  }
}

playStory(currentIndex) {
  this.setState({
    currentStoryItem: this.props.item.story.items[this._imageGallery.getCurrentIndex()],
    currentIndex: currentIndex
  });
  
  var currentMedia = this.props.item.media[this._imageGallery.getCurrentIndex()];
  this.setState({currentlyPlaying: currentMedia.original});
  
  if(isVideo(currentMedia.original)) {
    var video = document.getElementById(currentMedia.id);
    if(video.paused) {
      video.play();
    }
  }
}

pauseStory() {
  var itself = this;
  var currentMedia = this.props.item.media[this._imageGallery.getCurrentIndex()];
  this.setState({currentlyPlaying: ''});
  if(isVideo(currentMedia.original)) {
    // If video check is active, clear it
    clearInterval(this.state.isVideoPlaying);
    var video = document.getElementById(currentMedia.id);
    this.removeAllEvents(video, 'ended');
    if(!video.paused) {
      video.pause();
    }
  } else {
    clearTimeout(this.state.imageTimeout);
  }
}

toggleStoryViewersList() {
  this.setState({isStoryViewersListActive: !this.state.isStoryViewersListActive});
}

onCloseFullscreenStoryButtonClicked() {
  if(this.props.onCloseFullscreenStory) {
    this.props.onCloseFullscreenStory();
  }
}

onStoryAuthorUsernameClicked() {
  var authorUsername = this.props.item.story.user.username;
  window.open('https://www.instagram.com/' + authorUsername + '/');
  AnalyticsUtil.track("Story Author Username Clicked", {username: authorUsername});
}

onStoryViewerUsernameClicked(index) {
  var storyViewerUsername = this.state.currentStoryItem.viewers[index].username;
  window.open('https://www.instagram.com/' +  + '/');
  AnalyticsUtil.track("Story Viewer Username Clicked", {username: storyViewerUsername});
}

onDownloadStory() {
  this.setState({isDownloadingStory: true});
  downloadStory(this.props.item.story, function() {
    this.setState({isDownloadingStory: false});
  }.bind(this));
}

onMouseEnter() {
  if(!this.props.autoPlay) {
    this.playStory();
  }
}

onMouseLeave() {
  if(!this.props.autoPlay) {
    this.pauseStory();
  }
}

render() {
  const styles = {
    storyImage: {
      height: 'auto',
      maxWidth: '100%',
      width: 'auto',
      position: 'relative'
    },
    overlayTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%'
    },
    StoryProgressBars: {
      display: 'flex',
      flex: 1
    },
    spb: {
      position: 'absolute',
      width: '100%',
      top: '5px',
      padding: '0 6px'
    },
    storyAuthorImage: {
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      float: 'left'
    },
    storyAuthorUsername: {
      color: 'white',
      marginLeft: '35px',
      marginTop: '5px'
    },
    storyAuthorAttribution: {
      zIndex: 4,
      position: 'absolute',
      width: '100%',
      textAlign: 'left'
    },
    overlayTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 4,
    },
    closeFullscreenStoryButton: {
      float: 'right',
      color: 'white',
      fontSize: '40px',
      marginRight: '15px',
      fontFamily: 'Roboto-Light',
      padding: '10px',
      marginTop: '-15px',
    },
    storyViewersList: {
      width: '100%',
      height: '90%',
      position: 'absolute',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 4,
      overflowY: 'auto'
    },
    storyViewerStyle: {
      fontSize: '15px',
      color: 'white'
    },
  }
  
  const media = this.props.item.media;
  const allPossibleProgressBars = this.state.progressBarsArray.map((pb, key) => {
    return (
      <SingleProgressBar
        key={key}
        id={pb.id}
        parent={pb.parent}
        intervalTime={pb.progressLength}
        currentlyPlaying={this.state.currentlyPlaying}
        />
    )
  });
  
  var storyViewersListData = [];
  if(this.state.currentStoryItem.viewers) {
    storyViewersListData = this.state.currentStoryItem.viewers.map((storyViewer, key) => {
      return (
        <ListItem
          key={key}
          disabled={true}
          style={styles.storyViewerStyle}
          leftAvatar={<Avatar src={storyViewer.profile_pic_url} style={{cursor: 'pointer'}} size={32} onClick={() => this.onStoryViewerUsernameClicked(key)} />}
          primaryText={<div style={{color: 'white', marginLeft: '-15px', marginTop: '-5px'}}>{storyViewer.username}</div>}
          secondaryText={<span style={{color: TAB_TEXT_COLOR_LIGHT_GRAY, marginLeft: '-15px', fontSize: '10px'}}>{storyViewer.full_name}</span>}
          />
      )
    });
  }
  
  return (
    <div ref="SingleStory" className="SingleStory">
      
      <div
        className="storyImage"
        style={styles.storyImage}
        onMouseEnter={() => this.onMouseEnter()}
        onMouseLeave={() => this.onMouseLeave()}>
        
        <div className="overlayTop" style={styles.overlayTop}>
          <img src="/img/overlayTop.png" style={{width: '100%'}} alt=""/>
        </div>
        
        <div className="spb" style={styles.spb}>
          <div className="StoryProgressBars" style={styles.StoryProgressBars}>
            {allPossibleProgressBars}
          </div>
        </div>
        
        <div className="storyAuthorAttribution" style={styles.storyAuthorAttribution}>
          <img src={this.state.currentStoryItem.user.profile_pic_url} style={styles.storyAuthorImage} onClick={() => this.onStoryAuthorUsernameClicked()} />
          <p style={styles.storyAuthorUsername} onClick={() => this.onStoryAuthorUsernameClicked()}>{this.state.currentStoryItem.user.username}</p>
          {(this.props.isFullscreen) ? <span style={styles.closeFullscreenStoryButton} onClick={() => this.onCloseFullscreenStoryButtonClicked()}>X</span> : ''}
        </div>
        
        {this.state.currentStoryItem.viewers &&
          <FlatButton
            style={{position: 'absolute', bottom: '0px', width: '100%', zIndex: 4, color: 'white'}}
            label={this.state.currentStoryItem.viewers.length}
            icon={<VisibilityIcon color={"#ffffff"}/>}
            onClick={() => this.toggleStoryViewersList()}/>
        }
        
        {this.state.isStoryViewersListActive &&
          <List style={styles.storyViewersList}>
            {storyViewersListData}
          </List>
        }
        
        <StoryGallery
          ref={i => this._imageGallery = i}
          items={media}
          showThumbnails={false}
          autoPlay={false}
          showNav={true}
          showPlayButton={false}
          showFullscreenButton={false}
          showBullets={false}
          showIndex={false}
          onSlide={(currentIndex) => this.onSlide(currentIndex)}
          />
      </div>
    </div>
  )
}
}

export default Story;
