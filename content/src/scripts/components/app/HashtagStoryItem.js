import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import StoryGallery from './StoryGallery';
import {downloadStory} from '../../../../../utils/Utils';
import {getStoryGalleryItems} from '../../utils/ContentUtils';

class HashtagStoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStoryGalleryOpen: false,
      isDownloadingStory: false,
      storyGalleryItems: [],
      isRightClickMenuActive: false,
      rightClickMenuAnchor: null,
      currentStoryGalleryType: null
    }
  }
  
  componentDidMount() {
    // hijack default right click context menu and display custom context menu
    this.refs.HashtagStoryItemContainer.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      if(!this.state.isDownloadingStory) {
        this.setState({
          rightClickMenuAnchor: ev.currentTarget,
          isRightClickMenuActive: true
        });
      }
      return true;
    }.bind(this), false);
  }
  
  onViewHashtagStory() {
    var storyItems = this.props.storyItem.items;
    var storyGalleryItemsObject = getStoryGalleryItems(storyItems);
    this.showStoryGallery('userStory', storyGalleryItemsObject.items, this.props.storyItem, storyGalleryItemsObject.isStoryGalleryZoomEnabled);
  }
  
  showStoryGallery(type, galleryItems, storyItem, isZoomEnabled) {
    this.setState({
      storyGalleryItems: galleryItems,
      currentStoryGalleryItem: storyItem,
      currentStoryGalleryType: type,
      isStoryGalleryZoomEnabled: isZoomEnabled,
      isStoryGalleryOpen: true
    });
  }
  
  handleRightClickMenuRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };
  
  render() {
    return (
      <div ref="HashtagStoryItemContainer">
      <div className="hashtagStoryIconContainer unseenStoryItem">
      {this.state.isDownloadingStory && <CircularProgress className="center-div" size={110} />}
      <img className="hashtagStoryIcon center-div" src={this.props.storyItem.owner.profile_pic_url} onClick={() => this.onViewHashtagStory(this.props.storyItem)}/>
      <img src={chrome.extension.getURL('img/icon_hashtag.png')} className="hashtagIcon"/>
      </div>
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
              downloadStory(this.props.storyItem, () => {
                this.setState({isDownloadingStory: false});
              });
            }}/>
        </Menu>
      </Popover>
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

export default HashtagStoryItem;