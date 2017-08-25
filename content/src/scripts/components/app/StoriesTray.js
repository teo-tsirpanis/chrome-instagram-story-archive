import React, { Component } from 'react';
import {connect} from 'react-redux';
import StoryTrayItem from './StoryTrayItem';
import LiveVideoTrayItem from './LiveVideoTrayItem';
import LiveVideoReplayTrayItem from './LiveVideoReplayTrayItem';
import StoryGallery from './StoryGallery';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStoryGalleryItems} from '../../utils/ContentUtils';

class StoriesTray extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storyTrayItems: '',
      isStoryGalleryOpen: false,
      currentStoryGalleryItem: null,
      storyGalleryItems: [],
      currentStoryGalleryType: null
    }
  }
  
  getStoryItems() {
    switch(this.props.type) {
      case 'friends':
      return this.props.friendStories;
      case 'explore':
      return this.props.exploreStories;
    }
  }
  
  componentDidMount() {
    this.generateStoriesTray();
  }
  
  generateStoriesTray() {
    var storyTrayItems = [];
    var liveVideoReplays = [];
    var storyItems = this.getStoryItems();
    if(storyItems.post_live) {
      liveVideoReplays = storyItems.post_live.post_live_items.map((liveVideoReplay, key) => {
        return (
          <LiveVideoReplayTrayItem
            key={key}
            trayItemIndex={key}
            liveItem={liveVideoReplay}
            onViewLiveVideoReplay={(liveItem) => this.viewLiveVideoReplay(liveItem)}
            />
        )
      });
    }
    
    const liveVideos = storyItems.broadcasts.map((liveVideoItem, key) => {
      return (
        <LiveVideoTrayItem
          key={key}
          trayItemIndex={key}
          liveItem={liveVideoItem}
          onViewLiveVideo={(liveItem) => this.viewLiveVideo(liveItem)}
          />
      )
    });
    
    const friendStoryItems = storyItems.tray.map((storyTrayItem, key) => {
      return (
        <StoryTrayItem
          key={key}
          trayItemIndex={key}
          storyItem={storyTrayItem}
          onViewUserStory={(index) => this.viewUserStory(index)}
          />
      )
    });
    
    storyTrayItems.push(liveVideoReplays);
    storyTrayItems.push(liveVideos);
    storyTrayItems.push(friendStoryItems);
    
    this.setState({storyTrayItems: storyTrayItems});  
  }
  
  viewUserStory(storyItem) {
    if(storyItem.items && storyItem.items.length > 0) {
      var storyGalleryItemsObject = storyGalleryItemsObject = getStoryGalleryItems(storyItem.items);
      this.showStoryGallery('userStory', storyGalleryItemsObject.items, storyItem);
    } else {
      InstagramApi.getStory(storyItem.id, (story) => {
        var storyGalleryItemsObject = storyGalleryItemsObject = getStoryGalleryItems(story.reel.items);
        this.showStoryGallery('userStory', storyGalleryItemsObject.items, story);
      });
    }
  }
  
  viewLiveVideo(liveItem) {
    var storyGalleryItemsObject = getStoryGalleryItems(liveItem);
    this.showStoryGallery('live', storyGalleryItemsObject.items, liveItem);
  }
  
  viewLiveVideoReplay(liveItem) {
    var storyGalleryItemsObject = getStoryGalleryItems(liveItem.broadcasts);
    this.showStoryGallery('liveReplay', storyGalleryItemsObject.items, liveItem);
  }
  
  showStoryGallery(type, galleryItems, storyItem) {
    this.setState({
      storyGalleryItems: galleryItems,
      currentStoryGalleryItem: storyItem,
      currentStoryGalleryType: type,
      isStoryGalleryOpen: true
    });
  }
  
  render() {
    return (
      <div>
        <div className="trayContainer">
          {this.state.storyTrayItems}
        </div>
        <div className="trayContainerEdgeFade"></div>
        <StoryGallery
          isOpen={this.state.isStoryGalleryOpen}
          currentItem={this.state.currentStoryGalleryItem}
          onCloseRequest={() => this.setState({isStoryGalleryOpen: false})}
          type={this.state.currentStoryGalleryType}
          items={this.state.storyGalleryItems}
          />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories,
    exploreStories: state.stories.exploreStories.tray,
  };
};

export default connect(mapStateToProps)(StoriesTray);