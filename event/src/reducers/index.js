import {combineReducers} from 'redux';

import stories from './stories';
import popup from './popup';

export default combineReducers({
  stories,
  popup
});
