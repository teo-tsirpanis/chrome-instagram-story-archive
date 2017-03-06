import React, { Component } from 'react';
import ProgressBar from './ProgressBar';

class SingleProgressBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
      parent: '',
      intervalTime: 0,
      autoIncrement: false,
      pauseProgressBar: false,
      remainingTimePausedProgressBar: 0,
      percent: -1
    }
  }
  
  componentDidMount = () => {
    this.setState({
      id: this.props.id,
      parent: this.props.parent,
      intervalTime: this.props.intervalTime,
    });
  }
  
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.currentlyPlaying === this.state.parent) {
      this.playProgressBar();
    } else {
      this.stopProgressBar();
    }
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.currentlyPlaying !== nextProps.currentlyPlaying) {
      return true;
    }
    return false;
  }
  
  playProgressBar = () => {
    if (this.state.autoIncrement === false) {
      this.setState({
        percent: 0,
        autoIncrement: true,
      });
    }
  }
  
  stopProgressBar = () => {
    if (this.state.autoIncrement === true) {
      this.setState({
        percent: 100,
        autoIncrement: false,
      });
    }
  }
  
  render() {
    return (
      <ProgressBar
        key={this.state.id}
        intervalTime={this.state.intervalTime}
        autoIncrement={this.state.autoIncrement}
        spinner={false}
        percent={this.state.percent}
        />
    )
  }
}

export default SingleProgressBar;
