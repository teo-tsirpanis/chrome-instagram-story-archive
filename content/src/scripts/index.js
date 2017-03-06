import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'react-chrome-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import StoriesTray from './components/app/StoriesTray';
import InstagramApi from '../../../utils/InstagramApi';
import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from "../../../node_modules/photoswipe/dist/photoswipe-ui-default.min.js";
import "../../../node_modules/photoswipe/dist/photoswipe.css";
import "../../../node_modules/photoswipe/dist/default-skin/default-skin.css";
import moment from 'moment';
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
injectPswpContainer();

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
  // proxyStore.dispatch({type: 'story-clicked-alias', currentStoryItem: currentStoryItem});
  if(currentStoryItem.items) {
    // if there are new Story images available, show them in the gallery
    showImageGallery(currentStoryItem.items);
  } else {
    // retrieve the user's Story and show them in the gallery
    InstagramApi.getStory(currentStoryItem.id, (story) => {
      showImageGallery(story.items);
    });
  }
}

// used to initialize and show the Story image gallery
function getPswpElement(callback) {
  // if photoswipe element exists, return it
  if($('#pswp').length) {
    callback(document.getElementById('pswp'));
  } else {
    // photoswipe element doesn't exist, inject it
    $("#pswpContainer").load(chrome.extension.getURL("html/photoswipe.html"), function() {
      callback(document.getElementById('pswp'));
    });
  }
}

// inject div container to host the Story image gallery
function injectPswpContainer() {
  var pswpContainer = document.createElement("div");
  pswpContainer.setAttribute("id", "pswpContainer");
  document.body.appendChild(pswpContainer);
}

// displays image gallery for Story images
function showImageGallery(storyItems) {
  
  // retrieve the injected pswpElement
  getPswpElement(function(pswpElement) {
    var slides = [];
    
    storyItems.map((storyItem, i) => {
      // if videos are available, create a new HTML slide containing the Story video
      if(storyItem['video_versions']) {
        var video = storyItem['video_versions'][0];
        
        var storyVideo = document.createElement('video');
        var source = document.createElement("source");
        storyVideo.setAttribute("controls", true);
        if(i === 0) { storyVideo.setAttribute("autoplay", true); }
        source.src = video['url'];
        storyVideo.appendChild(source);
        $(storyVideo).addClass('videoStoryItem');
        $(storyVideo).addClass('pswp__video active');
        $(storyVideo).css('position', 'absolute');
        
        slides.push({
          html: storyVideo,
          storyItem: storyItem
        });
      } else {
        // create a normal slide with the Story image
        var image = storyItem['image_versions2']['candidates'][0];
        var url = image['url'].replace("http://", "https://");
        slides.push({
          src: url,
          msrc: url,
          w: image['width'],
          h: image['height'],
          storyItem: storyItem
        });
      }
    });
    
    var options = {
      closeOnScroll: false,
      shareEl: false
    };
    
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, slides, options);
    
    // update the Story author's username and profile picture
    gallery.listen('afterChange', function() {
      
      var currItem = $(gallery.currItem.container);
      
      var storyAuthorImage = currItem.find('.storyAuthorImage');
      var storyAuthorUsername = currItem.find('.storyAuthorUsername');
      
      // only add the Story author's username/profile picture to the current slide if it doesn't already exist
      if(storyAuthorImage.length == 0 && storyAuthorUsername.length == 0) {
        storyAuthorImage = document.createElement('img');
        storyAuthorImage.setAttribute("class", "storyAuthorImage");
        storyAuthorImage.style.position = 'absolute';
        
        storyAuthorUsername = document.createElement('span');
        storyAuthorUsername.setAttribute("class", "storyAuthorUsername");
        storyAuthorUsername.style.position = 'absolute';
        
        $(currItem).append(storyAuthorImage);
        $(currItem).append(storyAuthorUsername);
      }
      
      $(storyAuthorImage).attr("src", gallery.currItem.storyItem['user']['profile_pic_url']);
      $(storyAuthorUsername).text(gallery.currItem.storyItem['user']['username'] + " - " + moment.unix(gallery.currItem.storyItem['taken_at']).fromNow());
      
      if(gallery.currItem.storyItem['video_versions']) {
        $(storyAuthorImage).css("top", "45px");
        $(storyAuthorUsername).css("top", "55px");
      }
      
    });
    
    // handle playing/pausing videos while traversing the gallery
    gallery.listen('beforeChange', function() {
      var currItem = $(gallery.currItem.container);
      // remove 'active' class from any videos
      $('.pswp__video').removeClass('active');
      // add 'active' class to the currently playing video
      var currItemIframe = currItem.find('.pswp__video').addClass('active');
      // for each video, pause any inactive videos, and play the active video
      $('.pswp__video').each(function() {
        if (!$(this).hasClass('active')) {
          $(this)[0].pause();
          $(this)[0].currentTime = 0;
        } else {
          $(this)[0].play();
        }
      });
    });
    
    // handle pausing videos when the galley is closed
    gallery.listen('close', function() {
      $('.pswp__video').each(function() {
        $(this)[0].pause();
      });
    });
    
    gallery.init();
    
  });
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