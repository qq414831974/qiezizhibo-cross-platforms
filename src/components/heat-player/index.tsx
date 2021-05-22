import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image, ScrollView} from '@tarojs/components'
import {AtSearchBar, AtDivider, AtButton, AtActivityIndicator, AtLoadMore} from 'taro-ui'
import RoundButton from '../../components/round-button'

import './index.scss'
import {getTimeDifference} from "../../utils/utils";
import noperson from '../../assets/no-person.png';
import defaultLogo from '../../assets/default-logo.png';
import flame from '../../assets/live/left-support.png';
import share from '../../assets/live/share.png';
import moment from '../../assets/live/moment.png';
import * as global from "../../constants/global";
import Request from "../../utils/request";
import * as api from "../../constants/api";

type PageStateProps = {}

type PageDispatchProps = {
  onHandlePlayerSupport?: any;
  onGetPlayerHeatInfo?: any;
  onGetPlayerHeatInfoAdd?: any;
  onPlayerHeatRefresh?: any;
  onPictureDownLoading?: any;
  onPictureDownLoaded?: any;
}

type PageOwnProps = {
  playerHeats?: any;
  topPlayerHeats?: any;
  startTime?: any;
  endTime?: any;
  hidden?: any;
  heatType?: any;
  totalHeat?: any;
  isLeauge?: any;
  leagueId?: any;
  matchId?: any;
  tabContainerStyle?: any;
  tabScrollStyle?: any;
}

