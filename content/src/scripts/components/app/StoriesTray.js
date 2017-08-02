import React, { Component } from 'react';
import {connect} from 'react-redux';
import StoryTrayItem from './StoryTrayItem';
import LiveVideoTrayItem from './LiveVideoTrayItem';
import PostLiveVideoTrayItem from './PostLiveVideoTrayItem';
import InstagramApi from '../../../../../utils/InstagramApi';
import {downloadStory} from '../../../../../utils/Utils';

class StoriesTray extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storyTrayItems: ''
    }
  }
  
  getStoryItems() {
    switch(this.props.type) {
      case 'friends':
      return this.props.friendStories;
      case 'explore':
      return this.props.exploreStories;
    }
  }
  
  componentDidMount() {
    var storyTrayItems = [];
    var postLiveVideos = [];
    var storyItems = this.getStoryItems();
    
    if(storyItems.post_live) {
      postLiveVideos = storyItems.post_live.post_live_items.map((postLiveVideoItem, key) => {
        var postLiveVideo = postLiveVideoItem.broadcasts[0];
        return (
          <PostLiveVideoTrayItem
            key={key}
            trayItemIndex={key}
            storyItem={postLiveVideoItem}
            onViewUserStory={(index) => this.viewUserStory(index)}
            onDownloadStory={(index) => this.onDownloadStory(index)}
            />
        )});
      }
      
      const liveVideos = storyItems.broadcasts.map((liveVideoItem, key) => {
        return (
          <LiveVideoTrayItem
            key={key}
            trayItemIndex={key}
            storyItem={liveVideoItem}
            onViewUserStory={(index) => this.viewUserStory(index)}
            onDownloadStory={(index) => this.onDownloadStory(index)}
            />
        )});
        
        const friendStoryItems = storyItems.tray.map((storyTrayItem, key) => {
          return (
            <StoryTrayItem
              key={key}
              trayItemIndex={key}
              storyItem={storyTrayItem}
              onViewUserStory={(index) => this.viewUserStory(index)}
              onDownloadStory={(index) => this.onDownloadStory(index)}
              />
          )});
          
          storyTrayItems.push(postLiveVideos);
          storyTrayItems.push(liveVideos);
          storyTrayItems.push(friendStoryItems);
          
          this.setState({storyTrayItems: storyTrayItems});
        }
        
        viewUserStory(storyItem) {
          this.props.onStoryClicked(storyItem);
        }
        
        onDownloadStory(index) {
          var storyItem = this.getStoryItems()[index];
          InstagramApi.getStory(storyItem.id).then(function(story) {
            downloadStory(story);
          });
        }
        
        render() {
          return (
            <div>
              <div className="trayContainer">
                {this.state.storyTrayItems}
              </div>
              <div className="trayContainerEdgeFade"></div>
            </div>
          )
        }
      }
      
      const mapStateToProps = (state) => {
        return {
          friendStories: state.stories.friendStories,
          exploreStories: state.stories.exploreStories.tray,
        };
      };
      
      export default connect(mapStateToProps)(StoriesTray);