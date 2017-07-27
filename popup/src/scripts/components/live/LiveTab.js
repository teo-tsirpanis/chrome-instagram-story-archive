import React, {Component} from 'react';
import {connect} from 'react-redux';
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import VisibilityIcon from 'material-ui/svg-icons/action/visibility';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import $ from 'jquery';

import {TAB_CONTAINER_HEIGHT} from '../../../../../utils/Constants';

class LiveTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      liveVideos: [],
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
  
  selectLiveVideo(index) {
    var selectedLiveVideo = this.props.topLiveVideos[index];
    this.props.onSelectStory(selectedLiveVideo);
    AnalyticsUtil.track("Live Video Item Clicked", AnalyticsUtil.getLiveVideoObject(selectedLiveVideo));
  }
  
  onStoryAuthorUsernameClicked(index) {
    var authorUsername = this.props.topLiveVideos[index].broadcast_owner.username;
    window.open('https://www.instagram.com/' + authorUsername + '/');
    AnalyticsUtil.track("Live Video Author Username Clicked", {username: authorUsername});
  }
  
  render() {
    const styles = {
      root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      },
      gridList: {
        minHeight: TAB_CONTAINER_HEIGHT,
        overflowY: 'auto',
        height: (this.state.isFullPopup) ?  $(window).height() - 112 : TAB_CONTAINER_HEIGHT + 'px'
      },
      viewCountSpan: {
        marginLeft: '5px',
        verticalAlign: 'super',
        fontSize: '14px'
      }
    };
    
    return (
      <div style={styles.root}>
        <GridList
          cellHeight={260}
          cols={3}
          padding={5}
          style={styles.gridList}>
          {this.props.topLiveVideos.map((tile, index) => (
            <GridTile key={tile.id}>
              <img src={tile.cover_frame_url} style={{cursor: 'pointer', height: '100%'}} onClick={()=>this.selectLiveVideo(index)} />
              <img src="../img/overlayBottom.png" style={{width: '100%', height: '85px', position: 'absolute', bottom: '0px'}}/>
              <span className="liveStoryInfoSpan" style={{bottom: '32px'}}>
                <div>
                  <VisibilityIcon color="#ffffff"/>
                  <span style={styles.viewCountSpan}>{tile.viewer_count}</span>
                </div>
              </span>
              <span className="liveStoryInfoSpan" style={{bottom: '15px', fontSize: '15px', cursor: 'pointer'}} onClick={()=>this.onStoryAuthorUsernameClicked(index)}>{tile.broadcast_owner.username}</span>
            </GridTile>
          ))}
        </GridList>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    topLiveVideos: state.stories.topLiveVideos,
    currentStoryItem: state.popup.currentStoryItem,
    isFullPopup: state.popup.isFullPopup
  };
};

export default connect(mapStateToProps)(LiveTab);