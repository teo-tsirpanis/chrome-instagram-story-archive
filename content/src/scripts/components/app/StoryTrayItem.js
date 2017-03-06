import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';

class StoryTrayItem extends Component {
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
        color: '#262626'
      }
    }  
    return (
      <div ref="TrayItemContainer" style={styles.trayItemContainer}>
        {this.props.trayItemIcon}
        <span style={styles.trayItemUsername}>{this.props.trayItemUsername.substr(0, 10) + (this.props.trayItemUsername.length > 10 ? '…' : '')}</span>
        <Popover
          open={this.state.isRightClickMenuActive}
          anchorEl={this.state.rightClickMenuAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.handleRequestClose()}>
          <Menu>
            <MenuItem
              primaryText="Download"
              leftIcon={<DownloadIcon />} 
              onClick={() => this.props.onDownloadStory(this.props.trayItemIndex)}/>
          </Menu>
        </Popover>
      </div>
    )
  }
}

export default StoryTrayItem;
