import React, { Component } from 'react';
import {connect} from 'react-redux';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import PlaceIcon from 'material-ui/svg-icons/maps/place';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStorySlide} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

let SelectableList = makeSelectable(List);

class LocationSearchList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1
    }
  }
  
  handleRequestChange (event, index) {
    var selectedResult = this.props.results[index];
    var location = selectedResult.location;
    InstagramApi.getLocationStory(location.pk, (story) => {
      if(story) {
        getStorySlide(story, (storySlide) => this.props.onSelectStory(storySlide));
        this.setState({
          selectedIndex: index,
        });
      } else {
        this.props.onSelectStory(null);
      }
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
  
  render() {
    const locationSearchListData = this.props.results.map((place, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={place.title}
          secondaryText={place.subtitle}
          leftAvatar={<Avatar icon={<PlaceIcon/>}/>}/>
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
