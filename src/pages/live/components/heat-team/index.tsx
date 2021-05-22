import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image} from '@tarojs/components'
import './index.scss'

import {getTimeDifference} from "../../../../utils/utils";
import leftSupport from "../../../../assets/live/left-support.png";
import rightSupport from "../../../../assets/live/right-support.png";

type PageStateProps = {}

type PageDispatchProps = {
  onHandleLeftSupport?: any;
  onHandleRightSupport?: any;
}

type PageOwnProps = {
  teamHeats?: any;
  startTime?: any;
  endTime?: any;
}

type PageState = {
  timerID_CountDown: any;
  startDiffDayTime: any;
  endDiffDayTime: any;
  leftAnimation: any;
  rightAnimation: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface HeatTeam {
  props: IProps;
}

const STATUS = {
  unknow: -1,
  unopen: 0,
  open: 1,
  finish: 2,
}

class HeatTeam extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      timerID_CountDown: null,
      startDiffDayTime: null,
      endDiffDayTime: null,
      leftAnimation: null,
      rightAnimation: null,
    }
  }

  componentDidMount() {
    this.startTimer_CountDown();
  }

  componentWillUnmount() {
    this.clearTimer_CountDown();
  }

  getStartDiffTime = () => {
    const time = this.props.startTime;
    if (time) {
      const diff = getTimeDifference(time);
      this.setState({
        startDiffDayTime: diff,
      });
    }
  }
  getEndDiffTime = () => {
    const time = this.props.endTime;
    if (time) {
      const diff = getTimeDifference(time);
      this.setState({
        endDiffDayTime: diff,
      });
    }
  }
  startTimer_CountDown = () => {
    this.clearTimer_CountDown();
    const timerID_CountDown = setInterval(() => {
      const status = this.getStatus();
      if (status == STATUS.unopen) {
        this.getStartDiffTime()
      } else if (status == STATUS.open) {
        this.getEndDiffTime()
      }
    }, 1000)
    this.setState({timerID_CountDown: timerID_CountDown})
  }
  clearTimer_CountDown = () => {
    if (this.state.timerID_CountDown) {
      clearInterval(this.state.timerID_CountDown)
      this.setState({timerID_CountDown: null})
    }
  }
  getStatus = () => {
    const startTime = this.props.startTime;
    const endTime = this.props.endTime;
    if (startTime == null || endTime == null) {
      return STATUS.unknow;
    }
    const nowDate = new Date().getTime();
    const startTime_diff = Date.parse(startTime) - nowDate;
    const endTime_diff = Date.parse(endTime) - nowDate;
    if (startTime_diff > 0) {
      return STATUS.unopen;
    } else if (startTime_diff <= 0 && endTime_diff > 0) {
      return STATUS.open;
    } else {
      return STATUS.finish;
    }
  }

  handleLeftSupport = () => {
    if (this.getStatus() != STATUS.open && this.getStatus() == STATUS.unopen) {
      Taro.showToast({
        title: "PK还未开始",
        icon: "none"
      })
      return;
    } else if (this.getStatus() != STATUS.open && this.getStatus() == STATUS.finish) {
      Taro.showToast({
        title: "PK已结束",
        icon: "none"
      })
      return;
    }
    this.props.onHandleLeftSupport();
  }

  handleRightSupport = () => {
    if (this.getStatus() != STATUS.open && this.getStatus() == STATUS.unopen) {
      Taro.showToast({
        title: "PK还未开始",
        icon: "none"
      })
      return;
    } else if (this.getStatus() != STATUS.open && this.getStatus() == STATUS.finish) {
      Taro.showToast({
        title: "PK已结束",
        icon: "none"
      })
      return;
    }
    this.props.onHandleRightSupport();
  }

  getHeats = () => {
    const {teamHeats} = this.props
    if (teamHeats == null) {
      return {percent: 50, leftText: "", rightText: ""};
    }
    let hostHeat = 0;
    let guestHeat = 0;
    if (teamHeats[0] != null) {
      let heat = 0;
      let heatBase = 0;
      if (teamHeats[0].heat != null) {
        heat = teamHeats[0].heat;
      }
      if (teamHeats[0].heatBase != null) {
        heatBase = teamHeats[0].heatBase;
      }
      hostHeat = heat + heatBase;
    }
    if (teamHeats[1] != null) {
      let heat = 0;
      let heatBase = 0;
      if (teamHeats[1].heat != null) {
        heat = teamHeats[1].heat;
      }
      if (teamHeats[1].heatBase != null) {
        heatBase = teamHeats[1].heatBase;
      }
      guestHeat = heat + heatBase;
    }
    const percent = hostHeat == 0 && guestHeat == 0 ? 50 : (hostHeat * 100 / (hostHeat + guestHeat));
    return {percent: percent, leftText: hostHeat, rightText: guestHeat};
  }

  render() {
    const {percent = 50, leftText = "", rightText = ""} = this.getHeats()
    const {startDiffDayTime, endDiffDayTime} = this.state
    let leftPercent = percent;
    let rightPercent = 100 - percent;
    if (leftPercent < 2 || rightPercent > 98) {
      leftPercent = 2;
      rightPercent = 98;
    }
    if (rightPercent < 2 || leftPercent > 98) {
      leftPercent = 98;
      rightPercent = 2;
    }
    const leftProgressStyle = {
      width: `${leftPercent}%`,
    }
    const rightProgressStyle = {
      width: `${rightPercent}%`,
    }
    // const centerStyle = {
    //   left: `${leftPercent}%`,
    // }

    return (
      <View className="qz-heat-team-container">
        <View className="qz-heat-team__support">
          <View className="qz-heat-team__support-left">
            <Image
              src={leftSupport}
              onClick={this.handleLeftSupport}
              className="qz-heat-team__support-left-img"/>
          </View>
          <View className="qz-heat-team__support-right">
            <Image
              src={rightSupport}
              onClick={this.handleRightSupport}
              className="qz-heat-team__support-right-img"/>
          </View>
        </View>
        <View className='qz-heat-team'>
          <View className='qz-heat-team__outer'>
            <View className='qz-heat-team__outer-inner'>
              <View
                className='qz-heat-team__outer-inner-left qz-heat-team__outer-inner-background'
                style={leftProgressStyle}>
                <Text className='qz-heat-team__outer-inner-left-text qz-heat-team__outer-inner-text'>
                  {leftText}
                </Text>
                <View className='qz-heat-team__outer-inner-left-light'/>
              </View>
              {/*<View className="qz-heat-team__outer-inner-center" style={centerStyle}/>*/}
              <View
                className='qz-heat-team__outer-inner-right qz-heat-team__outer-inner-background'
                style={rightProgressStyle}>
                <Text className='qz-heat-team__outer-inner-right-text qz-heat-team__outer-inner-text'>
                  {rightText}
                </Text>
                <View className='qz-heat-team__outer-inner-right-light'/>
              </View>
            </View>
          </View>
        </View>
        <View className="qz-heat-team-bottom-line"/>
        <View
          className={`qz-heat-team-bottom-skewed ${this.getStatus() != STATUS.finish ? "qz-heat-team-bottom-skewed-big" : ""}`}>
          <View className="qz-heat-team-bottom-center-text">
            {this.getStatus() == STATUS.unopen ? `${startDiffDayTime ? `${startDiffDayTime.diffDay ? startDiffDayTime.diffDay + startDiffDayTime.diffTime : ""}` : ""}后开始PK` : ""}
            {this.getStatus() == STATUS.open ? `PK中 ${endDiffDayTime ? `${endDiffDayTime.diffDay ? endDiffDayTime.diffDay + endDiffDayTime.diffTime : ""}` : ""}` : ""}
            {this.getStatus() == STATUS.finish ? `PK已结束` : ""}
          </View>
        </View>
      </View>
    )
  }
}

export default HeatTeam
