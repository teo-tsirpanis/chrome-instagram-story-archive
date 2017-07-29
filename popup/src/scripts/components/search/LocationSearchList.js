import React, { Component } from 'react';
import {connect} from 'react-redux';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import CircularProgress from 'material-ui/CircularProgress';
import PlaceIcon from 'material-ui/svg-icons/maps/place';
import InstagramApi from '../../../../../utils/InstagramApi';
import {fetchStory} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

let SelectableList = makeSelectable(List);

class LocationSearchList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1,
      downloadingIndex: -1,
      isDownloadingStory: false
    }
  }

  handleRequestChange (event, index) {
    var selectedResult = this.props.results[index];
    fetchStory(selectedResult, false, (storySlide) => {
      this.props.onSelectStory(storySlide);
    });
    this.setState({
      selectedIndex: index,
    });
    AnalyticsUtil.track("Search List Item Clicked",
    {
      type: "location",
      result: {
        title: selectedResult.title,
        location: {
          id: location.pk,
          facebook_places_id: location.facebook_places_id
        }
      }
    });
  }

  getMenuItem(index) {
    return (
      <IconButton
        tooltip="Download"
        onClick={() => {
          if(!this.state.isDownloadingStory) {
            var selectedResult = this.props.results[index];
            this.setState({
              isDownloadingStory: true,
              downloadingIndex: index
            });
            fetchStory(selectedResult, true, (story) => {
              this.setState({isDownloadingStory: false});
              if(!story) {
                this.props.onSelectStory(null);
              }
            });
          }
        }}>
        {(this.state.isDownloadingStory && this.state.downloadingIndex === index) ? <CircularProgress size={24}/> : <DownloadIcon />}
      </IconButton>
    );
  }

  render() {
    const locationSearchListData = this.props.results.map((place, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={place.title}
          secondaryText={place.subtitle}
          leftAvatar={<Avatar icon={<PlaceIcon/>}/>}
          rightIconButton={this.getMenuItem(key)}
          />
      )
    });

    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        {locationSearchListData}
      </SelectableList>
    )
  }
}

export default LocationSearchList;
