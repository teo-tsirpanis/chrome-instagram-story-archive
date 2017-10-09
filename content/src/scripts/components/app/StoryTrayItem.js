import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import InstagramApi from '../../../../../utils/InstagramApi';
import {downloadStory} from '../../../../../utils/Utils';

class StoryTrayItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRightClickMenuActive: false,
      rightClickMenuAnchor: null,
      isDownloadingStory: false
    }
  }
  
  componentDidMount() {
    // hijack default right click context menu and display custom context menu
    this.refs.TrayItemContainer.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      if(!this.state.isDownloadingStory) {
        this.setState({
          rightClickMenuAnchor: ev.currentTarget,
          isRightClickMenuActive: true
        });
      }
      return true;
    }.bind(this), false);
  }
  
  handleRightClickMenuRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };
  
  onDownloadStory() {
    this.handleRightClickMenuRequestClose();
    this.setState({isDownloadingStory: true});
    InstagramApi.getStory(this.props.storyItem.id).then(function(story) {
      downloadStory(story, () => {
        this.setState({isDownloadingStory: false});
      });
    }.bind(this));
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
      trayItemUsername: {
        marginTop: '10px',
        fontSize: '14px',
        color: (this.props.storyItem.seen === 0) ? '#262626' : "#999999"
      },
      storyDownloadProgressIndicator: {
        position: 'absolute',
        marginTop: '-14px',
        marginLeft: '-3px'
      }
    }  
    
    var seenClass = (this.props.storyItem.seen === 0) ? "unseenStoryItem" : "seenStoryItem";
    var user, name;
    user = (this.props.storyItem.user) ? this.props.storyItem.user : this.props.storyItem.owner;
    name = (user.username) ? user.username : user.name;
    
    return (
      <div ref="TrayItemContainer" id={"igs_" + name} style={styles.trayItemContainer} className={(this.props.storyItem.muted) ? "mutedStoryItem" : ""}>
        {this.state.isDownloadingStory && <CircularProgress className="center-div" style={styles.storyDownloadProgressIndicator} size={90} />}
        <img className={"trayItemImage " + seenClass} src={user.profile_pic_url} onClick={() => this.props.onViewUserStory(this.props.storyItem)}/>
        <span style={styles.trayItemUsername}>{name.substr(0, 10) + (name.length > 10 ? '…' : '')}</span>
        <Popover
          open={this.state.isRightClickMenuActive}
          anchorEl={this.state.rightClickMenuAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.handleRightClickMenuRequestClose()}>
          <Menu>
            <MenuItem
              primaryText="Download"
              leftIcon={<DownloadIcon />} 
              onClick={() => this.onDownloadStory()}/>
          </Menu>
        </Popover>
      </div>
    )
  }
}

export default StoryTrayItem;
