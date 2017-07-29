import React, {Component} from 'react';
import {connect} from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import PeopleSearchList from './PeopleSearchList';
import $ from 'jquery';
import InstagramApi from '../../../../../utils/InstagramApi';

import {TAB_CONTAINER_HEIGHT, TAB_BACKGROUND_COLOR_WHITE} from '../../../../../utils/Constants';

class PeopleSearchTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isFullPopup: false,
      results: []
    }
  }

  componentDidMount() {
    this.searchForUser(this.props.searchQuery);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.searchQuery !== nextProps.searchQuery) {
      this.searchForUser(nextProps.searchQuery);
    }
  }

  searchForUser(username) {
    this.setState({isLoading: true});
    InstagramApi.searchForUser(username, (searchResponse) => {
      this.setState({
        isLoading: false,
        results: searchResponse
      })
    });
  }

  render() {
    const styles = {
      container: {
        background: TAB_BACKGROUND_COLOR_WHITE,
        minHeight: TAB_CONTAINER_HEIGHT + 'px',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: (this.state.isFullPopup) ?  $(window).height() - 112 : TAB_CONTAINER_HEIGHT + 'px',
      },
      refreshIndicator: {
        position: 'relative',
        margin: '0 auto'
      },
    };

    if(this.state.isLoading && this.state.results.length == 0) {
      return (
        <div style={styles.container}>
          <CircularProgress className="center-div" size={60}/>
        </div>
      );
    }
    return (
      <div style={styles.container}>
        {this.state.isLoading && this.state.results.length > 0 &&
          <RefreshIndicator
            size={40}
            left={10}
            top={0}
            status="loading"
            style={styles.refreshIndicator}/>
        }

        <PeopleSearchList
          results={this.state.results}
          onSelectStory={(story) => this.props.onSelectStory(story)}/>
      </div>
    );
  }
}

export default PeopleSearchTab;
