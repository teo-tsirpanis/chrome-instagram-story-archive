import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'react-chrome-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import StoriesTray from './components/app/StoriesTray';
import UserProfileStoryItem from './components/app/UserProfileStoryItem';
import LocationStoryItem from './components/app/LocationStoryItem';
import HashtagStoryItem from './components/app/HashtagStoryItem';
import InstagramApi from '../../../utils/InstagramApi';
import {getTimeElapsed, downloadStory, getLiveVideoManifestObject} from '../../../utils/Utils';
import { MediaPlayer } from 'dashjs';
import moment from 'moment';
import $ from 'jquery';

import {
  INSTAGRAM_FEED_CLASS_NAME,
  INSTAGRAM_EXPLORE_FEED_CLASS_NAME,
  INSTAGRAM_LOCATION_FEED_CLASS_NAME,
  INSTAGRAM_HASHTAG_FEED_CLASS_NAME,
  INSTAGRAM_HASHTAG_NAME_CLASS_NAME,
  INSTAGRAM_USER_IMAGE_CLASS_NAME_CONTAINER,
  INSTAGRAM_USER_IMAGE_CLASS_NAME,
  INSTAGRAM_USER_USERNAME_CLASS_NAME,
  muiTheme
} from '../../../utils/Constants';

var instagramFeed, instagramExploreFeed, instagramLocationFeed, instagramHashtagFeed, instagramHashtagName, instagramUserImage, instagramUserImageContainer, instagramUserUsername;
const proxyStore = new Store({portName: 'chrome-ig-story'});

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// ** MAIN ENTRY POINT ** //
loadStories();

// tell background.js to load cookies so we can check if they are available before we make requests
function loadStories() {
  chrome.runtime.sendMessage('loadStories');
}

// listen for background.js to send over cookies so we are clear to make requests
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var instagramCookies = JSON.parse(request.instagramCookies);    
  injectContentScript();
});

// determine the proper element that exists on the page and inject the corresponding data for it
function injectContentScript() {
  instagramFeed = document.getElementsByClassName(INSTAGRAM_FEED_CLASS_NAME)[0];
  instagramExploreFeed = document.getElementsByClassName(INSTAGRAM_EXPLORE_FEED_CLASS_NAME)[0];
  instagramLocationFeed = document.getElementsByClassName(INSTAGRAM_LOCATION_FEED_CLASS_NAME)[0];
  instagramHashtagFeed = document.getElementsByClassName(INSTAGRAM_HASHTAG_FEED_CLASS_NAME)[0];
  instagramHashtagName = document.getElementsByClassName(INSTAGRAM_HASHTAG_NAME_CLASS_NAME)[0];
  instagramUserImageContainer = document.getElementsByClassName(INSTAGRAM_USER_IMAGE_CLASS_NAME_CONTAINER)[0];
  instagramUserImage = document.getElementsByClassName(INSTAGRAM_USER_IMAGE_CLASS_NAME)[0];
  instagramUserUsername = document.getElementsByClassName(INSTAGRAM_USER_USERNAME_CLASS_NAME)[0];
  
  if(instagramFeed) {
    injectFriendStories();
  } else if (instagramExploreFeed) {
    injectExploreStories();
  } else if (instagramUserImageContainer) {
    if(!$(instagramUserImageContainer).hasClass("instagramUserImage")) {
      getUserStory(instagramUserImage);
    }
  } else if(instagramLocationFeed) {
    var url = window.location.href;
    var matchGroup = url.match(/([\d]+)/g);
    if(matchGroup[0]) {
      var locationId = matchGroup[0];
      getLocationStory(locationId);
    }
  } else if(instagramHashtagFeed) {
    var hashtag = instagramHashtagName.innerText;
    hashtag = hashtag.replace('#', '');
    getHashtagStory(hashtag);
  }
}

// fetch user's Story and inject it into their profile page if it's available
function getUserStory(instagramUserImage) {
  var username = instagramUserUsername.innerText;
  InstagramApi.searchForUser(username, (users) => {
    var user =  users.find(function(user) {
      return user.username === username;
    });
    InstagramApi.getStory(user.pk, (story) => {
      if(story.reel !== null || story.broadcast || story.post_live_item) {
        injectUserStory(instagramUserImage, story);
      }
    });
  });
}

