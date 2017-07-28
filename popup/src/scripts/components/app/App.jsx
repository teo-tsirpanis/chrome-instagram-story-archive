import React, {Component} from 'react';
import {connect} from 'react-redux';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {ListItem} from 'material-ui/List';
import {Tabs, Tab} from 'material-ui/Tabs';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import OpenInNewIcon from 'material-ui/svg-icons/action/open-in-new';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import LiveTvIcon from 'material-ui/svg-icons/notification/live-tv';
import PlaceIcon from 'material-ui/svg-icons/maps/place';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';

import FriendsTab from '../friends/FriendsTab';
import ExploreTab from '../explore/ExploreTab';
import LiveTab from '../live/LiveTab';
import LocationsTab from '../locations/LocationsTab';

import Story from './Story';
import LiveVideo from '../live/LiveVideo';
import SearchPage from '../search/SearchPage';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStorySlide} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import $ from 'jquery';

import "../../../../../node_modules/react-image-gallery/styles/css/image-gallery.css";

import {
  TAB_TEXT_COLOR_DARK_GRAY,
  TAB_TEXT_COLOR_LIGHT_GRAY,
  TAB_BACKGROUND_COLOR_WHITE,
  POPUP_CONTAINER_WIDTH,
  POPUP_CONTAINER_HEIGHT
} from '../../../../../utils/Constants';

const tabNames = ["Friends", "Explore", "Live", "Locations"];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabIndex: 0,
      currentStory: null,
      isFriendsTabLoading: true,
      isExploreTabLoading: true,
      isLiveTabLoading: true,
      isFullPopup: false,
      isSearchActive: true,
      isSnackbarActive: false
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
    InstagramApi.getExploreFeed((exploreStoriesResponse) => this.loadExploreStoryTray(InstagramApi.getExploreStories(exploreStoriesResponse)));
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
    if(storySlide === null) {
      this.setState({isSnackbarActive: true});
    } else {
      var story;
      if(storySlide.broadcast_owner) {
        story = (
          <LiveVideo item={storySlide}/>
        );
      } else {
        story = (
          <Story item={storySlide} autoPlay={true}/>
        );
      }
      this.setNewStory(story);
    }  
  }
  
  setNewStory(story) {
    this.setState({
      currentStory: null,
      isSearchActive: false
    });
    setTimeout(function() {
      this.setState({currentStory: story});
    }.bind(this), 100);
  }
  
  handleSnackbarRequestClose() {
    this.setState({isSnackbarActive: false});
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
        width: '55%',
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
        zIndex: 1
      },
      bottomNavigation: {
        marginTop: '544px',
        boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
      },
      tabs: {
        position: 'fixed',
        width: '55%',
        marginTop: '56px'
      },
      friendsStoriesList: {
        width: '55%',
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        float: 'left',
        overflowY: 'auto'
      },
      friendsStoryContainer: {
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        marginLeft: '55%',
        backgroundColor: '#FAFAFA'
      },
      loadingIndicator: {
        position: 'sticky',
        display: 'block',
        margin: 'auto auto',
        top: '50%',
        left: '50%',
        transform: 'translate(0%, -50%)'
      }
    };
    
    var currentTab;
    switch(this.state.currentTabIndex) {
      case 0:
      currentTab = (
        <FriendsTab
          isLoading={this.state.isFriendsTabLoading}
          onSelectStory={(story) => this.changeStory(story)}
          />
      );
      break;
      case 1:
      currentTab = (
        <ExploreTab
          isLoading={this.state.isExploreTabLoading}
          onSelectStory={(story) => this.changeStory(story)}
          />
      );
      break;
      case 2:
      currentTab = (
        <LiveTab
          isLoading={this.state.isLiveTabLoading}
          onSelectStory={(story) => this.changeStory(story)}
          />
      );
      break;
      case 3:
      currentTab = (
        <LocationsTab
          isLoading={this.state.isLiveTabLoading}
          onSelectStory={(story) => this.changeStory(story)}
          />
      );
      break;
    }
    
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
              {!this.state.isSearchActive &&
                <IconButton
                  tooltip="Search"
                  tooltipPosition="bottom-center"
                  onClick={()=> {
                    this.setState({
                      currentStory: null,
                      isSearchActive: true
                    });
                    AnalyticsUtil.track("Search Button Clicked"); 
                  }}>
                  <ActionSearchIcon color={TAB_TEXT_COLOR_DARK_GRAY}/>
                </IconButton>
              }
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
          <div
            style={styles.tabs}
            className="tabs-container">
            {currentTab}
          </div>
          <BottomNavigation selectedIndex={this.state.currentTabIndex} style={styles.bottomNavigation}>
            <BottomNavigationItem
              label="Friends"
              icon={<PeopleIcon/>}
              onTouchTap={() => this.handleTabChange(0)}
              />
            <BottomNavigationItem
              label="Explore"
              icon={<ActionExploreIcon/>}
              onTouchTap={() => this.handleTabChange(1)}
              />
            <BottomNavigationItem
              label="Top Live"
              icon={<LiveTvIcon/>}
              onTouchTap={() => this.handleTabChange(2)}
              />
            <BottomNavigationItem
              label="Locations"
              icon={<PlaceIcon/>}
              onTouchTap={() => this.handleTabChange(3)}
              />
          </BottomNavigation>
          
        </div>
        <div style={styles.friendsStoryContainer}>
          {this.state.currentStory != null && this.state.currentStory}
          {this.state.isSearchActive && <SearchPage onSelectStory={(story) => this.changeStory(story)}/>}
          
          <Snackbar
            open={this.state.isSnackbarActive}
            autoHideDuration={3000}
            onRequestClose={() => this.handleSnackbarRequestClose()}
            message="No story available"/>
          
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
