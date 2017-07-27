import React, { Component } from 'react';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import CircularProgress from 'material-ui/CircularProgress';
import {fetchStory} from '../../../../../utils/Utils';
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
  
  getMenuItem(index) {
    return (
      <IconButton
        tooltip="Download"
        onClick={() => {
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
        }}>
        {(this.state.isDownloadingStory && this.state.downloadingIndex === index) ? <CircularProgress size={24}/> : <DownloadIcon />}
      </IconButton>
    );
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
          primaryText={name}
          leftAvatar={<Avatar src={user.profile_pic_url} />}
          rightIconButton={this.getMenuItem(key)}
          />
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
