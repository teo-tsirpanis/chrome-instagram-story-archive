import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import {getUserFromStoryResponse, getTimeElapsed, downloadStory} from '../../../../../utils/Utils';
import {getStoryGalleryItems} from '../../utils/ContentUtils';
import InstagramApi from '../../../../../utils/InstagramApi';
import LiveVideoReplayTrayItem from './LiveVideoReplayTrayItem';
import LiveVideoTrayItem from './LiveVideoTrayItem';
import StoryGallery from './StoryGallery';
import StoryGalleryVideo from './StoryGalleryVideo';
import StoryGalleryLiveVideo from './StoryGalleryLiveVideo';

class UserProfileStoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStoryGalleryOpen: false,
      isDownloadingStory: false,
      storyGalleryItems: [],
      isRightClickMenuActive: false,
      rightClickMenuAnchor: null,
      hasLiveVideoReplays: false,
      hasLiveVideo: false,
      currentStoryGalleryType: null
    }
  }
  
  componentDidMount() {
    // hijack default right click context menu and display custom context menu
    this.refs.UserProfileStoryItem.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      if(!this.state.isDownloadingStory) {
        this.setState({
          rightClickMenuAnchor: ev.currentTarget,
          isRightClickMenuActive: true
        });
      }
      return true;
    }.bind(this), false);
    
    this.setState({hasLiveVideo: (this.props.storyItem.broadcast) ? true : false});
    this.setState({hasLiveVideoReplays: (this.props.storyItem.post_live_item) ? true : false});
  }
  
  handleRightClickMenuRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };
  
  viewUserStory() {
    var storyItems = this.props.storyItem.reel.items;
    var storyGalleryItemsObject = getStoryGalleryItems(storyItems);
    this.showStoryGallery('userStory', storyGalleryItemsObject.items, this.props.storyItem);
  }
  
  viewLiveVideo() {
    var storyItem = this.props.storyItem.broadcast;
    var storyGalleryItemsObject = getStoryGalleryItems(storyItem);
    this.showStoryGallery('live', storyGalleryItemsObject.items, storyItem);
  }
  
  viewLiveVideoReplay() {
    var liveVideoReplayItem = this.props.storyItem.post_live_item.broadcasts;
    var storyGalleryItemsObject = getStoryGalleryItems(liveVideoReplayItem);
    this.showStoryGallery('liveReplay', storyGalleryItemsObject.items, this.props.storyItem.post_live_item);
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
    var seenClass = (this.props.storyItem.reel && this.props.storyItem.reel.seen === 0) ? "unseenStoryItem" : "seenStoryItem";
    var containerClass = (this.state.hasLiveVideoReplays) ? "liveTrayItemImage" : "_l8yre _qdmzb";
    var user = getUserFromStoryResponse(this.props.storyItem);
    
    var storyItem;
    if(this.state.hasLiveVideo) {
      storyItem = (
        <LiveVideoTrayItem
          type="userProfile"
          liveItem={this.props.storyItem.broadcast}
          onViewLiveVideo={(index) => this.viewLiveVideo()}
          />
      );
    } else if(this.state.hasLiveVideoReplays) {
      storyItem = (
        <LiveVideoReplayTrayItem
          type="userProfile"
          liveItem={this.props.storyItem.post_live_item}
          storyItem={this.props.storyItem.reel}
          onViewUserStory={(index) => this.viewUserStory()}
          onViewLiveVideoReplay={(index) => this.viewLiveVideoReplay()}
          />
      );
    } else {
      storyItem = (
        <div>
          {this.state.isDownloadingStory && <CircularProgress className="center-div" style={{position: 'absolute'}} size={180} />}
          <div className={containerClass + " " + seenClass} onClick={() => this.viewUserStory()}>
            <img className="_9bt3u instagramUserImage center-div" src={user.profile_pic_url}/>
            <Popover
              open={this.state.isRightClickMenuActive}
              anchorEl={this.state.rightClickMenuAnchor}
              anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
              targetOrigin={{horizontal: 'left', vertical: 'top'}}
              onRequestClose={() => this.handleRightClickMenuRequestClose()}>
              <Menu>
                <MenuItem
                  primaryText="Download Story"
                  leftIcon={<DownloadIcon />} 
                  onClick={() => {
                    this.handleRightClickMenuRequestClose();
                    this.setState({isDownloadingStory: true});
                    downloadStory(this.props.storyItem.reel, () => {
                      this.setState({isDownloadingStory: false});
                    });
                  }}/>
                </Menu>
              </Popover>
            </div>
          </div>
        );
      }
      
      return (
        <div ref="UserProfileStoryItem">
          {storyItem}
          <StoryGallery
            isOpen={this.state.isStoryGalleryOpen}
            currentItem={this.state.currentStoryGalleryItem}
            onCloseRequest={() => this.setState({isStoryGalleryOpen: false})}
            items={this.state.storyGalleryItems}
            type={this.state.currentStoryGalleryType}
            />
        </div>
      )
    }
  }
  
  export default UserProfileStoryItem;