type PageState = {
  timerID_CountDown: any;
  startDiffDayTime: any;
  endDiffDayTime: any;
  searchText: any;
  currentPlayerHeat: any;
  loadingMore: any;
  pulldownRefresh: any;
  heatStatus: any;
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

class HeatPlayer extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      timerID_CountDown: null,
      startDiffDayTime: null,
      endDiffDayTime: null,
      searchText: "",
      currentPlayerHeat: null,
      loadingMore: false,
      pulldownRefresh: false,
      heatStatus: null,
    }
  }

  componentDidMount() {
    this.props.onPlayerHeatRefresh && this.props.onPlayerHeatRefresh(this.refresh);
    this.refresh(true);
    this.startTimer_CountDown();
  }

  componentWillUnmount() {
    this.clearTimer_CountDown();
  }

  refresh = (first?) => {
    this.props.onGetPlayerHeatInfo(1, 40, this.state.searchText).then((res) => {
      if (first) {
        this.setState({currentPlayerHeat: res[0]}, () => {
          this.refreshCurrentPlayer();
        })
      } else {
        this.refreshCurrentPlayer();
      }
    });
  }
  getStartDiffTime = () => {
    const time = this.props.startTime;
    if (time) {
      const diff = getTimeDifference(time, true);
      this.setState({
        startDiffDayTime: diff,
      });
    }
  }
  getEndDiffTime = () => {
    const time = this.props.endTime;
    if (time) {
      const diff = getTimeDifference(time, true);
      this.setState({
        endDiffDayTime: diff,
      });
    }
  }
  startTimer_CountDown = () => {
    this.clearTimer_CountDown();
    const timerID_CountDown = setInterval(() => {
      const status = this.getStatus();
      this.setState({heatStatus: status})
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
  handleSupport = () => {
    if (this.state.heatStatus != STATUS.open && this.state.heatStatus == STATUS.unopen) {
      Taro.showToast({
        title: "PK还未开始",
        icon: "none"
      })
      return;
    } else if (this.state.heatStatus != STATUS.open && this.state.heatStatus == STATUS.finish) {
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
    this.props.onGetPlayerHeatInfo(1, 40, this.state.searchText);
  }
  onClear = () => {
    this.setState({
      searchText: "",
    })
    this.props.onGetPlayerHeatInfo(1, 40, null);
  }
  onPlayerClick = (playerHeat) => {
    if (this.state.currentPlayerHeat && this.state.currentPlayerHeat.id == playerHeat.id) {
      this.handleSupport();
    }
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
  nextPage = () => {
    if (this.state.loadingMore) {
      return;
    }
    this.setState({loadingMore: true})
    Taro.showLoading({title: global.LOADING_TEXT})
    this.props.onGetPlayerHeatInfoAdd(this.props.playerHeats.current + 1, 40, this.state.searchText);
    Taro.hideLoading();
    this.setState({loadingMore: false})
  }

  onReachBottom = () => {
    this.nextPage();
  }

  onPullDownRefresh = ()=> {
    this.setState({pulldownRefresh: true})
    Taro.showLoading({title: global.LOADING_TEXT})
    this.refresh();
    Taro.hideLoading({
      complete: () => {
        this.setState({pulldownRefresh: false})
      }
    });
  }

  isTopPlayerHeat = (playerHeat, topPlayerHeat) => {
    if (topPlayerHeat && playerHeat) {
      for (let topPlayer of topPlayerHeat) {
        if (topPlayer.id == playerHeat.id) {
          return topPlayer.index;
        }
      }
    }
    return null;
  }
  handleShare = () => {

  }
  handleShareMoment = () => {
    if (this.state.currentPlayerHeat == null) {
      Taro.showToast({
        title: "请选择球员",
        icon: "none"
      })
      return;
    }
    this.props.onPictureDownLoading && this.props.onPictureDownLoading();
    let params: any = {
      leagueId: this.props.leagueId,
      playerId: this.state.currentPlayerHeat.playerId,
      heatType: this.props.heatType,
    }
    if (this.props.matchId) {
      params.matchId = this.props.matchId;
    }
    new Request().get(api.API_GET_HEAT_COMPETITION_SHARE, params).then((imageUrl: string) => {
      if (imageUrl == null) {
        Taro.showToast({title: "获取图片失败", icon: "none"});
        this.props.onPictureDownLoaded && this.props.onPictureDownLoaded(null);
        return;
      }
      this.props.onPictureDownLoaded && this.props.onPictureDownLoaded(imageUrl);
    })
  }
  refreshCurrentPlayer = () => {
    const {currentPlayerHeat = null} = this.state;
    let playerHeats = this.props.playerHeats;
    playerHeats && playerHeats.records.forEach((data: any) => {
      if (currentPlayerHeat && currentPlayerHeat.id == data.id) {
        this.setState({currentPlayerHeat: data})
      }
    })
  }
  handleFeedbackClick = () => {
    Taro.navigateTo({
      url: "/pages/feedback/feedback",
    })
  }

  render() {
    const {startDiffDayTime, endDiffDayTime, currentPlayerHeat = null, pulldownRefresh = false} = this.state
    const {hidden = false, heatType} = this.props
    let playerHeats = this.props.playerHeats;
    let topPlayerHeats = this.props.topPlayerHeats;
    let isTopPlayerHeat = this.isTopPlayerHeat;
    const onPlayerClick = this.onPlayerClick;
    const getHeat = this.getHeat;
    const heatStatus = this.state.heatStatus;
    if (hidden) {
      return <View/>
    }

    return (
      <View className={`${this.props.isLeauge ? "qz-heat-player-container-league" : "qz-heat-player-container"}`}
            style={this.props.tabContainerStyle}>
        <View className="qz-heat-player-header">
          <View className="qz-heat-player-header__search">
            <AtSearchBar
              value={this.state.searchText}
              onChange={this.onSearchChange}
              onActionClick={this.onSearch}
              onConfirm={this.onSearch}
              onClear={this.onClear}
              placeholder="输入姓名/序号查找球员"
            />
          </View>
          <View className="qz-heat-player-header__status">
            {/*<View className="qz-heat-player-header__status-feedback">*/}
            {/*  <AtButton*/}
            {/*    className="vertical-middle"*/}
            {/*    size="small"*/}
            {/*    type="primary"*/}
            {/*    full*/}
            {/*    circle*/}
            {/*    onClick={this.handleFeedbackClick}*/}
            {/*  >*/}
            {/*    投诉与反馈*/}
            {/*  </AtButton>*/}
            {/*</View>*/}
            <View className="at-row">
              {/*<View className="at-col at-col-4">*/}
              {/*  <View className="w-full center qz-heat-player-header__status-title">*/}
              {/*    参赛选手*/}
              {/*  </View>*/}
              {/*  <View className="w-full center qz-heat-player-header__status-value">*/}
              {/*    {playerHeats && playerHeats.total ? playerHeats.total : 0}*/}
              {/*  </View>*/}
              {/*</View>*/}
              {/*<View className="at-col at-col-4">*/}
              {/*  <View className="w-full center qz-heat-player-header__status-title">*/}
              {/*    累计人气值*/}
              {/*  </View>*/}
              {/*  <View className="w-full center qz-heat-player-header__status-value">*/}
              {/*    {totalHeat ? totalHeat : 0}*/}
              {/*  </View>*/}
              {/*</View>*/}
              {/*<View className="at-col at-col-4">*/}
              <View className="at-col at-col-12">
                <View className="w-full center qz-heat-player-header__status-title">
                  活动结束倒计时
                </View>
                <View className="w-full center qz-heat-player-header__status-value">
                  {heatStatus == STATUS.unopen ? `${startDiffDayTime ? `${startDiffDayTime.diffTime ? startDiffDayTime.diffDay + startDiffDayTime.diffTime : ""}` : ""}后开始PK` : ""}
                  {heatStatus == STATUS.open ? `PK中 ${endDiffDayTime ? `${endDiffDayTime.diffTime ? endDiffDayTime.diffDay + endDiffDayTime.diffTime : ""}` : ""}` : ""}
                  {heatStatus == STATUS.finish ? `PK已结束` : ""}
                </View>
              </View>
            </View>
          </View>
        </View>
        <AtDivider height={12} lineColor="#E5E5E5"/>
        <ScrollView scrollY
                    className="qz-heat-player-content"
                    style={this.props.tabScrollStyle}
                    upperThreshold={20}
                    lowerThreshold={20}
                    onScrollToUpper={this.onPullDownRefresh}
                    onScrollToLower={this.onReachBottom}>
          <View className="qz-heat-player__grid">
            {pulldownRefresh ? <View className="qz-heat-player__loading">
              <AtActivityIndicator mode="center" content="加载中..."/>
            </View> : null}
            {playerHeats && playerHeats.records.map((data: any) => (
                <View key={data.id}
                      className={`qz-heat-player__grid-item ${currentPlayerHeat && currentPlayerHeat.id == data.id ? "qz-heat-player__grid-item-active" : ""}`}
                      onClick={onPlayerClick.bind(this, data)}>
                  <View className="qz-heat-player__grid-item-team">
                    <Image src={data.team && data.team.headImg ? data.team.headImg : defaultLogo}/>
                  </View>
                  <View className="qz-heat-player__grid-item-img-container">
                    <Image src={data.player && data.player.headImg ? data.player.headImg : noperson}/>
                    <View className="qz-heat-player__grid-item-heat">
                      <Image src={flame}/>
                      <Text className="qz-heat-player__grid-item-heat-value">{getHeat(data)}</Text>
                    </View>
                    {isTopPlayerHeat(data, topPlayerHeats) ?
                      <View
                        className={`qz-heat-player__grid-item-rank qz-heat-player__grid-item-rank-${isTopPlayerHeat(data, topPlayerHeats)}`}>
                      </View> : null}
                  </View>
                  <View className="qz-heat-player__grid-item-name">
                    <Text>{data.player && data.player.name ? data.player.name : "球员"}</Text>
                  </View>
                  {/*<View className="qz-heat-player__grid-item-shirt">*/}
                  {/*  <Text>{data.player && data.player.shirtNum ? data.player.shirtNum : "0"}</Text>*/}
                  {/*</View>*/}
                  {heatType && heatType == global.HEAT_TYPE.PLAYER_HEAT ?
                    <View className="qz-heat-player__grid-item-shirtNum">
                      <Text>{data.player && data.player.shirtNum ? data.player.shirtNum : "0"}号</Text>
                    </View> : null}
                  {heatType && heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT ?
                    <View className="qz-heat-player__grid-item-shirtNum">
                      <Text>{data.sequence ? data.sequence : "0"}号</Text>
                    </View> : null}
                  <View
                    className={`qz-heat-player__grid-item-popup ${currentPlayerHeat && currentPlayerHeat.id == data.id ? "qz-heat-player__grid-item-popup-active" : ""}`}>
                    <RoundButton
                      margin="0 5px"
                      size={25}
                      img={share}
                      openType="share"
                      onClick={() => {
                      }}/>
                    <RoundButton
                      margin="0 5px"
                      size={25}
                      img={moment}
                      onClick={this.handleShareMoment}/>
                    <RoundButton
                      animation
                      margin="0 5px"
                      size={25}
                      img={flame}
                      onClick={this.handleSupport}/>
                  </View>
                </View>
              )
            )}
            {playerHeats && playerHeats.total <= playerHeats.records.length ? <View className="qz-heat-player__nomore">
              <AtLoadMore status="noMore" noMoreText="没有更多了"/>
            </View> : null}
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
                    {heatType && heatType == global.HEAT_TYPE.PLAYER_HEAT ?
                      <Text>({currentPlayerHeat.player && currentPlayerHeat.player.shirtNum ? currentPlayerHeat.player.shirtNum : "0"}号)</Text>
                      : null}
                    {heatType && heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT ?
                      <Text>({currentPlayerHeat.sequence ? currentPlayerHeat.sequence : "0"}号)</Text> : null}
                  </View>
                  <View className="qz-heat-player-footer-heat">
                    <Image src={flame}/>
                    <Text>{getHeat(currentPlayerHeat)}</Text>
                    {/*<Text>(第{currentPlayerHeat.index}名)</Text>*/}
                  </View>
                </View>
                :
                <View className="qz-heat-player-footer-heat">
                  请选择球员
                </View>
              }
              <View className="qz-heat-player-footer-left-share">
                <RoundButton
                  margin="0 0 0 10px"
                  size={25}
                  img={share}
                  openType="share"
                  onClick={() => {
                  }}/>
                <RoundButton
                  margin="0 0 0 10px"
                  size={25}
                  img={moment}
                  onClick={this.handleShareMoment}/>
              </View>
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
                点赞
              </AtButton>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default HeatPlayer
