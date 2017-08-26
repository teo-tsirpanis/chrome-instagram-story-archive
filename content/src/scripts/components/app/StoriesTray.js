import React, { Component } from 'react';
import {connect} from 'react-redux';
import LinearProgress from 'material-ui/LinearProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
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
      isLoadingTray: true,
      currentStoryGalleryItem: null,
      storyGalleryItems: [],
      currentStoryGalleryType: null,
      selectedStoryTrayType: this.props.type
    }
  }
  
  componentDidMount() {
    var storyItems = this.getStoryItems(this.props.type);
    if(storyItems.length > 0) {
      this.renderStoryTray(this.props.type, storyItems);
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.friendStories !== this.props.friendStories) {
      this.renderStoryTray(this.props.type, this.getStoryItems(this.props.type));
    }
  }
  
  getStoryItems(type) {
    switch(type) {
      case 'friends':
      return this.props.friendStories;
      case 'explore':
      return this.props.exploreStories.tray;
    }
  }
  
  getStoryTrayItems(selectedStoryTrayType, storyItems) {
    var storyTrayItems = [];
    switch(selectedStoryTrayType) {
      case 'friends':
      var liveVideoReplays = [];
      
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
        }
      );
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
    
    return storyTrayItems;
    case 'explore':
    
    const exploreStoryItems = storyItems.map((storyTrayItem, key) => {
      return (
        <StoryTrayItem
          key={key}
          trayItemIndex={key}
          storyItem={storyTrayItem}
          onViewUserStory={(index) => this.viewUserStory(index)}
          onDownloadStory={(index) => this.onDownloadStory(index)}
          />
      )
    });
    
    storyTrayItems.push(exploreStoryItems);
    
    return storyTrayItems;
  }
}

handleStoryTrayTypeChange = (event, index, value) => {
  this.setState({selectedStoryTrayType: value});
  console.log(this.props);
  console.log(this.getStoryItems(value));
  
  this.renderStoryTray(value, this.getStoryItems(value));
}

renderStoryTray(selectedStoryTrayType, storyItems) {
  var storyTrayItems = this.getStoryTrayItems(selectedStoryTrayType, storyItems);
  this.setState({isLoadingTray: false, storyTrayItems: storyTrayItems});
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
  if(this.state.isLoadingTray) {
    return (
      <LinearProgress mode="indeterminate" />
    )
  }
  return (
    <div>
      {/*
        <DropDownMenu
        value={this.state.selectedStoryTrayType}
        onChange={this.handleStoryTrayTypeChange}
        autoWidth={false}
        style={{width: '175px'}}>
        <MenuItem value={"friends"} primaryText="Friend Stories" />
        <MenuItem value={"explore"} primaryText="Explore Stories" />
        </DropDownMenu>
        */
      }
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
    exploreStories: state.stories.exploreStories,
  };
};

export default connect(mapStateToProps)(StoriesTray);