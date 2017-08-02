import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import VideoLibraryIcon from 'material-ui/svg-icons/av/video-library';
import MusicLibraryIcon from 'material-ui/svg-icons/av/library-music';
import {getLiveVideoMp4VideoUrl, getLiveVideoMp4AudioUrl} from '../../../../../utils/Utils';

class PostLiveVideoTrayItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRightClickMenuActive: false,
      rightClickMenuAnchor: null
    }
  }
  
  componentDidMount() {
    // hijack default right click context menu and display custom context menu
    this.refs.TrayItemContainer.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      this.setState({
        rightClickMenuAnchor: ev.currentTarget,
        isRightClickMenuActive: true
      });
      return true;
    }.bind(this), false);
  }
  
  handleRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };
  
  render() {
    const styles = {
      trayItemContainer: {
        display: 'inline-flex',
        flexDirection: 'column',
        marginLeft: '5px',
        marginRight: '5px',
        marginBottom: '15px',
        marginTop: '15px'
      },
      trayItemUsername: {
        marginTop: '10px',
        fontSize: '14px',
        color: (this.props.storyItem.seen === 0) ? '#262626' : "#999999"
      },
      trayItemIcon: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        zIndex: 2
      },
      postLiveIcon: {
        height: '20px',
        marginTop: '35px',
        zIndex: 3
      },
      livePulse: {
        position: 'absolute',
        zIndex: 1
      },
      blackCircle: {
        background: 'black',
        width: '66px',
        height: '66px',
        position: 'absolute',
        borderRadius: '50%'
      }
    }  
    
    var seenClass = (this.props.storyItem.seen === 0) ? "unseenStoryItem" : "seenStoryItem";
    var postLiveIcon = (this.props.storyItem.seen === 0) ? chrome.extension.getURL('img/icon_post_live.png') : chrome.extension.getURL('img/icon_post_live_seen.png');
    
    return (
      <div ref="TrayItemContainer" style={styles.trayItemContainer} className={(this.props.storyItem.muted) ? "mutedStoryItem" : ""}>
        <div className={"liveTrayItemImage " + seenClass}>
          <img className="center-div" style={styles.trayItemIcon} src={this.props.storyItem.user.profile_pic_url} onClick={() => this.props.onViewUserStory(this.props.storyItem)}/>
          <div className="center-div" style={styles.blackCircle}></div>
          {this.props.storyItem.seen === 0 && <span className="pulse center-div" style={styles.livePulse}></span>}
          <img src={postLiveIcon} className="center-div" style={styles.postLiveIcon} color='#a31391'/>
        </div>
        
        <span style={styles.trayItemUsername}>{this.props.storyItem.user.username.substr(0, 10) + (this.props.storyItem.user.username.length > 10 ? '…' : '')}</span>
        
        <Popover
          open={this.state.isRightClickMenuActive}
          anchorEl={this.state.rightClickMenuAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.handleRequestClose()}>
          <Menu>
            <MenuItem
              primaryText="Open Video URL"
              leftIcon={<VideoLibraryIcon />} 
              onClick={() => {
                var selectedStory = this.props.storyItem.broadcasts[0];
                getLiveVideoMp4VideoUrl(selectedStory.dash_manifest, (videoUrl) => {
                  window.open(videoUrl);
                });
              }}
              />
            <MenuItem
              primaryText="Open Audio URL"
              leftIcon={<MusicLibraryIcon />} 
              onClick={() => {
                var selectedStory = this.props.storyItem.broadcasts[0];
                getLiveVideoMp4AudioUrl(selectedStory.dash_manifest, (videoUrl) => {
                  window.open(videoUrl);
                });
              }}
              />
          </Menu>
        </Popover>
      </div>
    )
  }
}

export default PostLiveVideoTrayItem;
