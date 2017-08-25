import React from 'react';
import StoryGalleryVideo from '../components/app/StoryGalleryVideo';
import StoryGalleryLiveVideo from '../components/app/StoryGalleryLiveVideo';

// returns the "items" array the StoryGallery uses to display a story
export function getStoryGalleryItems(storyItems) {
  var items = [];
  var isStoryGalleryZoomEnabled = true;
  if(storyItems.dash_abr_playback_url) {
    var storyGalleryLiveVideo = (
      <StoryGalleryLiveVideo autoPlay={true} isLiveVideoReplay={false} liveItem={storyItems}/>
    );
    items.push(storyGalleryLiveVideo);
    isStoryGalleryZoomEnabled = false;
  } else {
    storyItems.map((storyItem, i) => {
      if(storyItem.dash_manifest) {
        var storyGalleryLiveVideoReplay = (
          <StoryGalleryLiveVideo autoPlay={(i === 0) ? true : false} liveItem={storyItem} isLiveVideoReplay={true}/>
        );
        items.push(storyGalleryLiveVideoReplay);
        isStoryGalleryZoomEnabled = false;
      } else {
        if(storyItem.video_versions) {
          var video = storyItem.video_versions[0];
          var storyGalleryVideo = (
            <StoryGalleryVideo autoPlay={(i === 0) ? true : false} id={storyItem.id} src={video.url}/>
          );
          items.push(storyGalleryVideo);
        } else {
          var image = storyItem.image_versions2.candidates[0];
          var url = image.url.replace("http://", "https://");
          items.push(url);
        }
        if(storyItems[0] && storyItems[0].video_versions) {
          isStoryGalleryZoomEnabled = false;
        }
      }
    });
  }
  return {
    items: items,
    isStoryGalleryZoomEnabled: isStoryGalleryZoomEnabled
  }
}