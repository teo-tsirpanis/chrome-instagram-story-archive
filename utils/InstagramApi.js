import {
  API_BASE,
  FEED_API,
  EXPLORE_API,
  TOP_LIVE_API,
  LIVE_API
} from './Constants';

// fetch a particular user's story
function getStory(userId, callback) {
  return fetch(`${FEED_API}user/${userId}/reel_media/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// fetch a particular user's information by their id
function getUserInfo(userId, callback) {
  return fetch(`${API_BASE}users/${userId}/info/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// search for a particular user by username
function searchForUser(username, callback) {
  return fetch(`${API_BASE}users/search/?is_typehead=true&q=${username}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    var accounts = response.users;
    return accounts.find(function(account) {
      return account.username === username;
    });
  }).then(callback);
}

// fetch the requesting user's story tray for their friends' stories
function getFriendStories(callback) {
  return fetch(`${FEED_API}reels_tray/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// fetch the requesting user's story tray for their suggested stories
function getExploreStories(callback) {
  return fetch(EXPLORE_API, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response["items"][0]["stories"];
  }).then(callback);
}

// fetch the top live videos
function getTopLiveVideos(callback) {
  return fetch(TOP_LIVE_API, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// fetch the comments for a live video
function getLiveVideoComments(id, timestamp, callback) {
  var LIVE_API_URL = `${LIVE_API}${id}/get_comment/`;
  if(timestamp != null) {
    LIVE_API_URL = LIVE_API_URL + `?last_comment_ts=${timestamp}`;
  }
  return fetch(LIVE_API_URL, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// fetch the information for a particular live video
function getLiveVideoInfo(id, callback) {
  return fetch(`${LIVE_API}${id}/info/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error);
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}

const InstagramApi = {
  getStory,
  getFriendStories,
  getExploreStories,
  getTopLiveVideos,
  getLiveVideoInfo,
  getLiveVideoComments,
  getUserInfo,
  searchForUser
};

export default InstagramApi;