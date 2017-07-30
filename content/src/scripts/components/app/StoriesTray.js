import React, { Component } from 'react';
import {connect} from 'react-redux';
import StoryTrayItem from './StoryTrayItem';
import InstagramApi from '../../../../../utils/InstagramApi';
import {downloadStory} from '../../../../../utils/Utils';

class StoriesTray extends Component {
  getStoryItems() {
    switch(this.props.type) {
      case 'friends':
      return this.props.friendStories;
      case 'explore':
      return this.props.exploreStories;
    }
  }

  viewUserStory(index) {
    var story = this.getStoryItems()[index];
    this.props.onStoryClicked(story);
  }

  onDownloadStory(index) {
    var storyItem = this.getStoryItems()[index];
    InstagramApi.getStory(storyItem.id).then(function(story) {
      downloadStory(story);
    });
  }

  render() {
    const storyTrayItems = this.getStoryItems().map((storyTrayItem, key) => {
      var story = this.getStoryItems()[key];
      var seenClass = (story.seen === 0) ? "unseenStoryItem" : "seenStoryItem";
      return (
        <StoryTrayItem
          key={key}
          trayItemIndex={key}
          trayItemIcon={<img className={"trayItemImage " + seenClass} src={storyTrayItem.user.profile_pic_url} onClick={() => this.viewUserStory(key)}/>}
          trayItemUsername={storyTrayItem.user.username}
          storyItem={story}
          onDownloadStory={(index) => this.onDownloadStory(index)}
          />
      )});

      return (
        <div>
          <div className="trayContainer">
            {storyTrayItems}
          </div>
          <div className="trayContainerEdgeFade"></div>
        </div>
      )
    }
  }

  const mapStateToProps = (state) => {
    return {
      friendStories: state.stories.friendStories.tray,
      exploreStories: state.stories.exploreStories.tray,
    };
  };

  export default connect(mapStateToProps)(StoriesTray);