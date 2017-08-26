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
import LiveVideoReplayDownloadDialog from './LiveVideoReplayDownloadDialog';

let SelectableList = makeSelectable(List);

class LiveFriendVideoReplaysList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1,
      downloadingIndex: -1,
      isDownloadLiveVideoDialogOpen: false
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
      <IconButton
        tooltip="Download"
        onClick={() => this.setState({
          isDownloadLiveVideoDialogOpen: true,
          downloadingIndex: index
        })}>
        <DownloadIcon />
      </IconButton>
    );
  }
  
  render() {
    if(this.props.friendStories.post_live.post_live_items.length === 0) {
      return (<div></div>);
    }
    
    const liveFriendVideoReplaysListData = this.props.friendStories.post_live.post_live_items.map((liveVideoReplay, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={liveVideoReplay.user.username}
          leftAvatar={<Avatar src={liveVideoReplay.user.profile_pic_url} />}
          rightIconButton={this.getMenuItem(key)}
          />
      )
    });
    
    return (
      <div>
        <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
          <Subheader>Live Video Replays</Subheader>
          {liveFriendVideoReplaysListData}
        </SelectableList>
        {this.state.isDownloadLiveVideoDialogOpen &&
          <LiveVideoReplayDownloadDialog
            isOpen={this.state.isDownloadLiveVideoDialogOpen}
            liveVideoReplays={this.props.friendStories.post_live.post_live_items[this.state.downloadingIndex].broadcasts}
            onRequestClose={() => this.setState({isDownloadLiveVideoDialogOpen: false})}
            />
        }
      </div>    
    )
  }
}

export default LiveFriendVideoReplaysList;
