import React, { Component } from 'react';
import {connect} from 'react-redux';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStorySlide} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

let SelectableList = makeSelectable(List);

class PeopleSearchList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1
    }
  }
  
  handleRequestChange (event, index) {
    var selectedResult = this.props.results[index];
    InstagramApi.getStory(selectedResult.pk, (story) => {
      if(story.items.length > 0) {
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
      type: "user",
      result: {
        id: selectedResult.pk,
        username: selectedResult.username
      }
    });
  }
  
  render() {
    const peopleSearchListData = this.props.results.map((user, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={user.username}
          secondaryText={user.full_name}
          leftAvatar={<Avatar src={user.profile_pic_url} />}/>
      )
    });
    
    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        {peopleSearchListData}
      </SelectableList>
    )
  }
}

export default PeopleSearchList;
