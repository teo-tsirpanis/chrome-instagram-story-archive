import React, { Component } from 'react';

class LiveVideoTrayItem extends Component {
  
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
        color: '#262626'
      },
      trayItemIcon: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        zIndex: 2
      },
      liveVideoReplayIcon: {
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
    
    var isUserProfile = this.props.type === 'userProfile';
    
    return (
      <div ref="TrayItemContainer" style={isUserProfile ? styles.trayItemUser : styles.trayItemContainer} onClick={() => this.props.onViewLiveVideo(this.props.liveItem)}>
        <div className={((isUserProfile) ? "liveUserItemImage" : "liveTrayItemImage") + " " + "unseenStoryItem"}>
          <img className={((isUserProfile) ? "liveUserItemIcon" : "liveTrayItemIcon") + " " + "center-div"} src={this.props.liveItem.broadcast_owner.profile_pic_url}/>
          <div className={((isUserProfile) ? "liveUserItemBlackCircle" : "liveTrayItemBlackCircle") + " " + "center-div"}></div>
          <span className={((isUserProfile) ? "pulseUserItem" : "pulseTrayItem") + " " + "center-div"}></span>
          <img src={chrome.extension.getURL('img/icon_live.png')} className={((isUserProfile) ? "liveVideoReplayIconUser" : "liveVideoReplayIconTray") + " " + "center-div"}/>
        </div>
        
        {!isUserProfile &&
        <span style={styles.trayItemUsername}>{this.props.liveItem.broadcast_owner.username.substr(0, 10) + (this.props.liveItem.broadcast_owner.username.length > 10 ? '…' : '')}</span>
        }
      </div>
    )
  }
}

export default LiveVideoTrayItem;
