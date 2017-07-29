import React from 'react';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import FileSaver from 'file-saver';
import moment from 'moment';
import AnalyticsUtil from './AnalyticsUtil';
import InstagramApi from './InstagramApi';
import XLinkController from "../node_modules/dashjs/src/streaming/controllers/XlinkController.js";
import DashParser from "../node_modules/dashjs/src/dash/parser/DashParser.js";

// returns the "slide" object the StoryGallery in the Story component uses
export function getStorySlide(story, callback) {
  const storyMedia = story['items'].map((media, key) => {
    const url = getMediaItemUrl(media);
    if(isVideo(url)){
      return {
        id: media.id,
        index: key,
        original: url,
        renderItem: renderStoryVideoItem
      };
    } else {
      return {
        id: media.id,
        index: key,
        original: url,
        renderItem: renderStoryImage
      };
    }
  });

  var storySlide = {
    key: story.id,
    media: storyMedia,
    story: story
  };

  callback(storySlide);
}

// fetches the appropriate story and returns it (or downloads if shouldDownload is true)
export function fetchStory(selectedStory, shouldDownload, callback) {
  if(selectedStory.location) {
    InstagramApi.getLocationStory(selectedStory.location.pk, (story) => {
      if(story) {
        if(shouldDownload) {
          downloadStory(story, () => callback(true));
        } else {
          getStorySlide(story, (storySlide) => callback(storySlide));
        }
      } else {
        callback(null);
      }
    });
  } else if(selectedStory.name) {
    InstagramApi.getHashtagStory(selectedStory.name, (story) => {
      console.log(story);
      if(story) {
        if(shouldDownload) {
          downloadStory(story, () => callback(true));
        } else {
          getStorySlide(story, (storySlide) => callback(storySlide));
        }
      } else {
        callback(null);
      }
    });
  } else {
    InstagramApi.getStory(selectedStory.id, (story) => {
      if(story && story.items.length > 0) {
        if(shouldDownload) {
          downloadStory(story, () => callback(true));
        } else {
          getStorySlide(story, (storySlide) => callback(storySlide));
        }
      } else {
        callback(null);
      }
    });
  }
}

// downloads a zip file containing the user's Story
export function downloadStory(trayItem, callback) {
  var zip = new JSZip();
  trayItem.items.map((storyItem, i) => {
    var mediaItemUrl = getMediaItemUrl(storyItem);
    // downloads each Story image/video and adds it to the zip file
    zip.file(getStoryFileName(storyItem, mediaItemUrl), urlToPromise(mediaItemUrl), {binary:true});
  });
  // generate zip file and start download
  zip.generateAsync({type:"blob"})
  .then(function(content) {
    FileSaver.saveAs(content, getZipFileName(trayItem));
    AnalyticsUtil.track("Download Story", AnalyticsUtil.getStoryObject(trayItem));
    if(callback) {
      callback();
    }
  });
}

// promises to download the file before zipping it
function urlToPromise(url) {
  return new Promise(function(resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if(err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// returns the name of the zip file to download with format: (username-timestamp.zip)
function getZipFileName(trayItem) {
  var user, name;
  user = (trayItem.user) ? trayItem.user : trayItem.owner;
  name = (user.username) ? user.username : user.name;
  return name + "-" + moment().format() + ".zip";
}

// returns the name of the image/video file to add to the zip file
function getStoryFileName(storyItem, mediaItemUrl) {
  return storyItem['id'] + (((mediaItemUrl.includes(".mp4")) ? ".mp4" : ".jpg"));
}

function renderStoryVideoItem(item) {
  return (
    <div>
      <video
        style={{width: '100%'}}
        id={item.id}
        src={item.original}
        preload="metadata"
        />
    </div>
  )
}

function renderStoryImage(item) {
  return (
    <div>
      <img
        style={{width: '100%'}}
        src={item.original}
        />
    </div>
  )
}

// returns a parsed manifest object from a dash manifest string representation
export function getLiveVideoManifestObject(manifest) {
  const parser = DashParser().create();
  const xlink = XLinkController().create({});
  var mpd = parser.parse(manifest, xlink);
  mpd.loadedTime = new Date();
  xlink.resolveManifestOnLoad(mpd);
  return mpd;
}

// returns the URL of an audio mp4 file for a post-live video
export function getLiveVideoMp4AudioUrl(manifest, callback) {
  var manifestObject = getLiveVideoManifestObject(manifest);
  var adaptationSet = manifestObject.Period_asArray[0].AdaptationSet_asArray;
  callback(adaptationSet[0].Representation.BaseURL);
}

// returns the URL of a video mp4 file for a post-live video
export function getLiveVideoMp4VideoUrl(manifest, callback) {
  var manifestObject = getLiveVideoManifestObject(manifest);
  var adaptationSet = manifestObject.Period_asArray[0].AdaptationSet_asArray;
  callback(adaptationSet[1].Representation.BaseURL);
}

// returns an optimized URL format for the image/video
export function getMediaItemUrl(storyItem) {
  var mediaItem;
  if(storyItem['video_versions']) {
    mediaItem = storyItem['video_versions'][0];
  } else {
    mediaItem = storyItem['image_versions2']['candidates'][0];
  }
  var secureUrl = mediaItem['url'].replace("http://", "https://");
  return secureUrl.split("?")[0]; // leave out ig_cache_key
}

// extracts and returns the id for the live video because the id on the object itself is sometimes wrong
export function getLiveVideoId(liveVideoItem) {
  var playbackUrl = liveVideoItem.dash_playback_url;
  var link = playbackUrl.split(".mpd")[0];
  return link.split("dash-hd/")[1];
}

export function getTimeElapsed(timestamp) {
  return moment.unix(timestamp).fromNow();
}

export function isVideo(url) {
  return url.indexOf('.mp4') > -1;
}
