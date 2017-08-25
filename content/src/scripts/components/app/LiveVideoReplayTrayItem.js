import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import VideoLibraryIcon from 'material-ui/svg-icons/av/video-library';
import MusicLibraryIcon from 'material-ui/svg-icons/av/library-music';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import {getTimeElapsed, getLiveVideoMp4VideoUrl, getLiveVideoMp4AudioUrl, downloadStory} from '../../../../../utils/Utils';
import LiveVideoReplayDownloadDialog from './LiveVideoReplayDownloadDialog';

class LiveVideoReplayTrayItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLeftClickMenuActive: false,
      leftClickMenuAnchor: null,
      isRightClickMenuActive: false,
      rightClickMenuAnchor: null,
      isDownloadLiveVideoDialogOpen: false,
      isDownloadingStory: false
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
  
  handleRightClickMenuRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };
  
  
  handleLeftClickMenuRequestClose() {
    this.setState({
      isLeftClickMenuActive: false,
    });
  };
  
  onViewUserStory() {
    if(this.props.type === 'userProfile') {
      if(this.props.storyItem === null) {
        this.props.onViewLiveVideoReplay();
      } else {
        this.setState({
          leftClickMenuAnchor: this.refs.TrayItemContainer,
          isLeftClickMenuActive: true
        });
      }
    } else {
      this.props.onViewLiveVideoReplay(this.props.liveItem);
    }
  }
  
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
      trayItemUser: {
        margin: '0 auto'
      },
      trayItemUsername: {
        marginTop: '10px',
        fontSize: '14px',
        color: (this.props.liveItem.last_seen_broadcast_ts === 0) ? '#262626' : "#999999"
      },
      livePulse: {
        position: 'absolute',
        zIndex: 1
      },
    }  
    
    var seenClass = (this.props.liveItem.last_seen_broadcast_ts === 0) ? "unseenStoryItem" : "seenStoryItem";
    var liveVideoReplayIcon = (this.props.liveItem.last_seen_broadcast_ts === 0) ? chrome.extension.getURL('img/icon_post_live.png') : chrome.extension.getURL('img/icon_post_live_seen.png');
    var isUserProfile = this.props.type === 'userProfile';
    
    const liveVideoDownloadCards = this.props.liveItem.broadcasts.map((liveVideoItem, key) => {
      return (
        <Card style={{margin: '5px auto'}}>
          <CardHeader
            style={{display: 'inline-block'}}
            title={"Published " + getTimeElapsed(liveVideoItem.published_time)}
            subtitle={"Expiring " + getTimeElapsed(liveVideoItem.expire_at)}
            avatar={liveVideoItem.broadcast_owner.profile_pic_url}
            />
          <CardMedia>
            <img src={liveVideoItem.cover_frame_url} alt="" style={{height: '250px', objectFit: 'contain'}}/>
          </CardMedia>
          <CardActions>
            <FlatButton label="Open Audio URL" onClick={() => {
              var selectedStory = this.props.liveItem.broadcasts[0];
              getLiveVideoMp4AudioUrl(selectedStory.dash_manifest, (videoUrl) => {
                window.open(videoUrl);
              });
              }} />
              <FlatButton label="Open Video URL" onClick={() => {
                var selectedStory = this.props.liveItem.broadcasts[0];
                getLiveVideoMp4VideoUrl(selectedStory.dash_manifest, (videoUrl) => {
                  window.open(videoUrl);
                });
                }} />
              </CardActions>
        </Card>
      )});
    
    return (
      <div ref="TrayItemContainer" style={isUserProfile ? styles.trayItemUser : styles.trayItemContainer} onClick={() => this.onViewUserStory()}>
        {this.state.isDownloadingStory && <CircularProgress className="center-div" style={{position: 'absolute'}} size={190} />}
        <div className={((isUserProfile) ? "liveUserItemImage" : "liveTrayItemImage") + " " + seenClass}>
          <img className={((isUserProfile) ? "liveUserItemIcon" : "liveTrayItemIcon") + " " + "center-div"} src={this.props.liveItem.user.profile_pic_url}/>
          <div className={((isUserProfile) ? "liveUserItemBlackCircle" : "liveTrayItemBlackCircle") + " " + "center-div"}></div>
          {this.props.liveItem.last_seen_broadcast_ts === 0 && <span className={((isUserProfile) ? "pulseUserItem" : "pulseTrayItem") + " " + "center-div"} style={styles.livePulse}></span>}
          <img src={liveVideoReplayIcon} className={((isUserProfile) ? "liveVideoReplayIconUser" : "liveVideoReplayIconTray") + " " + "center-div"}/>
        </div>
        
        {!isUserProfile &&
          <span style={styles.trayItemUsername}>{this.props.liveItem.user.username.substr(0, 10) + (this.props.liveItem.user.username.length > 10 ? '…' : '')}</span>
        }
        
        <Popover
          open={this.state.isRightClickMenuActive}
          anchorEl={this.state.rightClickMenuAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.handleRightClickMenuRequestClose()}>
          <Menu>
            {this.props.storyItem !== null && isUserProfile &&
              <MenuItem
                primaryText="Download Story"
                leftIcon={<DownloadIcon />} 
                onClick={() => {
                  this.handleRightClickMenuRequestClose();
                  this.setState({isDownloadingStory: true});
                  downloadStory(this.props.storyItem, () => {
                    this.setState({isDownloadingStory: false});
                  });
                }}
                />
            }
            <MenuItem
              primaryText="Download Live Video"
              leftIcon={<DownloadIcon />} 
              onClick={() => {
                this.handleRightClickMenuRequestClose();
                this.setState({isDownloadLiveVideoDialogOpen: true});
              }}
              />
          </Menu>
        </Popover>
        
        
        <Popover
          open={this.state.isLeftClickMenuActive}
          anchorEl={this.state.leftClickMenuAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.handleLeftClickMenuRequestClose()}>
          <Menu>
            <MenuItem
              primaryText="View Story"
              onClick={() => {
                this.handleLeftClickMenuRequestClose();
                this.props.onViewUserStory(this.props.storyItem);
              }}
              />
            <MenuItem
              primaryText="Watch Live Video"
              onClick={() => {
                this.handleLeftClickMenuRequestClose();
                this.props.onViewLiveVideoReplay();
              }}
              />
          </Menu>
        </Popover>
        
        <LiveVideoReplayDownloadDialog
          isOpen={this.state.isDownloadLiveVideoDialogOpen}
          liveVideoReplays={this.props.liveItem.broadcasts}
          onRequestClose={() => this.setState({isDownloadLiveVideoDialogOpen: false})}
          />
        
    
      </div>
    )
  }
}

export default LiveVideoReplayTrayItem;
