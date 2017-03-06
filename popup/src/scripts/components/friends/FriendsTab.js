import React, {Component} from 'react';
import {connect} from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import LiveFriendVideosList from './LiveFriendVideosList';
import FriendStoriesList from './FriendStoriesList';
import $ from 'jquery';

import {TAB_CONTAINER_HEIGHT, TAB_BACKGROUND_COLOR_WHITE} from '../../../../../utils/Constants';

class FriendsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFullPopup: false
    }
  }
  
  componentDidMount() {
    if(this.props.currentStoryItem != null || this.props.isFullPopup) {
      this.setState({isFullPopup: true});
      this.props.dispatch({
        type: 'SET_IS_FULL_POPUP',
        isFullPopup: false
      });
    }    
  }
  
  render() {
    const styles = {
      container: {
        background: TAB_BACKGROUND_COLOR_WHITE,
        minHeight: TAB_CONTAINER_HEIGHT + 'px',
        overflowY: 'scroll',
        height: (this.state.isFullPopup) ?  $(window).height() - 112 : TAB_CONTAINER_HEIGHT + 'px',
      },
      refreshIndicator: {
        position: 'relative',
        margin: '0 auto'
      },
    };
    
    if(this.props.isLoading && this.props.friendStories.tray.length == 0) {
      return (
        <div style={styles.container}>
          <CircularProgress className="center-div" size={60}/>
        </div>
      );
    }
    return (
      <div style={styles.container}>
        {this.props.isLoading && this.props.friendStories.tray.length > 0 && 
          <RefreshIndicator
            size={40}
            left={10}
            top={0}
            status="loading"
            style={styles.refreshIndicator}/>
        }
        
        <LiveFriendVideosList
          friendStories={this.props.friendStories}
          onSelectStory={(story) => this.props.onSelectStory(story)}/>
        
        <FriendStoriesList
          friendStories={this.props.friendStories}
          onSelectStory={(story) => this.props.onSelectStory(story)}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories,
    currentStoryItem: state.popup.currentStoryItem,
    isFullPopup: state.popup.isFullPopup
  };
};

export default connect(mapStateToProps)(FriendsTab);
