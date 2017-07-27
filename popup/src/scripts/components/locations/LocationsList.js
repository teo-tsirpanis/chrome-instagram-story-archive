import React, { Component } from 'react';

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
import {countriesList} from '../../../../../static/js/locationData.js'

let SelectableList = makeSelectable(List);

class LocationsList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1,
      stories: countriesList
    }
  }
  
  handleRequestChange (event, index) {
    InstagramApi.getLocationStory(this.state.stories[index].locationId, (story) => {
      if(story) {
        getStorySlide(story, (storySlide) => this.props.onSelectStory(storySlide));
        this.setState({
          selectedIndex: index,
        });
      } else {
        this.props.onSelectStory(null);
      }
    });
  }
  
  getMenuItem(index) {
    return (
      <IconButton
        tooltip="Download"
        onClick={() => {
          InstagramApi.getLocationStory(this.state.stories[index].locationId, (story) => {
            if(story) {
              downloadStory(story);
            } else {
              this.props.onSelectStory(null);
            }
          });
        }}>
        <DownloadIcon />
      </IconButton>
    );
  }
  
  render() {
    const locationStoriesListData = this.state.stories.map((locationStory, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={locationStory.name}
          leftAvatar={<Avatar>{locationStory.emoji}</Avatar>}
          rightIconButton={this.getMenuItem(key)}
          />
      )
    });
    
    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        <Subheader>Location Stories</Subheader>
        {locationStoriesListData}
      </SelectableList>
    )
  }
}

export default LocationsList;