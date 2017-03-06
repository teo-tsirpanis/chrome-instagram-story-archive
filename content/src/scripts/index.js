import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'react-chrome-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import StoriesTray from './components/app/StoriesTray';
import InstagramApi from '../../../utils/InstagramApi';
import $ from 'jquery';

import {
  INSTAGRAM_FEED_CLASS_NAME,
  INSTAGRAM_EXPLORE_FEED_CLASS_NAME,
  INSTAGRAM_USER_IMAGE_CLASS_NAME,
  INSTAGRAM_USER_USERNAME_CLASS_NAME,
  muiTheme
} from '../../../utils/Constants';

var instagramFeed, instagramExploreFeed, instagramUserImage, instagramUserUsername;
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
  instagramUserImage = document.getElementsByClassName(INSTAGRAM_USER_IMAGE_CLASS_NAME)[0];
  instagramUserUsername = document.getElementsByClassName(INSTAGRAM_USER_USERNAME_CLASS_NAME)[0];
  
  if(instagramFeed) {
    injectFriendStories();
  } else if (instagramExploreFeed) {
    injectExploreStories();
  } else if (instagramUserImage) {
    if(!$(instagramUserImage).hasClass("instagramUserImage")) {
      getUserStory(instagramUserImage);
    }
  }
}

// fetch user's Story and inject it into their profile page if it's available
function getUserStory(instagramUserImage) {
  // sharedData is a window variable from Instagram that contains information about the current page
  var sharedData = JSON.parse($('html')[0].outerHTML.split("window._sharedData = ")[1].split(";</script>")[0]);
  var entryData = sharedData['entry_data'];
  var userId;
  
  /*
  * sharedData contains 'ProfilePage' if a user's profile page was loaded by its URL
  * if you click on a profile from the main Instagram feed or from search, an AJAX request will load the profile
  * and sharedData will contain 'FeedPage', not 'ProfilePage'. 
  */
  if(entryData['ProfilePage']) {
    userId = entryData['ProfilePage'][0]['user']['id'];
    InstagramApi.getStory(userId, (story) => {
      injectUserStory(instagramUserImage, story);
    });
  } else if(entryData['FeedPage']) {
    // search for the user since the FeedPage sharedData doesn't have the user's ID 
    var username = instagramUserUsername.innerText;
    InstagramApi.searchForUser(username, (user) => {
      InstagramApi.getStory(user.pk, (story) => {
        injectUserStory(instagramUserImage, story);
      });
    });
  }
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
  if(story.items.length > 0) {
    $(instagramUserImage).addClass('unseenStoryItem');
    $(instagramUserImage).addClass('instagramUserImage');
    instagramUserImage.addEventListener("click", function() {
      onStoryClicked(story);
    });
  }
}

// dispatch the selected story to the store
function onStoryClicked(currentStoryItem) {
  proxyStore.dispatch({type: 'story-clicked-alias', currentStoryItem: currentStoryItem});
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
          <StoriesTray onStoryClicked={(storyId) => onStoryClicked(storyId)} type={type}/>
        </MuiThemeProvider>  
      </Provider>
      , document.getElementById('rcr-anchor'));
    });  
  }