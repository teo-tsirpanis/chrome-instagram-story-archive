import React, { Component } from 'react';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ShareIcon from 'material-ui/svg-icons/social/share';
import CircularProgress from 'material-ui/CircularProgress';
import {fetchStory, getTimeElapsed} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

let SelectableList = makeSelectable(List);

class SuggestedStoriesList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1,
      downloadingIndex: -1,
      isDownloadingStory: false
    }
  }
  
  handleRequestChange (event, index) {
    var selectedStory = this.props.stories.tray[index];
    fetchStory(selectedStory, false, (storySlide) => {
      this.props.onSelectStory(storySlide);
    });
    this.setState({
      selectedIndex: index,
    });
    AnalyticsUtil.track("Story List Item Clicked", AnalyticsUtil.getStoryObject(selectedStory));
  }
  
  onDownloadStory(index) {
    if(!this.state.isDownloadingStory) {
      var selectedStory = this.props.stories.tray[index];
      this.setState({
        isDownloadingStory: true,
        downloadingIndex: index
      });
      fetchStory(selectedStory, true, () => {
        this.setState({isDownloadingStory: false});
      });
    }
  }
  
  onShareStory(index) {
    var selectedStory = this.props.stories.tray[index];
    AnalyticsUtil.track("Share Story", AnalyticsUtil.getStoryObject(selectedStory));
    if(selectedStory.owner) {
      window.open('https://watchmatcha.com/location/' + selectedStory.location.pk);
    } else {
      window.open('https://watchmatcha.com/user/' + selectedStory.user.username);
    }
  }
  
  render() {
    const friendStoriesListData = this.props.stories.tray.map((friendStory, key) => {
      var user, name;
      user = (friendStory.user) ? friendStory.user : friendStory.owner;
      name = (user.username) ? user.username : user.name;
      return (
        <ListItem
          key={key}
          value={key}
          innerDivStyle={{paddingTop: '0px', paddingBottom: '0px'}}>
          <Toolbar style={{paddingTop: '0px', paddingBottom: '0px', background: 'transparent'}}>
            <ToolbarGroup firstChild={true}>
              <ListItem
                disabled
                primaryText={name}
                secondaryText={getTimeElapsed(friendStory.latest_reel_media)}
                leftAvatar={<Avatar src={user.profile_pic_url} />}
                innerDivStyle={{marginLeft: '-14px'}}
                />
            </ToolbarGroup>
            <ToolbarGroup lastChild={true}>
              <IconButton
                tooltip={"Share"}
                onClick={() => this.onShareStory(key)}>
                <ShareIcon />
              </IconButton>
              <IconButton
                tooltip="Download"
                onClick={() => this.onDownloadStory(key)}>
                {(this.state.isDownloadingStory && this.state.downloadingIndex === key) ? <CircularProgress size={24}/> : <DownloadIcon />}
              </IconButton>
            </ToolbarGroup>
          </Toolbar>
        </ListItem>
      )
    });
    
    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        <Subheader>Suggested Stories</Subheader>
        {friendStoriesListData}
      </SelectableList>
    )
  }
}

export default SuggestedStoriesList;
