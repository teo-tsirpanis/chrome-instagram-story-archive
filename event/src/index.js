import {applyMiddleware, createStore} from 'redux';
import rootReducer from './reducers';

import {alias, wrapStore} from 'react-chrome-redux';
import ReduxThunk from 'redux-thunk';

var instagramCookies = {};
var DOMAIN_URL = "https://www.instagram.com";

// TODO: use aliases properly
const aliases = {
  'story-clicked-alias': (originalAction) => {
    
    store.dispatch({
      type: 'SET_CURRENT_STORY_ITEM',
      currentStoryItem: originalAction.currentStoryItem
    });
    
    launchPopup();
    
    return {
      type: 'story-clicked-alias'
    };
  },
  'launch-popup': (originalAction) => {
    
    store.dispatch({
      type: 'SET_IS_FULL_POPUP',
      isFullPopup: true
    });
    
    launchPopup();
    
    return {
      type: 'launch-popup'
    };
  },
};

const middleware = [
  alias(aliases),
  ReduxThunk
];

const store = createStore(rootReducer,
  applyMiddleware(...middleware)
);

wrapStore(store, {
  portName: 'chrome-ig-story'
});

loadCookies();

function launchPopup() {
  chrome.tabs.create({
    url: chrome.extension.getURL('html/popup.html'),
    active: false
  }, function(tab) {
    chrome.windows.create({
      tabId: tab.id,
      type: 'popup',
      focused: true
    });
  });
}

function loadCookies() {
  getCookies(function(cookies) {
    instagramCookies = cookies; 
    store.dispatch({
      type: 'SET_COOKIES',
      cookies: cookies
    });
  });
}

// get Instagram cookies for auth
function getCookies(callback) {
  var cookieToReturn = {};
  chrome.cookies.get({url: DOMAIN_URL, name: 'ds_user_id'}, function(cookie) {
    if(cookie) { cookieToReturn.ds_user_id = cookie.value; }
    chrome.cookies.get({url: DOMAIN_URL, name: 'sessionid'}, function(cookie) {
      if(cookie) { cookieToReturn.sessionid = cookie.value; }
      chrome.cookies.get({url: DOMAIN_URL, name: 'csrftoken'}, function(cookie) {
        if(cookie) { cookieToReturn.csrftoken = cookie.value; }
        if(callback) {
          callback(cookieToReturn);
        }
      });
    });
  });
}

// send back cookies so we can check if they are available before we make requests
function sendCookies(instagramCookies) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {instagramCookies: JSON.stringify(instagramCookies)});
  });
}

// listen for the content script to send us a message so we can send back cookies
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request === "loadStories") {
      getCookies(function(cookies) {
        instagramCookies = cookies;  
        sendCookies(instagramCookies);
      });
    }
  });
  
  // listen for tab changes (i.e. AJAX request back to the home page) so we can re-inject
  chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (change.status == "complete" && tab.active) {
      sendCookies(instagramCookies);
    }
  });
  
  // hook into web request and modify headers before sending the request
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
      var headers = info.requestHeaders;
      var shouldInjectHeaders = true;
      
      // // if auth cookies are missing, doesn't inject them
      if(!(instagramCookies.ds_user_id && instagramCookies.sessionid)) {
        shouldInjectHeaders = false;
      }
      
      if(shouldInjectHeaders) {
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          // don't inject headers if an internal XMLHttpRequest is made (i.e. clicking the profile tab)
          if(header.name.toLowerCase() == 'x-requested-with') {
            shouldInjectHeaders = false;
          }
        }
      }
      
      // only inject auth cookies for requests relating to the Instagram Story tray,
      // tampering with the headers on any other request will give you errors
      if(shouldInjectHeaders) {
        headers.push({name:"x-ig-capabilities",value:"3w=="});
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          if(header.name.toLowerCase() == 'referer') {
            if(header.value != "https://www.instagram.com/") {
              shouldInjectHeaders = false;
            }
          }
          if (header.name.toLowerCase() == 'user-agent' && shouldInjectHeaders) { 
            header.value = 'Instagram 10.3.2 (iPhone7,2; iPhone OS 9_3_3; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/420+';
          }
          if (header.name.toLowerCase() == 'cookie' && shouldInjectHeaders) { 
            // add auth cookies to authenticate API requests
            var cookies = header.value;
            cookies = "ds_user_id=" + instagramCookies.ds_user_id + "; sessionid=" + instagramCookies.sessionid + "; csrftoken=" + instagramCookies.csrftoken + ";";
            + cookies;
            header.value = cookies;
          }
        }
      }
      return {requestHeaders: headers};
    },
    {
      urls: [
        "*://*.instagram.com/*"
      ],
      types: ["xmlhttprequest"]
    },
    ["blocking", "requestHeaders"]
  );