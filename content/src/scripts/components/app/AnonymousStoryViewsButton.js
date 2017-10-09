import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import VisibilityOnIcon from 'material-ui/svg-icons/action/visibility';
import VisibilityOffIcon from 'material-ui/svg-icons/action/visibility-off';

class AnonymousStoryViewsButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewStoriesAnonymously: true,
      isSnackbarOpen: false
    }
  }
  
  componentDidMount() {
    chrome.storage.local.get("viewStoriesAnonymously", function(items) {
      var viewStoriesAnonymously = (items.viewStoriesAnonymously) ? true : false;
      this.setState({viewStoriesAnonymously: viewStoriesAnonymously});
    }.bind(this));
  }
  
  toggleAnonymousStoryViews() {
    chrome.storage.local.get("viewStoriesAnonymously", function(items) {
      if(items.viewStoriesAnonymously) {
        this.setStorageItem("viewStoriesAnonymously", false);
        this.setState({
          viewStoriesAnonymously: false,
          isSnackbarOpen: true
        });
      } else {
        this.setStorageItem("viewStoriesAnonymously", true);
        this.setState({
          viewStoriesAnonymously: true,
          isSnackbarOpen: true
        });
      }
    }.bind(this));
  }
  
  handleRequestClose = () => {
    this.setState({
      isSnackbarOpen: false,
    });
  };
  
  setStorageItem(key, value, callback) {
    chrome.storage.local.set({[key]: value}, function() {
      if(callback) {
        callback();
      }
    });
  }
  
  render() {
    var snackbarMessage = (this.state.viewStoriesAnonymously)
    ? "Anonymous Viewing Enabled: Any stories you view won't be marked as seen."
    : "Anonymous Viewing Disabled: Any stories you view will be marked as seen."
    return (
      <div>
        <IconButton
          tooltip={"Anonymous Viewing " + ((this.state.viewStoriesAnonymously) ? "Enabled" : "Disabled")}
          tooltipPosition="top-center"
          onClick={() => this.toggleAnonymousStoryViews()}>
          {(this.state.viewStoriesAnonymously) ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
        </IconButton>
        <Snackbar
          open={this.state.isSnackbarOpen}
          message={snackbarMessage}
          autoHideDuration={5000}
          onRequestClose={this.handleRequestClose}
          />
      </div>
    )
  }
}

export default AnonymousStoryViewsButton;