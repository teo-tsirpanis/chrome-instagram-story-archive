import React, {Component} from 'react';
import {connect} from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import LiveFriendVideosList from '../friends/LiveFriendVideosList';
import SuggestedStoriesList from './SuggestedStoriesList';
import $ from 'jquery';

import {TAB_CONTAINER_HEIGHT, TAB_BACKGROUND_COLOR_WHITE} from '../../../../../utils/Constants';

class ExploreTab extends Component {
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
        minHeight: + TAB_CONTAINER_HEIGHT + 'px',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: (this.state.isFullPopup) ?  $(window).height() - 112 : TAB_CONTAINER_HEIGHT + 'px'
      },
      refreshIndicator: {
        position: 'relative',
        margin: '0 auto'
      },
    };
    
    return (
      <div style={styles.container}>
        {this.props.exploreStories.tray.length === 0 && 
          <RefreshIndicator
            size={40}
            left={10}
            top={0}
            status="loading"
            style={styles.refreshIndicator}/>
        }
        
        <SuggestedStoriesList
          stories={this.props.exploreStories}
          onSelectStory={(story) => this.props.onSelectStory(story)}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    exploreStories: state.stories.exploreStories,
    currentStoryItem: state.popup.currentStoryItem,
    isFullPopup: state.popup.isFullPopup
  };
};

export default connect(mapStateToProps)(ExploreTab);
