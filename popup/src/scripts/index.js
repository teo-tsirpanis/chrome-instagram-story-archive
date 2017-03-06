import React from 'react';
import {render} from 'react-dom';
import App from './components/app/App';
import {Store} from 'react-chrome-redux';
import {Provider} from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AnalyticsUtil from '../../../utils/AnalyticsUtil';
import {muiTheme} from '../../../utils/Constants';

const proxyStore = new Store({
  portName: 'chrome-ig-story'
});

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// wait for the store to connect to the background page
proxyStore.ready().then(() => {
  var cookies = proxyStore.getState().popup.cookies;
  AnalyticsUtil.initializeMixpanel(cookies);
  AnalyticsUtil.initializeAmplitude(cookies);
  render(
    <Provider store={proxyStore}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <App/>
      </MuiThemeProvider>  
    </Provider>
    , document.getElementById('app'));
  });