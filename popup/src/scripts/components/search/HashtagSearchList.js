import React, { Component } from 'react';
import {connect} from 'react-redux';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStorySlide} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';

let SelectableList = makeSelectable(List);

class HashtagSearchList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1
    }
  }
  
  handleRequestChange (event, index) {
    var selectedResult = this.props.results[index];
    InstagramApi.getHashtagStory(selectedResult.name, (story) => {
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
      type: "hashtag",
      result: {
        id: selectedResult.id,
        name: selectedResult.name
      }
    });
  }
  
  render() {
    const hashtagSearchListData = this.props.results.map((hashtag, key) => {
      return (
        <ListItem
          key={key}
          value={key}
          primaryText={hashtag.name}
          leftAvatar={<Avatar>#</Avatar>}/>
      )
    });
    
    return (
      <SelectableList value={this.state.selectedIndex} onChange={this.handleRequestChange.bind(this)}>
        {hashtagSearchListData}
      </SelectableList>
    )
  }
}

export default HashtagSearchList;
