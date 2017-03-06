import React, { Component } from 'react';
import { MediaPlayer } from 'dashjs';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import $ from 'jquery';
import moment from 'moment';
import InstagramApi from '../../../../../utils/InstagramApi';
import VisibilityIcon from 'material-ui/svg-icons/action/visibility';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import {getLiveVideoId} from '../../../../../utils/Utils';

class LiveVideo extends Component {
  constructor(props){
    super(props);
    this.state = {
      liveVideoPlayer: null,
      chatMessagesList: [],
      liveVideoItem: this.props.item,
      updateInfoInterval: null
    }
  }
  
  componentDidMount() {
    this.playLiveVideo();
    // fetch initial set of comments
    this.fetchLiveVideoComments(null);
    
    this.setState({updateInfoInterval: setInterval(function() {
      // update the video information every 8 seconds
      this.updateVideoInformation();
    }.bind(this), 8000)}); 
  }
  
  componentWillUnmount() {
    clearInterval(this.state.updateInfoInterval);
  }
  
  // updates the live viewers count and fetches new comments for the live video
  updateVideoInformation() {
    var lastComment = this.state.chatMessagesList[0];
    this.fetchLiveVideoComments(lastComment != null ? lastComment.created_at : null);
    InstagramApi.getLiveVideoInfo(getLiveVideoId(this.state.liveVideoItem), (liveVideoCommentsResponse) => {
      this.setState({liveVideoItem: liveVideoCommentsResponse});
    });
  }
  
  fetchLiveVideoComments(timestamp) {
    InstagramApi.getLiveVideoComments(getLiveVideoId(this.state.liveVideoItem), timestamp, (liveVideoCommentsResponse) => {
      liveVideoCommentsResponse.comments.slice(0).reverse().map((chatMessage, key) => {
        this.setState({chatMessagesList: [
          ...this.state.chatMessagesList, chatMessage
        ]});
      });
      $('#chatmessages').scrollTop($('#chatmessages')[0].scrollHeight);
    });
  }
  
  playLiveVideo() {
    if(this.state.liveVideoPlayer == null) {
      let url = this.state.liveVideoItem.dash_playback_url;
      let player = MediaPlayer().create();
      player.initialize(document.querySelector('#liveVideoPlayer-' + this.state.liveVideoItem.id), url, true);
      player.getDebug().setLogToBrowserConsole(false);
      player.play();
      this.setState({liveVideoPlayer: player});
    } else {
      this.state.liveVideoPlayer.play();
    }
  }
  
  pauseLiveVideo() {
    if(this.state.liveVideoPlayer != null) {
      this.state.liveVideoPlayer.pause();
    }
  }
  
  onStoryAuthorUsernameClicked() {
    var authorUsername = this.state.liveVideoItem.broadcast_owner.username;
    window.open('https://www.instagram.com/' + authorUsername + '/');
    AnalyticsUtil.track("Live Video Author Username Clicked", {username: authorUsername});
  }
  
  onChatMesssageAuthorUsernameClicked(index) {
    var chatMessageAuthorUsername = this.state.chatMessagesList[index].user.username;
    window.open('https://www.instagram.com/' + chatMessageAuthorUsername + '/');
    AnalyticsUtil.track("Live Video Comment Author Username Clicked", {username: chatMessageAuthorUsername});
  }
  
  render() {
    const styles = {
      chatMessageStyle: {
        fontSize: '12px',
        paddingLeft: '60px',
        paddingTop: '12px',
        paddingRight: '0px',
        paddingBottom: '0px'
      },
      storyAuthorImage: {
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        float: 'left',
        cursor: 'pointer'
      },
      storyAuthorUsername: {
        color: 'white',
        marginLeft: '35px',
        marginTop: '5px',
        position: 'absolute',
        cursor: 'pointer'
      },
      storyAuthorAttribution: {
        zIndex: 4,
        position: 'absolute',
        width: '100%',
        textAlign: 'left'
      },
      closeFullscreenStoryButton: {
        float: 'right',
        color: 'white',
        fontSize: '40px',
        marginRight: '15px',
        fontFamily: 'Roboto-Light',
        padding: '10px',
        marginTop: '-15px',
      },
      liveLabel: {
        float: 'right',
        marginRight: '5px',
        marginTop: '-5px',
        fontSize: '14px'
      },
      liveCountLabel : {
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        borderRadius: '5px',
        float: 'right',
        marginRight: '15px',
        marginTop: '-5px',
        paddingTop: '5px',
        paddingRight: '7px',
        paddingLeft: '7px',
      },
      viewCountSpan: {
        marginTop: '3px',
        marginBottom: '0px',
        fontSize: '12px',
        float: 'left'
      },
      overlayTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 4,
      }
    };
    
    const chatMessageListData = this.state.chatMessagesList.map((chatMessage, key) => {
      return (
        <ListItem
          key={key}
          disabled={true}
          style={styles.chatMessageStyle}
          leftAvatar={<Avatar src={chatMessage.user.profile_pic_url} style={{cursor: 'pointer'}} size={32} onClick={() => this.onChatMesssageAuthorUsernameClicked(key)} />}
          primaryText={chatMessage.user.username}
          secondaryText={
            <p style={{color: 'white', height: 'initial', fontSize: '12px'}}>
              {chatMessage.text}
            </p>
          }
          secondaryTextLines={2}
          />
      )
    });
    
    return (
      <div
        style={{position: 'relative'}}>
        <img src="../img/overlayBottom.png" style={{width: '100%', position: 'absolute', bottom: '0px', height: '229px'}}/>
        <video
          id={"liveVideoPlayer-" + this.state.liveVideoItem.id}
          width="100%"
          poster={this.state.liveVideoItem.cover_frame_url}/>
        
        <div className="overlayTop" style={styles.overlayTop}>
          <img src="../img/overlayTop.png" style={{width: '100%'}} alt=""/>
        </div> 
        
        <div className="storyAuthorAttribution" style={styles.storyAuthorAttribution}>
          <img src={this.state.liveVideoItem.broadcast_owner.profile_pic_url} style={styles.storyAuthorImage} onClick={() => this.onStoryAuthorUsernameClicked()} />
          <p style={styles.storyAuthorUsername} onClick={() => this.onStoryAuthorUsernameClicked()}>{this.state.liveVideoItem.broadcast_owner.username}</p>
          
          <div style={styles.liveCountLabel}>
            <VisibilityIcon color="#ffffff" style={{float: 'left'}} viewBox={'0 0 32 32'}/>
            <p style={styles.viewCountSpan}>{this.state.liveVideoItem.viewer_count}</p>
          </div>
          <span style={styles.liveLabel} className="liveLabel" onClick={() => this.onCloseFullscreenStoryButtonClicked()}>LIVE</span>
        </div>
        <div id="chatbox" className="fadedScroller">
          <div id="chatmessages">
            <List>
              {chatMessageListData}
            </List>
          </div>
        </div>
      </div>
    )
  }
}

export default LiveVideo;
