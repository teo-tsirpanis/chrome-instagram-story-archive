import React, { Component } from 'react';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ShareIcon from 'material-ui/svg-icons/social/share';
import CircularProgress from 'material-ui/CircularProgress';
import InstagramApi from '../../../../../utils/InstagramApi';
import {downloadStory, getStorySlide, getTimeElapsed} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import {countriesList} from '../../../../../static/js/locationData.js'

let SelectableList = makeSelectable(List);

class LocationsList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1,
      downloadingIndex: -1,
      isDownloadingStory: false,
      stories: []
    }
  }
  
  componentDidMount() {
    setTimeout(function() {
      this.setState({stories: countriesList});
    }.bind(this), 100);  
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
  
  onDownloadStory(index) {
    if(!this.state.isDownloadingStory) {
      this.setState({
        isDownloadingStory: true,
        downloadingIndex: index
      });
      InstagramApi.getLocationStory(this.state.stories[index].locationId, (story) => {
        if(story) {
          downloadStory(story, () => this.setState({isDownloadingStory: false}));
        } else {
          this.props.onSelectStory(null);
          this.setState({isDownloadingStory: false});
        }
      });
    }
  }
  
  onShareStory(index) {
    var selectedStory = this.state.stories[index];
    AnalyticsUtil.track("Share Story", {locationName: selectedStory.name, locationId: selectedStory.locationId});
    window.open('https://watchmatcha.com/location/' + selectedStory.locationId);
  }
  
  render() {
    const locationStoriesListData = this.state.stories.map((locationStory, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          innerDivStyle={{paddingTop: '0px', paddingBottom: '0px'}}>
          <Toolbar style={{paddingTop: '0px', paddingBottom: '0px', background: 'transparent'}}>
            <ToolbarGroup firstChild={true}>
              <ListItem
                disabled
                primaryText={locationStory.name}
                leftAvatar={<Avatar>{locationStory.emoji}</Avatar>}
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
        <Subheader>Location Stories</Subheader>
        {locationStoriesListData}
      </SelectableList>
    )
  }
}

export default LocationsList;