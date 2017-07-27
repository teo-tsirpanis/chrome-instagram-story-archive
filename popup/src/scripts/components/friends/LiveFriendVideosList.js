import React, { Component } from 'react';

import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';

import LiveVideo from '../live/LiveVideo';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import {getStorySlide} from '../../../../../utils/Utils';

let SelectableList = makeSelectable(List);

class LiveFriendVideosList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1
    }
  }
  
  handleRequestChange (event, index) {
    var selectedStory = this.props.friendStories.broadcasts[index];
    this.props.onSelectStory(selectedStory);
    this.setState({
      selectedIndex: index,
    });
    AnalyticsUtil.track("Story List Item Clicked", AnalyticsUtil.getStoryObject(selectedStory));
  }
  
  render() {
    if(this.props.friendStories.broadcasts.length === 0) {
      return (<div></div>);
    }
    
    const friendStoriesListData = this.props.friendStories.broadcasts.map((friendStory, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={friendStory.broadcast_owner.username}
          leftAvatar={<Avatar src={friendStory.broadcast_owner.profile_pic_url} />}
          />
      )
    });
    
    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        <Subheader>Live Videos</Subheader>
        {friendStoriesListData}
      </SelectableList>
    )
  }
}

export default LiveFriendVideosList;
