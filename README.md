# Chrome IG Story
Chrome extension that lets you view your friend's Instagram Stories in the browser.

<img src="https://cloud.githubusercontent.com/assets/2003684/23597569/db7c76cc-01e8-11e7-843a-8886852c4b87.png"/>

<img src="https://cloud.githubusercontent.com/assets/2003684/23597595/1ec709e2-01e9-11e7-8bb8-8bb7ff77ef58.png"/>

<img src="https://cloud.githubusercontent.com/assets/2003684/23597607/2b121c3c-01e9-11e7-8745-bc7bbd15a86c.png"/>

### How does Chrome IG Story work?
Chrome IG Story injects your friend's Instagram Stories above your feed on the Instagram.com desktop website just like it appears in the Instagram mobile app.

Click on the icon of the Instagram user to view their story. You can also right click the icon to download their story.

You can see Suggested Stories if you go to the Explore feed.

In addition to viewing stories on the Instagram website, you can also access stories within the popup by clicking the extension's icon.

Right click the icon of the Instagram user to download their Story.

You can see Suggested Stories if you go to the Explore feed.

### Why does the profile picture border not turn gray after I view a Story?
Currently, Chrome IG Story does not mark the Story as being "seen", so all new content will remain new if you view it with this extension. If you view that user's Story on your phone and refresh the page, the new content will be gray.

### Can I share an image/video from someone's Story?

You can right click the image/video in the galley and "Copy Image/Video Address" to grab the link of the photo or video and share it. However, be respectful of the user's privacy when sharing the URL, as the link will work until Instagram deletes the photo/video off its server (sometimes days after the Story has expired).

### Installing Dependencies ###

```
git clone https://github.com/CaliAlec/ChromeIGStory.git

cd ChromeIGStory
npm install
npm install -g gulp

```

### Running and Developing ###

In order to run the extension locally, follow the steps below.

* In the root directory, run:

```
gulp watch

```
* A /build folder will be generated. Visit chrome://extensions/ in your browser, enable Developer mode, and drag the build folder onto the page to install the extension.

* Every time you make a change in the code, the build folder will be regenerated on the fly, but you must go back to chrome://extensions/ and reload the extension to see any changes.

# License

MIT

## Legal

This project is in no way affiliated with, authorized, maintained, sponsored or endorsed by Instagram or any of its affiliates or subsidiaries. This is an independent project that utilizes Instagram's unofficial API. Use at your own risk.
