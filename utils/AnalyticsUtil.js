import {MIXPANEL_TOKEN} from './Constants';

export function track(eventName, properties) {
  if(typeof mixpanel !== "undefined") {
    mixpanel.track(eventName, properties);
  }
}

// extract the meaningful data from the story for analytics purposes
export function getStoryObject(story) {
  var storyUser = (story.user) ? story.user : story.broadcast_owner;
  return {
    story: {
      id: story.id,
      itemsLength: (story.items) ? story.items.length : null,
      user: {
        id: storyUser.pk,
        username: storyUser.username
      }
    }
  }
}

// extract the meaningful data from the live video for analytics purposes
export function getLiveVideoObject(liveVideo) {
  return {
    liveVideo: {
      id: liveVideo.id,
      mediaId: liveVideo.media_id,
      broadcastStatus: liveVideo.broadcast_status,
      broadcastMessage: liveVideo.broadcast_message,
      publishedTime: liveVideo.published_time,
      viewerCount: liveVideo.viewer_count,
      user: {
        id: liveVideo.broadcast_owner.pk,
        username: liveVideo.broadcast_owner.username
      }
    }
  }
}

export function initializeMixpanel() {
  if(MIXPANEL_TOKEN !== null) {
    (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
    for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
    mixpanel.init(MIXPANEL_TOKEN, {api_host:"https://api.mixpanel.com"});
  }
}

const AnalyticsUtil = {
  track,
  getStoryObject,
  getLiveVideoObject,
  initializeMixpanel
}

export default AnalyticsUtil;