import React, { Component } from 'react';
import {connect} from 'react-redux';

import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';

import Story from '../app/Story';
import InstagramApi from '../../../../../utils/InstagramApi';
import {downloadStory, getStorySlide} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

let SelectableList = makeSelectable(List);

class FriendStoriesList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1
    }
  }
  
  handleRequestChange (event, index) {
    var selectedStory = this.props.friendStories.tray[index];
    if(selectedStory.items) {
      getStorySlide(selectedStory, (storySlide) => this.changeStory(storySlide));
      this.setState({
        selectedIndex: index,
      });
    } else {
      InstagramApi.getStory(selectedStory.id, (story) => {
        getStorySlide(story, (storySlide) => this.changeStory(storySlide));
        this.setState({
          selectedIndex: index,
        });
      });
    }
    AnalyticsUtil.track("Story List Item Clicked", AnalyticsUtil.getStoryObject(selectedStory));
  }
  
  changeStory(storySlide) {
    const story = (
      <Story item={storySlide} autoPlay={true}/>
    );
    this.props.onSelectStory(story);
  }
  
  getMenuItem(index) {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton
            onClick={() => {
              var selectedStory = this.props.friendStories.tray[index];
              AnalyticsUtil.track("Story List Item Menu Button Clicked", AnalyticsUtil.getStoryObject(selectedStory));
            }}>
            <MoreVertIcon />
          </IconButton>}
          anchorOrigin={{horizontal: 'left', vertical: 'top'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}>
          <MenuItem
            primaryText="Download"
            leftIcon={<DownloadIcon />} 
            onClick={() => {
              var selectedStory = this.props.friendStories.tray[index];
              if(selectedStory.items) {
                downloadStory(selectedStory);
              } else {
                InstagramApi.getStory(selectedStory.id, (story) => {
                  downloadStory(story);
                });
              }
            }}/>
          </IconMenu>
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
