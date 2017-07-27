import React, { Component } from 'react';
import {connect} from 'react-redux';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import CircularProgress from 'material-ui/CircularProgress';
import {fetchStory} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

let SelectableList = makeSelectable(List);

class FriendStoriesList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1,
      downloadingIndex: -1,
      isDownloadingStory: false
    }
  }
  
  handleRequestChange (event, index) {
    var selectedStory = this.props.friendStories.tray[index];
    fetchStory(selectedStory, false, (storySlide) => {
      this.props.onSelectStory(storySlide);
    });
    this.setState({
      selectedIndex: index,
    });
    AnalyticsUtil.track("Story List Item Clicked", AnalyticsUtil.getStoryObject(selectedStory));
  }
  
  getMenuItem(index) {
    return (
      <IconButton
        tooltip="Download"
        onClick={() => {
          if(!this.state.isDownloadingStory) {
            var selectedStory = this.props.friendStories.tray[index];
            this.setState({
              isDownloadingStory: true,
              downloadingIndex: index
            });
            fetchStory(selectedStory, true, () => {
              this.setState({isDownloadingStory: false});
            });
          }
        }}>
        {(this.state.isDownloadingStory && this.state.downloadingIndex === index) ? <CircularProgress size={24}/> : <DownloadIcon />}
      </IconButton>
    );
  }
  
  render() {
    const friendStoriesListData = this.props.friendStories.tray.map((friendStory, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={friendStory.user.username}
          leftAvatar={<Avatar src={friendStory.user.profile_pic_url} />}
          rightIconButton={this.getMenuItem(key)}/>
      )
    });
    
    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        <Subheader>{"Friend's"} Stories</Subheader>
        {friendStoriesListData}
      </SelectableList>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories,
    currentStoryId: state.stories.currentStoryId
  };
};

export default connect(mapStateToProps)(FriendStoriesList);
