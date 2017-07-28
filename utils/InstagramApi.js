import {
  API_BASE,
  FEED_API,
  TAG_FEED_API,
  LOCATION_FEED_API,
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

// fetch the story for a particular hashtag
function getHashtagStory(hashtag, callback) {
  return fetch(`${TAG_FEED_API}${hashtag}/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response["story"];
  }).then(callback);
}

// fetch the story for a particular location
function getLocationStory(locationId, callback) {
  return fetch(`${LOCATION_FEED_API}${locationId}/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response["story"];
  }).then(callback);
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

// search for a query and return the top results for each category
function topSearch(query, callback) {
  return fetch(`${API_BASE}fbsearch/topsearch/?&q=${query}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// search for a particular user by username
function searchForUser(username, callback) {
  return fetch(`${API_BASE}users/search/?&q=${username}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response.users;
  }).then(callback);
}

// search for a particular location by name
function searchForLocation(location, callback) {
  return fetch(`${API_BASE}fbsearch/places/?query=${location}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response.items;
  }).then(callback);
}

// search for a particular hashtag by name
function searchForHashtag(hashtag, callback) {
  return fetch(`${API_BASE}tags/search/?q=${hashtag}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response.results;
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

// fetch the requesting user's explore feed
function getExploreFeed(callback) {
  return fetch(EXPLORE_API, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response;
  }).then(callback);
}

// parse the suggested stories from the explore feed
function getExploreStories(exploreFeed, callback) {
  return exploreFeed["items"][0]["stories"];
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

// fetch the comments for a post-live video
function getPostLiveVideoComments(id, timestamp, callback) {
  var LIVE_API_URL = `${LIVE_API}${id}/get_post_live_comments/?starting_offset=${timestamp}&encoding_tag=instagram_dash_remuxed`;
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
  getHashtagStory,
  getLocationStory,
  getFriendStories,
  getExploreFeed,
  getExploreStories,
  getTopLiveVideos,
  getLiveVideoInfo,
  getLiveVideoComments,
  getPostLiveVideoComments,
  getUserInfo,
  searchForUser,
  searchForHashtag,
  searchForLocation
};

export default InstagramApi;