// fetch location's Story and inject it into its feed page if it's available
function getLocationStory(locationId) {
  InstagramApi.getLocationStory(locationId, (story) => {
    if(story) {
      injectLocationStory(story);
    }
  });
}

// fetch hashtag's Story and inject it into its feed page if it's available
function getHashtagStory(hashtag) {
  InstagramApi.getHashtagStory(hashtag, (story) => {
    if(story) {
      injectHashtagStory(story);
    }
  });
}

// inject the user's friends' story tray in the homepage above the main feed on Instagram.com
function injectFriendStories() {
  if(!document.getElementById("trayContainer")) {
    renderStoryTray('friends');
    InstagramApi.getFriendStories((friendStoriesResponse) => {
      proxyStore.dispatch({
        type: 'SET_FRIEND_STORIES',
        friendStories: friendStoriesResponse
      });
    });
    InstagramApi.getExploreFeed((exploreStoriesResponse) => {
      proxyStore.dispatch({
        type: 'SET_EXPLORE_STORIES',
        exploreStories: InstagramApi.getExploreStories(exploreStoriesResponse)
      });
    });
  }
}

// inject the "suggested stories" recommended by Instagram above the feed on Instagram.com/explore
function injectExploreStories() {
  // only fetch and inject stories if the stories haven't already been injected
  if(!document.getElementById("trayContainer")) {
    renderStoryTray('explore');
    InstagramApi.getExploreStories((exploreStoriesResponse) => {
      proxyStore.dispatch({
        type: 'SET_EXPLORE_STORIES',
        exploreStories: exploreStoriesResponse
      });
    });
  }
}

// inject the story for a particular user while on their profile page e.g. Instagram.com/username
function injectUserStory(instagramUserImage, story) {
  var container = document.getElementsByClassName("_b0acm")[0];
  var storyItemComponent = (
    <UserProfileStoryItem storyItem={story}/>
  );
  renderStoryItem(storyItemComponent, container);
}

// inject the story for a particular location while on its feed page e.g. Instagram.com/explore/locations/locationId
function injectLocationStory(story) {
  const locationStoryIconContainer = document.createElement('div');
  locationStoryIconContainer.id = "locationStoryIconContainer";
  instagramLocationFeed.insertBefore(locationStoryIconContainer, instagramLocationFeed.childNodes[0]);
  var container = document.getElementById("locationStoryIconContainer");
  var storyItemComponent = (
    <LocationStoryItem storyItem={story}/>
  );
  renderStoryItem(storyItemComponent, container);
}

// inject the story for a particular hashtag while on its feed page e.g. Instagram.com/explore/tags/hashtagName
function injectHashtagStory(story) {
  const hashtagStoryIconContainer = document.createElement('div');
  hashtagStoryIconContainer.id = "hashtagStoryIconContainer";
  instagramHashtagFeed.insertBefore(hashtagStoryIconContainer, instagramHashtagFeed.childNodes[0]);
  var container = document.getElementById("hashtagStoryIconContainer");
  var storyItemComponent = (
    <HashtagStoryItem storyItem={story}/>
  );
  renderStoryItem(storyItemComponent, container);
}

function renderStoryItem(storyItemComponent, container) {
  render(
    <Provider store={proxyStore}>
      <MuiThemeProvider muiTheme={muiTheme}>
        {storyItemComponent}
      </MuiThemeProvider>  
    </Provider>, container
  );
}

// render the proper story tray based on its type
function renderStoryTray(type) {
  const anchor = document.createElement('div');
  anchor.id = 'rcr-anchor';
  if(!document.getElementById("rcr-anchor")) {
    switch(type) {
      case 'friends':
      instagramFeed.insertBefore(anchor, instagramFeed.childNodes[0]);
      break;
      case 'explore':
      instagramExploreFeed.insertBefore(anchor, instagramExploreFeed.childNodes[0]);
      break;
    } 
  }
  
  // wait for the store to connect to the background page
  proxyStore.ready().then(() => {
    render(
      <Provider store={proxyStore}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <StoriesTray type={type}/>
        </MuiThemeProvider>  
      </Provider>
      , document.getElementById('rcr-anchor'));
    });  
  }