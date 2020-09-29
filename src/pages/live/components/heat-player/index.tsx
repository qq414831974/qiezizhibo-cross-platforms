import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image, ScrollView} from '@tarojs/components'
import {AtSearchBar, AtDivider, AtButton} from 'taro-ui'

import './index.scss'
import {getTimeDifference} from "../../../../utils/utils";
import noperson from '../../../../assets/no-person.png';
import flame from '../../../../assets/live/flame.png';

type PageStateProps = {}

type PageDispatchProps = {
  onHandlePlayerSupport?: any;
}

type PageOwnProps = {
  playerHeats?: any;
  startTime?: any;
  endTime?: any;
  hidden?: any;
}

type PageState = {
  startDiffDayTime: any;
  endDiffDayTime: any;
  isBeenSearch: any;
  searchText: any;
  currentPlayerHeat: any;
  searchPlayerHeats: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface HeatPlayer {
  props: IProps;
}

const STATUS = {
  unknow: -1,
  unopen: 0,
  open: 1,
  finish: 2,
}

class HeatPlayer extends Component<PageOwnProps, PageState> {
  static defaultProps = {}
  timerID_CountDown: any = null;

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
    this.timerID_CountDown = setInterval(() => {
      const status = this.getStatus();
      if (status == STATUS.unopen) {
        this.getStartDiffTime()
      } else if (status == STATUS.open) {
        this.getEndDiffTime()
      }
    }, 1000)
  }
  clearTimer_CountDown = () => {
    if (this.timerID_CountDown) {
      clearInterval(this.timerID_CountDown)
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
  handleSupport = () => {
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
    if (this.state.currentPlayerHeat == null) {
      Taro.showToast({
        title: "请选择球员",
        icon: "none"
      })
      return;
    }
    this.props.onHandlePlayerSupport(this.state.currentPlayerHeat.player);
  }
  onSearchChange = (value) => {
    this.setState({
      searchText: value,
    })
  }
  onSearch = () => {
    const playerHeats = this.props.playerHeats;
    if (this.state.searchText != null && this.state.searchText.trim() != "") {
      const result: Array<any> = [];
      for (let playerHeat of playerHeats) {
        if (playerHeat.player && (playerHeat.player.name.indexOf(this.state.searchText) != -1 || playerHeat.player.shirtNum == this.state.searchText)) {
          result.push(playerHeat);
        }
      }
      this.setState({isBeenSearch: true, searchPlayerHeats: result})
    }
  }
  onClear = () => {
    this.setState({isBeenSearch: false, searchText: ""})
  }
  getTotalHeats = (playerHeats) => {
    let heats = 0;
    for (let playerHeat of playerHeats) {
      heats = heats + playerHeat.heat + playerHeat.heatBase;
    }
    return heats;
  }
  onPlayerClick = (playerHeat) => {
    this.setState({currentPlayerHeat: playerHeat})
  }
  getHeat = (currentPlayerHeat) => {
    let heat = 0;
    if (currentPlayerHeat) {
      if (currentPlayerHeat.heat) {
        heat = heat + currentPlayerHeat.heat
      }
      if (currentPlayerHeat.heatBase) {
        heat = heat + currentPlayerHeat.heatBase
      }
    }
    return heat;
  }

  render() {
    const {startDiffDayTime, endDiffDayTime, currentPlayerHeat = null} = this.state
    const {hidden = false} = this.props
    let playerHeats = this.props.playerHeats;
    const onPlayerClick = this.onPlayerClick;
    const getHeat = this.getHeat;
    if (hidden) {
      return <View/>
    }
    if (this.state.isBeenSearch) {
      playerHeats = this.state.searchPlayerHeats;
    }

    return (
      <View className="qz-heat-player-container">
        <View className="qz-heat-player-header">
          <View className="qz-heat-player-header__search">
            <AtSearchBar
              value={this.state.searchText}
              onChange={this.onSearchChange}
              onActionClick={this.onSearch}
              onConfirm={this.onSearch}
              onClear={this.onClear}
              placeholder="请输入姓名或编号"
            />
          </View>
          <View className="qz-heat-player-header__status">
            <View className="at-row">
              <View className="at-col at-col-4">
                <View className="w-full center qz-heat-player-header__status-title">
                  参赛选手
                </View>
                <View className="w-full center qz-heat-player-header__status-value">
                  {playerHeats && playerHeats.length ? playerHeats.length : 0}
                </View>
              </View>
              <View className="at-col at-col-4">
                <View className="w-full center qz-heat-player-header__status-title">
                  累计人气值
                </View>
                <View className="w-full center qz-heat-player-header__status-value">
                  {playerHeats ? this.getTotalHeats(playerHeats) : 0}
                </View>
              </View>
              <View className="at-col at-col-4">
                <View className="w-full center qz-heat-player-header__status-title">
                  活动结束倒计时
                </View>
                <View className="w-full center qz-heat-player-header__status-value">
                  {this.getStatus() == STATUS.unopen ? `${startDiffDayTime ? `${startDiffDayTime.diffDay ? startDiffDayTime.diffDay + startDiffDayTime.diffTime : ""}` : ""}后开始PK` : ""}
                  {this.getStatus() == STATUS.open ? `PK中 ${endDiffDayTime ? `${endDiffDayTime.diffDay ? endDiffDayTime.diffDay + endDiffDayTime.diffTime : ""}` : ""}` : ""}
                  {this.getStatus() == STATUS.finish ? `PK已结束` : ""}
                </View>
              </View>
            </View>
          </View>
        </View>
        <AtDivider height={12} lineColor="#E5E5E5"/>
        <ScrollView scrollY className="qz-heat-player-content">
          <View className="qz-heat-player__grid">
            {playerHeats && playerHeats.map((data: any) => (
                <View key={data.id}
                      className={`qz-heat-player__grid-item ${currentPlayerHeat && currentPlayerHeat.id == data.id ? "qz-heat-player__grid-item-active" : ""}`}
                      onClick={onPlayerClick.bind(this, data)}>
                  <View className="qz-heat-player__grid-item-img-container">
                    <Image src={data.player && data.player.headImg ? data.player.headImg : noperson}/>
                    <View className="qz-heat-player__grid-item-heat">
                      <Image src={flame}/>
                      <Text className="qz-heat-player__grid-item-heat-value">{getHeat(data)}</Text>
                    </View>
                    {data.index <= 3 ?
                      <View className={`qz-heat-player__grid-item-rank qz-heat-player__grid-item-rank-${data.index}`}>
                      </View> : null}
                  </View>
                  <View className="qz-heat-player__grid-item-name">
                    <Text>{data.player && data.player.name ? data.player.name : "球员"}</Text>
                  </View>
                  {/*<View className="qz-heat-player__grid-item-shirt">*/}
                  {/*  <Text>{data.player && data.player.shirtNum ? data.player.shirtNum : "0"}</Text>*/}
                  {/*</View>*/}
                  <View className="qz-heat-player__grid-item-shirtNum">
                    <Text>{data.player && data.player.shirtNum ? data.player.shirtNum : "0"}号</Text>
                  </View>
                </View>
              )
            )}
          </View>
        </ScrollView>
        <View className="qz-heat-player-footer">
          <View className="at-row">
            <View className="at-col at-col-9 qz-heat-player-footer-left">
              {currentPlayerHeat ?
                <View className="qz-heat-player-footer-left-info">
                  <View className="qz-heat-player-footer-user">
                    <Image
                      src={currentPlayerHeat.player && currentPlayerHeat.player.headImg ? currentPlayerHeat.player.headImg : noperson}/>
                    <Text>{currentPlayerHeat.player && currentPlayerHeat.player.name ? currentPlayerHeat.player.name : "球员"}</Text>
                    <Text>({currentPlayerHeat.player && currentPlayerHeat.player.shirtNum ? currentPlayerHeat.player.shirtNum : "0"}号)</Text>
                  </View>
                  <View className="qz-heat-player-footer-heat">
                    <Image src={flame}/>
                    <Text>{getHeat(currentPlayerHeat)}</Text>
                    <Text>(第{currentPlayerHeat.index}名)</Text>
                  </View>
                </View>
                :
                <View className="qz-heat-player-footer-heat">
                  请选择球员
                </View>
              }
            </View>
            <View className="at-col at-col-3 qz-heat-player-footer-right">
              <AtButton
                className="vertical-middle"
                size="small"
                type="primary"
                full
                circle
                onClick={this.handleSupport}
              >
                支持
              </AtButton>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default HeatPlayer
