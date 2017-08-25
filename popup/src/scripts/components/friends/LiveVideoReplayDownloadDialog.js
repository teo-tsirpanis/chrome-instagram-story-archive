import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader} from 'material-ui/Card';
import {getTimeElapsed, getLiveVideoMp4VideoUrl, getLiveVideoMp4AudioUrl} from '../../../../../utils/Utils';

class LiveVideoReplayDownloadDialog extends Component {
  render() {
    const liveVideoDownloadCards = this.props.liveVideoReplays.map((liveVideoItem, key) => {
      return (
        <Card style={{margin: '5px auto'}} key={key}>
          <CardHeader
            style={{display: 'inline-block'}}
            title={"Published " + getTimeElapsed(liveVideoItem.published_time)}
            subtitle={"Expiring " + getTimeElapsed(liveVideoItem.expire_at)}
            avatar={liveVideoItem.cover_frame_url}
            />
          <CardActions>
            <FlatButton label="Open Audio URL" onClick={() => {
                var selectedStory = this.props.liveVideoReplays[key];
                getLiveVideoMp4AudioUrl(selectedStory.dash_manifest, (videoUrl) => {
                  window.open(videoUrl);
                });
              }} />
              <FlatButton label="Open Video URL" onClick={() => {
                  var selectedStory = this.props.liveVideoReplays[key];
                  getLiveVideoMp4VideoUrl(selectedStory.dash_manifest, (videoUrl) => {
                    window.open(videoUrl);
                  });
                }} />
              </CardActions>
            </Card>
          )
        }
      );
      
      return (
        <Dialog
          title="Download Live Video Replay"
          actions={[
            <FlatButton
              label="Done"
              primary={true}
              onClick={this.props.onRequestClose}
              />
          ]}
          actionsContainerStyle={{display: 'inline-block'}}
          autoScrollBodyContent={true}
          modal={false}
          open={this.props.isOpen}
          onRequestClose={this.props.onRequestClose}>
          <br/>
          Instagram Live Videos are streamed from 2 seperate sources: one for audio and one for video.
          <br/><br/>
          You can only download these 2 sources separately. {"You'll"} have to merge them into one file yourself.
          <br/><br/>
          **It may take a while to load the URL if the live video has a long duration due to large file size.
          <br/><br/>
          {liveVideoDownloadCards}
        </Dialog>
      )
    }
  }
  
  export default LiveVideoReplayDownloadDialog;