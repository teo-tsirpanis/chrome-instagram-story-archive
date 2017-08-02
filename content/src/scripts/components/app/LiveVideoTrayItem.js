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
    
    return (
      <div ref="TrayItemContainer" style={styles.trayItemContainer}>
        <div className={"liveTrayItemImage unseenStoryItem"}>
          <img className="center-div" style={styles.trayItemIcon} src={this.props.storyItem.broadcast_owner.profile_pic_url} onClick={() => this.props.onViewUserStory(this.props.storyItem)}/>
          <div className="center-div" style={styles.blackCircle}></div>
          <span className="pulse center-div" style={styles.livePulse}></span>
          <img src={chrome.extension.getURL('img/icon_live.png')} className="center-div" style={styles.postLiveIcon} color='#a31391'/>
        </div>
        <span style={styles.trayItemUsername}>{this.props.storyItem.broadcast_owner.username.substr(0, 10) + (this.props.storyItem.broadcast_owner.username.length > 10 ? '…' : '')}</span>
      </div>
    )
  }
}

export default LiveVideoTrayItem;
