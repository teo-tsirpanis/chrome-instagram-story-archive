import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import CircularProgress from 'material-ui/CircularProgress';
import {downloadStoryByUsername} from '../../../../../utils/Utils';

class StoryDownloadButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDownloadingStory: false
    }
  }
  
  onDownloadStory() {
    this.setState({isDownloadingStory: true});
    downloadStoryByUsername(this.props.username, () => {
      this.setState({isDownloadingStory: false});
    });
  }
  
  render() {
    return (
      <IconButton
        tooltip="Download"
        tooltipPosition="top-left"
        onClick={() => this.onDownloadStory()}>
        {(this.state.isDownloadingStory) ? <CircularProgress size={24}/> : <DownloadIcon />}
      </IconButton>
    )
  }
}

export default StoryDownloadButton;