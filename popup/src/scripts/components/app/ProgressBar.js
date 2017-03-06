import React from 'react';

class ProgressBar extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
    percent: React.PropTypes.number.isRequired,
    onTop: React.PropTypes.bool,
    autoIncrement: React.PropTypes.bool,
    intervalTime: React.PropTypes.number,
    spinner: React.PropTypes.oneOf([false, 'left', 'right'])
  };
  
  static defaultProps = {
    percent: -1,
    onTop: false,
    autoIncrement: false,
    intervalTime: 200,
    spinner: 'left'
  };
  
  state = {
    percent: this.props.percent
  };
  
  componentDidMount = () => {
    this.handleProps(this.props);
  };
  
  componentWillReceiveProps = (nextProps) => {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.handleProps(nextProps);
  };
  
  componentWillUnmount = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };
  
  increment = () => {
    let {percent} = this.state;
    percent = percent + 1;
    percent = percent < 100 ? percent : 100;
    this.setState({
      percent: percent
    });
  };
  
  handleProps = (props) => {
    if (props.autoIncrement && props.percent >= 0 && props.percent < 99) {
      this.interval = setInterval(this.increment, props.intervalTime);
    }
  };
  
  render() {
    let {onTop, spinner, className} = this.props;
    let {percent} = this.state;
    let style = {width: (percent < 0 ? 0 : percent) + '%'};
    return (
      <div className="react-progress-bar">
        <div className="react-progress-bar-percent" style={style}/>
      </div>
    );
  }
}

export default ProgressBar;
