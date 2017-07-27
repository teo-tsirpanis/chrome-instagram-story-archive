import {MIXPANEL_TOKEN, AMPLITUDE_TOKEN} from './Constants';
import InstagramApi from './InstagramApi';

export function track(eventName, properties) {
  if(typeof mixpanel !== "undefined") {
    mixpanel.track(eventName, properties);
  }
  if(typeof amplitude !== "undefined") {
    amplitude.getInstance().logEvent(eventName, properties);
  }
}

// extract the meaningful data from the story for analytics purposes
export function getStoryObject(story) {
  if(story.location) {
    var location = story.location;
    return {
      story: {
        id: story.id,
        itemsLength: (story.items) ? story.items.length : null,
        location: {
          id: location.pk,
          name: location.name
        }
      }
    }
  } else {
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

export function identifyUser(cookies) {
  var userId = cookies.ds_user_id;
  if(userId) {
    InstagramApi.getUserInfo(userId, (userInfo) => {
      var user = userInfo.user;
      if(typeof mixpanel !== "undefined") {
        mixpanel.identify(userId);
      }
      if(typeof amplitude !== "undefined") {
        amplitude.getInstance().setUserId(userId);
        amplitude.getInstance().setUserProperties({
          id: userId,
          username: user.username,
          fullName: user.full_name,
          mediaCount: user.media_count,
          followerCount: user.follower_count,
          followingCount: user.following_count,
          isVerified: user.is_verified
        });
      }
    });
  }
}

export function initializeMixpanel(cookies) {
  if(MIXPANEL_TOKEN !== null) {
    (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
    for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
    mixpanel.init(MIXPANEL_TOKEN, {api_host:"https://api.mixpanel.com"});
    identifyUser(cookies);
  }
}

export function initializeAmplitude(cookies) {
  if(AMPLITUDE_TOKEN !== null) {
    (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script");r.type="text/javascript";
    r.async=true;r.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-3.0.1-min.gz.js";
    r.onload=function(){e.amplitude.runQueuedFunctions()};var i=t.getElementsByTagName("script")[0];
    i.parentNode.insertBefore(r,i);function s(e,t){e.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
      return this}}var o=function(){this._q=[];return this};var a=["add","append","clearAll","prepend","set","setOnce","unset"];
      for(var u=0;u<a.length;u++){s(o,a[u])}n.Identify=o;var c=function(){this._q=[];return this;
      };var p=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"];
      for(var l=0;l<p.length;l++){s(c,p[l])}n.Revenue=c;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId"];
      function v(e){function t(t){e[t]=function(){e._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
      }}for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){e=(!e||e.length===0?"$default_instance":e).toLowerCase();
      if(!n._iq.hasOwnProperty(e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]};e.amplitude=n;
    })(window,document);
    amplitude.getInstance().init(AMPLITUDE_TOKEN);
    identifyUser(cookies);
  }
}

const AnalyticsUtil = {
  track,
  getStoryObject,
  getLiveVideoObject,
  initializeMixpanel,
  initializeAmplitude
}

export default AnalyticsUtil;