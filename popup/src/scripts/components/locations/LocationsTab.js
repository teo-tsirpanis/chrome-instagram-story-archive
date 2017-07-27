import React, {Component} from 'react';
import {connect} from 'react-redux';
import LocationsList from './LocationsList';
import $ from 'jquery';

import {TAB_CONTAINER_HEIGHT, TAB_BACKGROUND_COLOR_WHITE} from '../../../../../utils/Constants';

class LocationsTab extends Component {
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
      }
    };
    
    return (
      <div style={styles.container}>      
        <LocationsList onSelectStory={(story) => this.props.onSelectStory(story)}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentStoryItem: state.popup.currentStoryItem,
    isFullPopup: state.popup.isFullPopup
  };
};

export default connect(mapStateToProps)(LocationsTab);
