import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Instagram API endpoints
export const API_BASE = "https://i.instagram.com/api/v1/";
export const FEED_API = API_BASE + "feed/";
export const TAG_FEED_API = FEED_API + "tag/";
export const LOCATION_FEED_API = FEED_API + "location/";
export const EXPLORE_API = API_BASE + "discover/explore/";
export const TOP_LIVE_API = API_BASE + "discover/top_live/";
export const LIVE_API = API_BASE + "live/";

// Instagram website class names
export const INSTAGRAM_FEED_CLASS_NAME = "_qj7yb";
export const INSTAGRAM_EXPLORE_FEED_CLASS_NAME = "_oyz6j";
export const INSTAGRAM_LOCATION_FEED_CLASS_NAME = "_9jh5a";
export const INSTAGRAM_USER_IMAGE_CLASS_NAME_CONTAINER = "_8gpiy _r43r5";
export const INSTAGRAM_USER_IMAGE_CLASS_NAME = "_iv4d5";
export const INSTAGRAM_USER_USERNAME_CLASS_NAME = "_i572c notranslate";

// UI colors
export const TAB_TEXT_COLOR_GREEN = "#5DBA99";
export const TAB_TEXT_COLOR_LIGHT_GRAY = "#999999";
export const TAB_TEXT_COLOR_DARK_GRAY = "#262626";
export const TAB_BACKGROUND_COLOR_WHITE = "#ffffff";

// UI dimensions 
export const TAB_CONTAINER_HEIGHT = 490;
export const POPUP_CONTAINER_WIDTH = 800;
export const POPUP_CONTAINER_HEIGHT = 600;

export const MIXPANEL_TOKEN = null;
export const AMPLITUDE_TOKEN = null;

export const muiTheme = getMuiTheme({
  palette: {
    primary1Color: TAB_TEXT_COLOR_DARK_GRAY,
    accent1Color: TAB_TEXT_COLOR_LIGHT_GRAY
  },
});