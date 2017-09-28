import React, { Component } from 'react';
import {connect} from 'react-redux';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
import NavigationArrowBackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';
import MapIcon from 'material-ui/svg-icons/maps/map';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import PeopleSearchTab from '../search/PeopleSearchTab';
import HashtagSearchTab from '../search/HashtagSearchTab';
import LocationSearchTab from '../search/LocationSearchTab';
import {Tabs, Tab} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import {
  TAB_TEXT_COLOR_DARK_GRAY,
  TAB_TEXT_COLOR_LIGHT_GRAY,
  TAB_BACKGROUND_COLOR_WHITE
} from '../../../../../utils/Constants';

const tabNames = ["People", "Tags", "Places"];

class SearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabIndex: 0,
      isSearchResultsActive: false,
      isFullPopup: false,
      searchQuery: ''
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

  handleTabChange = (value) => {
    this.setState({currentTabIndex: value});
    AnalyticsUtil.track("Search " + tabNames[value] + " Tab Selected", {"query": this.state.searchQuery});
  };

  handleSplashSearchKeyPress(e) {
    var itself = this;
    if(e.key === 'Enter') {
      var searchQuery = this.refs.splashSearchQuery.getValue();
      if(searchQuery.length === 0) {
        return;
      }
      if(searchQuery !== itself.state.searchQuery) {
        AnalyticsUtil.track("Search", {
          type: tabNames[itself.state.currentTabIndex],
          query: searchQuery
        });
      }
      itself.setState({
        isSearchResultsActive: true,
        searchQuery: itself.refs.splashSearchQuery.getValue()
      });
    }
  }

  handleSplashSearch() {
    var searchQuery = this.refs.splashSearchQuery.getValue();
    if(searchQuery.length === 0) {
      return;
    }
    if(searchQuery !== this.state.searchQuery) {
      AnalyticsUtil.track("Search", {
        type: tabNames[this.state.currentTabIndex],
        query: searchQuery
      });
    }
    this.setState({
      isSearchResultsActive: true,
      searchQuery: searchQuery
    });
  }

  handleSearch() {
    var searchQuery = this.refs.searchQuery.getValue();
    if(searchQuery.length === 0) {
      return;
    }
    if(searchQuery !== this.state.searchQuery) {
      AnalyticsUtil.track("Search", {
        type: tabNames[this.state.currentTabIndex],
        query: searchQuery
      });
    }
    this.setState({
      searchQuery: searchQuery
    });
  }

  handleSearchKeyPress(e) {
    if(e.key === 'Enter') {
      var searchQuery = this.refs.searchQuery.getValue();
      if(searchQuery.length === 0) {
        return;
      }
      if(searchQuery !== this.state.searchQuery) {
        AnalyticsUtil.track("Search", {
          type: tabNames[this.state.currentTabIndex],
          query: searchQuery
        });
      }
      this.setState({
        searchQuery: this.refs.searchQuery.getValue()
      });
    }
  }
  
  onViewStoryMap() {
    AnalyticsUtil.track("View Story Map Button Clicked");
    window.open('https://watchmatcha.com/');
  }

  render() {
    const styles = {
      searchBar: {
        margin: '10px',
        textAlign: 'center',
        display: 'inline-block'
      },
      searchContainer: {
        position: 'absolute',
        top: '50%',
        transform: (this.state.isFullPopup) ? 'translate(50%, -50%)' : 'translate(0%, -50%)'
      },
      searchAppBar: {
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        height: '56px'
      },
      splashSearchField: {
        marginLeft: (this.state.isFullPopup) ? '10px' : 'inherit',
        marginRight: (this.state.isFullPopup) ? '10px' : 'inherit'
      },
      searchTabs: {
        boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
        zIndex: 1
      },
      defaultTab: {
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        color: TAB_TEXT_COLOR_DARK_GRAY
      },
      activeTab: {
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        color: TAB_TEXT_COLOR_LIGHT_GRAY
      }
    };

    styles.tab = [];
    styles.tab[0] = styles.activeTab;
    styles.tab[1] = styles.activeTab;
    styles.tab[2] = styles.activeTab;
    styles.tab[this.state.currentTabIndex] = Object.assign({}, styles.tab[this.state.currentTabIndex], styles.defaultTab);

    return (
      <div>

        {this.state.isSearchResultsActive &&
          <div>
            <AppBar
              style={styles.searchAppBar}
              title={
                <TextField
                  ref="searchQuery"
                  hintText="Search"
                  onKeyPress={(e) => this.handleSearchKeyPress(e)}
                  style={{width: '100%'}}
                  defaultValue={this.state.searchQuery}
                  />
              }
              iconElementLeft={
                <IconButton onClick={()=> this.setState({isSearchResultsActive: false})}>
                  <NavigationArrowBackIcon color={TAB_TEXT_COLOR_DARK_GRAY}/>
                </IconButton>
              }
              iconElementRight={
                <IconButton>
                  <ActionSearchIcon onClick={()=> this.handleSearch()} color={TAB_TEXT_COLOR_DARK_GRAY}/>
                </IconButton>
              }
              zDepth={0}
              />

            <Tabs
              value={this.state.currentTabIndex}
              onChange={this.handleTabChange}
              className="tabs-container">
              <Tab value={0} style={styles.tab[0]} label="People" className="tab">
                <PeopleSearchTab
                  onSelectStory={(story) => this.props.onSelectStory(story)}
                  searchQuery={this.state.searchQuery}
                  isFullPopup={this.state.isFullPopup}
                  />
              </Tab>
              <Tab value={1} style={styles.tab[1]}
                label="Tags" className="tab">
                <div>
                  <HashtagSearchTab
                    onSelectStory={(story) => this.props.onSelectStory(story)}
                    searchQuery={this.state.searchQuery}
                    isFullPopup={this.state.isFullPopup}
                    />
                </div>
              </Tab>
              <Tab value={2} style={styles.tab[2]}
                label="Places" className="tab">
                <div>
                  <LocationSearchTab
                    onSelectStory={(story) => this.props.onSelectStory(story)}
                    searchQuery={this.state.searchQuery}
                    isFullPopup={this.state.isFullPopup}
                    />
                </div>
              </Tab>
            </Tabs>
          </div>
        }

        {!this.state.isSearchResultsActive &&
          <div style={styles.searchContainer}>
            <Paper style={styles.searchBar} zDepth={2}>
              <TextField
                autoFocus
                ref="splashSearchQuery"
                hintText="Username, hashtag, or place"
                style={styles.splashSearchField}
                onKeyPress={(e) => this.handleSplashSearchKeyPress(e)}
                />
              
              <FlatButton
                label="Search"
                secondary={true}
                icon={<ActionSearchIcon/>}
                onClick={(e) => this.handleSplashSearch(e)}
                />
            </Paper>
            
            <RaisedButton
              label="View Story Map"
              className="center-horizontal"
              style={{marginTop: '20px'}}
              icon={<MapIcon />}
              onClick={() => this.onViewStoryMap()}
              />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentStoryItem: state.popup.currentStoryItem,
    isFullPopup: state.popup.isFullPopup
  };
};

export default connect(mapStateToProps)(SearchPage);
