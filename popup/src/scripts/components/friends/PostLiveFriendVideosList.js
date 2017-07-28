import React, { Component } from 'react';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import VideoLibraryIcon from 'material-ui/svg-icons/av/video-library';
import MusicLibraryIcon from 'material-ui/svg-icons/av/library-music';
import LiveVideo from '../live/LiveVideo';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import {getStorySlide, getLiveVideoMp4VideoUrl, getLiveVideoMp4AudioUrl} from '../../../../../utils/Utils';

let SelectableList = makeSelectable(List);

class PostLiveFriendVideosList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1
    }
  }
  
  handleRequestChange (event, index) {
    var selectedStory = this.props.friendStories.post_live.post_live_items[index].broadcasts[0];
    this.props.onSelectStory(selectedStory);
    this.setState({
      selectedIndex: index,
    });
    AnalyticsUtil.track("Story List Item Clicked", AnalyticsUtil.getStoryObject(selectedStory));
  }
  
  getMenuItem(index) {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton
            onClick={() => {
              var selectedStory = this.props.friendStories.post_live.post_live_items[index];
              AnalyticsUtil.track("Story List Item Menu Button Clicked", AnalyticsUtil.getStoryObject(selectedStory));
            }}>
            <MoreVertIcon />
          </IconButton>
        }
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}>
        <MenuItem
          primaryText="Open Video URL"
          leftIcon={<VideoLibraryIcon />} 
          onClick={() => {
            var selectedStory = this.props.friendStories.post_live.post_live_items[index].broadcasts[0];
            getLiveVideoMp4VideoUrl(selectedStory.dash_manifest, (videoUrl) => {
              window.open(videoUrl);
            });
            AnalyticsUtil.track("Open Post Live MP4 Video URL Clicked");
          }}
          />
        <MenuItem
          primaryText="Open Audio URL"
          leftIcon={<MusicLibraryIcon />} 
          onClick={() => {
            var selectedStory = this.props.friendStories.post_live.post_live_items[index].broadcasts[0];
            getLiveVideoMp4AudioUrl(selectedStory.dash_manifest, (audioUrl) => {
              window.open(audioUrl);
            });
            AnalyticsUtil.track("Open Post Live MP4 Audio URL Clicked");
          }}
          />
      </IconMenu>
    );
  }
  
  render() {
    if(this.props.friendStories.post_live.post_live_items.length === 0) {
      return (<div></div>);
    }
    
    const postLiveFriendVideosListData = this.props.friendStories.post_live.post_live_items.map((postLiveVideo, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={postLiveVideo.user.username}
          leftAvatar={<Avatar src={postLiveVideo.user.profile_pic_url} />}
          rightIconButton={this.getMenuItem(key)}
          />
      )
    });
    
    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        <Subheader>Post Live Videos</Subheader>
        {postLiveFriendVideosListData}
      </SelectableList>
    )
  }
}

export default PostLiveFriendVideosList;
