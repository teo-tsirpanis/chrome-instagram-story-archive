import React, {Component} from 'react';
import {connect} from 'react-redux';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {ListItem} from 'material-ui/List';
import {Tabs, Tab} from 'material-ui/Tabs';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import OpenInNewIcon from 'material-ui/svg-icons/action/open-in-new';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import LiveTvIcon from 'material-ui/svg-icons/notification/live-tv';

import FriendsTab from '../friends/FriendsTab';
import ExploreTab from '../explore/ExploreTab';
import LiveTab from '../live/LiveTab';

import Story from './Story';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStorySlide} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import $ from 'jquery';

import "../../../../../node_modules/react-image-gallery/styles/scss/image-gallery.scss";

import {
  TAB_TEXT_COLOR_DARK_GRAY,
  TAB_TEXT_COLOR_LIGHT_GRAY,
  TAB_BACKGROUND_COLOR_WHITE,
  POPUP_CONTAINER_WIDTH,
  POPUP_CONTAINER_HEIGHT
} from '../../../../../utils/Constants';

const tabNames = ["Friends", "Explore", "Live"];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabIndex: 0,
      currentStory: null,
      isFriendsTabLoading: true,
      isExploreTabLoading: true,
      isLiveTabLoading: true,
      isFullPopup: false
    }
  }
  
  handleTabChange = (value) => {
    this.setState({currentTabIndex: value});
    AnalyticsUtil.track(tabNames[value] + " Tab Selected");
  };
  
  componentDidMount() {
    if(this.props.currentStoryItem != null) {
      /*
      A story was selected from outside the popup, so fetch the story and
      dispatch it to the store so we can display it in a popout
      */
      InstagramApi.getStory(this.props.currentStoryItem.id, (story) => {
        getStorySlide(story, (storySlide) => {
          this.setState({isFullPopup: true});
          this.changeStory(storySlide);
          this.props.dispatch({
            type: 'SET_CURRENT_STORY_ITEM',
            currentStoryItem: null
          });
        });  
      });
    }
    
    if(this.props.isFullPopup) {
      AnalyticsUtil.track("Popout Opened");   
      this.setState({isFullPopup: true});
    } else {
      AnalyticsUtil.track("Popup Opened");      
    }
    
    // fetch all the data from the Instagram API and dispatch it to the store
    InstagramApi.getFriendStories((friendStoriesResponse) => this.loadFriendsStoryTray(friendStoriesResponse));
    InstagramApi.getExploreStories((exploreStoriesResponse) => this.loadExploreStoryTray(exploreStoriesResponse));
    InstagramApi.getTopLiveVideos((topLiveVideosResponse) => this.loadTopLiveVideos(topLiveVideosResponse));
  }
  
  loadFriendsStoryTray(friendStoriesResponse) {    
    this.props.dispatch({
      type: 'SET_FRIEND_STORIES',
      friendStories: friendStoriesResponse
    });
    this.setState({isFriendsTabLoading: false});
  }
  
  loadExploreStoryTray(exploreStoriesResponse) {
    this.props.dispatch({
      type: 'SET_EXPLORE_STORIES',
      exploreStories: exploreStoriesResponse
    });
    this.setState({isExploreTabLoading: false});
  }
  
  loadTopLiveVideos(topLiveVideosResponse) {
    this.props.dispatch({
      type: 'SET_TOP_LIVE_VIDEOS',
      topLiveVideos: topLiveVideosResponse.broadcasts
    });
    this.setState({isLiveTabLoading: false});
  }
  
  changeStory(storySlide) {
    const story = (
      <Story item={storySlide} autoPlay={true}/>
    );
    this.setNewStory(story);
  }
  
  setNewStory(story) {
    this.setState({currentStory: null});
    setTimeout(function() {
      this.setState({currentStory: story});
    }.bind(this), 100);
  }
  
  render() {
    const styles = {
      popupContainer: {
        minWidth: POPUP_CONTAINER_WIDTH + 'px',
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        margin: '0px',
        overflow: 'hidden'
      },
      appBar: {
        position: 'fixed',
        width: (this.state.currentStory != null) ? '57%' : '100%',
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
        zIndex: 1
      },
      tabs: {
        position: 'fixed',
        width: (this.state.currentStory != null) ? '57%' : '100%',
        marginTop: '58px'
      },
      defaultTab: {
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        color: TAB_TEXT_COLOR_DARK_GRAY,
      },
      activeTab: {
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        color: TAB_TEXT_COLOR_LIGHT_GRAY,
      },
      friendsStoriesList: {
        width: (this.state.currentStory != null) ? '57%' : '100%',
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        float: 'left',
        overflowY: 'scroll'
      },
      friendsStoryContainer: {
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        marginLeft:  (this.state.currentStory != null) ? '57%' : '0%'
      }
    };
    
    styles.tab = [];
    styles.tab[0] = styles.activeTab;
    styles.tab[1] = styles.activeTab;
    styles.tab[2] = styles.activeTab;
    styles.tab[this.state.currentTabIndex] = Object.assign({}, styles.tab[this.state.currentTabIndex], styles.defaultTab);
    
    return (
      <div style={styles.popupContainer}>
        <div style={styles.friendsStoriesList}>
          <Toolbar
            style={styles.appBar}>
            <ToolbarGroup firstChild={true}>
              <Avatar
                src="../img/matcha-logo.png"
                style={{backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '0px', marginLeft: '15px'}}
                onClick={()=> window.open('https://watchmatcha.com/')}/>
              <ListItem
                primaryText="Chrome IG Story"
                secondaryText="powered by Matcha"
                style={{paddingLeft: '10px', paddingTop: '15px'}}
                disabled={true}/>
            </ToolbarGroup>
            <ToolbarGroup lastChild={true}>
              {!this.state.isFullPopup &&
                <IconButton
                  tooltip="Popout"
                  tooltipPosition="bottom-center"
                  onClick={()=> {
                    this.props.dispatch({type: 'launch-popup'});
                    AnalyticsUtil.track("Popout Button Clicked"); 
                  }}>
                  <OpenInNewIcon color={TAB_TEXT_COLOR_DARK_GRAY}/>
                </IconButton>
              }
            </ToolbarGroup>
          </Toolbar>
          <Tabs
            value={this.state.currentTabIndex}
            onChange={this.handleTabChange}
            style={styles.tabs}
            className="tabs-container">
            <Tab label="Friends" icon={<PeopleIcon/>} value={0} style={styles.tab[0]} className="tab">
              <FriendsTab
                isLoading={this.state.isFriendsTabLoading}
                onSelectStory={(story) => this.setNewStory(story)}
                />
            </Tab>
            <Tab label="Explore" icon={<ActionExploreIcon/>} value={1} style={styles.tab[1]} className="tab">
              <ExploreTab
                isLoading={this.state.isExploreTabLoading}
                onSelectStory={(story) => this.setNewStory(story)}
                />
            </Tab>
            <Tab label="Live" icon={<LiveTvIcon/>} value={2} style={styles.tab[2]} className="tab">
              <LiveTab
                isLoading={this.state.isLiveTabLoading}
                onSelectStory={(story) => this.setNewStory(story)}
                />
            </Tab>
          </Tabs>
        </div>
        <div style={styles.friendsStoryContainer}>
          {this.state.currentStory != null && this.state.currentStory}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stories: state.stories,
    currentStoryItem: state.popup.currentStoryItem,
    isFullPopup: state.popup.isFullPopup
  };
};

export default connect(mapStateToProps)(App);
