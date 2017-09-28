import React, { Component } from 'react';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ShareIcon from 'material-ui/svg-icons/social/share';
import VideoLibraryIcon from 'material-ui/svg-icons/av/video-library';
import MusicLibraryIcon from 'material-ui/svg-icons/av/library-music';
import LiveVideo from '../live/LiveVideo';
import {getTimeElapsed} from '../../../../../utils/Utils';
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
  
  onDownloadStory(index) {
    this.setState({
      isDownloadLiveVideoDialogOpen: true,
      downloadingIndex: index
    });
  }
  
  onShareStory(index) {
    var selectedStory = this.props.friendStories.post_live.post_live_items[index].broadcasts[0];
    AnalyticsUtil.track("Share Story", AnalyticsUtil.getStoryObject(selectedStory));
    window.open('https://watchmatcha.com/user/' + selectedStory.broadcast_owner.username);
  }
  
  render() {
    if(this.props.friendStories.post_live.post_live_items.length === 0) {
      return (<div></div>);
    }
    
    const liveFriendVideoReplaysListData = this.props.friendStories.post_live.post_live_items.map((liveVideoReplay, key) => {
      const isPrivate = liveVideoReplay.user.is_private;
      const latestBroadcast = liveVideoReplay.broadcasts[liveVideoReplay.broadcasts.length - 1];
      return (
        <ListItem
          key={key}
          value={key}
          innerDivStyle={{paddingTop: '0px', paddingBottom: '0px'}}>
          <Toolbar style={{paddingTop: '0px', paddingBottom: '0px', background: 'transparent'}}>
            <ToolbarGroup firstChild={true}>
              <ListItem
                disabled
                primaryText={liveVideoReplay.user.username}
                secondaryText={getTimeElapsed(latestBroadcast.published_time)}
                leftAvatar={<Avatar src={liveVideoReplay.user.profile_pic_url} />}
                innerDivStyle={{marginLeft: '-14px'}}
                />
            </ToolbarGroup>
            <ToolbarGroup lastChild={true}>
              <IconButton
                tooltip={(isPrivate) ? "Can't Share Private Story" : "Share"}
                disabled={isPrivate}
                onClick={() => this.onShareStory(key)}>
                <ShareIcon />
              </IconButton>
              <IconButton
                tooltip="Download"
                onClick={() => this.onDownloadStory(key)}>
                <DownloadIcon />
              </IconButton>
            </ToolbarGroup>
          </Toolbar>
        </ListItem>
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
