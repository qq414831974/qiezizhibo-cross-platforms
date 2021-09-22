import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image, ScrollView} from '@tarojs/components'
import {AtSearchBar, AtDivider, AtButton, AtActivityIndicator, AtLoadMore} from 'taro-ui'

import './index.scss'
import {getTimeDifference} from "../../utils/utils";
import noperson from '../../assets/no-person.png';
import flame from '../../assets/live/left-support.png';
import * as global from "../../constants/global";
import RoundButton from "../round-button";
import share from "../../assets/live/share.png";
import moment from "../../assets/live/moment.png";
import Request from "../../utils/request";
import * as api from "../../constants/api";

type PageStateProps = {}

type PageDispatchProps = {
  onHandleTeamSupport?: any;
  onGetTeamHeatInfo?: any;
  onGetTeamHeatInfoAdd?: any;
  onTeamHeatRefresh?: any;
  onPictureDownLoading?: any;
  onPictureDownLoaded?: any;
}

type PageOwnProps = {
  teamHeats?: any;
  topTeamHeats?: any;
  startTime?: any;
  endTime?: any;
  hidden?: any;
  heatType?: any;
  totalHeat?: any;
  isLeague?: any;
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
  currentTeamHeat: any;
  loadingMore: any;
  pulldownRefresh: any;
  heatStatus: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface HeatLeagueTeam {
  props: IProps;
}

const STATUS = {
  unknow: -1,
  unopen: 0,
  open: 1,
  finish: 2,
}

class HeatLeagueTeam extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      timerID_CountDown: null,
      startDiffDayTime: null,
      endDiffDayTime: null,
      searchText: "",
      currentTeamHeat: null,
      loadingMore: false,
      pulldownRefresh: false,
      heatStatus: null,
    }
  }

  componentDidMount() {
    this.props.onTeamHeatRefresh && this.props.onTeamHeatRefresh(this.refresh);
    this.refresh(true);
    this.startTimer_CountDown();
  }

  componentWillUnmount() {
    this.clearTimer_CountDown();
  }

  refresh = (first?) => {
    this.props.onGetTeamHeatInfo(1, 40, this.state.searchText).then((res) => {
      if (first) {
        this.setState({currentTeamHeat: res[0]}, () => {
          this.refreshCurrentTeam();
        })
      } else {
        this.refreshCurrentTeam();
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
    if (this.state.currentTeamHeat == null) {
      Taro.showToast({
        title: "请选择球队",
        icon: "none"
      })
      return;
    }
    this.props.onHandleTeamSupport(this.state.currentTeamHeat.team);
  }
  onSearchChange = (value) => {
    this.setState({
      searchText: value,
    })
  }
  onSearch = () => {
    this.props.onGetTeamHeatInfo(1, 40, this.state.searchText);
  }
  onClear = () => {
    this.setState({
      searchText: "",
    })
    this.props.onGetTeamHeatInfo(1, 40, null);
  }
  onTeamClick = (teamHeat) => {
    if (this.state.currentTeamHeat && this.state.currentTeamHeat.id == teamHeat.id) {
      this.handleSupport();
    }
    this.setState({currentTeamHeat: teamHeat})
  }
  getHeat = (currentTeamHeat) => {
    let heat = 0;
    if (currentTeamHeat) {
      if (currentTeamHeat.heat) {
        heat = heat + currentTeamHeat.heat
      }
      if (currentTeamHeat.heatBase) {
        heat = heat + currentTeamHeat.heatBase
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
    this.props.onGetTeamHeatInfoAdd(this.props.teamHeats.current + 1, 40, this.state.searchText);
    Taro.hideLoading();
    this.setState({loadingMore: false})
  }

  onReachBottom = () => {
    this.nextPage();
  }

  onPullDownRefresh=()=> {
    this.setState({pulldownRefresh: true})
    Taro.showLoading({title: global.LOADING_TEXT})
    this.refresh();
    Taro.hideLoading({
      complete: () => {
        this.setState({pulldownRefresh: false})
      }
    });
  }

  isTopTeamHeat = (teamHeat, topTeamHeat) => {
    if (topTeamHeat && teamHeat) {
      for (let topTeam of topTeamHeat) {
        if (topTeam.id == teamHeat.id) {
          return topTeam.index;
        }
      }
    }
    return null;
  }
  handleShare = () => {

  }
  handleShareMoment = (teamHeat,e) => {
    e.stopPropagation();
    e.preventDefault();
    let currentTeamHeat = this.state.currentTeamHeat;
    if (teamHeat != null && teamHeat.teamId != null) {
      currentTeamHeat = teamHeat;
    }
    if (currentTeamHeat == null) {
      Taro.showToast({
        title: "请选择球队",
        icon: "none"
      })
      return;
    }
    this.props.onPictureDownLoading && this.props.onPictureDownLoading();
    let params: any = {
      leagueId: this.props.leagueId,
      teamId: currentTeamHeat.teamId,
      heatType: this.props.heatType,
    }
    if (this.props.matchId) {
      params.matchId = this.props.matchId;
    }
    new Request().get(api.API_GET_HEAT_COMPETITION_SHARE, params).then((imageUrl: string) => {
      if (imageUrl == null) {
        Taro.showToast({title: "获取图片失败", icon: "none"});
        this.props.onPictureDownLoaded && this.props.onPictureDownLoaded();
        return;
      }
      this.props.onPictureDownLoaded && this.props.onPictureDownLoaded(imageUrl);
    })
  }
  refreshCurrentTeam = () => {
    const {currentTeamHeat = null} = this.state;
    let teamHeats = this.props.teamHeats;
    teamHeats && teamHeats.records.forEach((data: any) => {
      if (currentTeamHeat && currentTeamHeat.id == data.id) {
        this.setState({currentTeamHeat: data})
      }
    })
  }
  handleFeedbackClick = () => {
    Taro.navigateTo({
      url: "/pages/feedback/feedback",
    })
  }

  render() {
    const {startDiffDayTime, endDiffDayTime, currentTeamHeat = null, pulldownRefresh = false} = this.state
    const {hidden = false} = this.props
    let teamHeats = this.props.teamHeats;
    let topTeamHeats = this.props.topTeamHeats;
    let isTopTeamHeat = this.isTopTeamHeat;
    const onTeamClick = this.onTeamClick;
    const getHeat = this.getHeat;
    const heatStatus = this.state.heatStatus;
    if (hidden) {
      return <View/>
    }

    return (
      <View className={`${this.props.isLeague ? "qz-heat-team-container-league" : "qz-heat-team-container"}`}
            style={this.props.tabContainerStyle}>
        <View className="qz-heat-team-header">
          <View className="qz-heat-team-header__search">
            <AtSearchBar
              value={this.state.searchText}
              onChange={this.onSearchChange}
              onActionClick={this.onSearch}
              onConfirm={this.onSearch}
              onClear={this.onClear}
              placeholder="输入名字查找球队"
            />
          </View>
          <View className="qz-heat-team-header__status">
            {/*<View className="qz-heat-team-header__status-feedback">*/}
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
              {/*  <View className="w-full center qz-heat-team-header__status-title">*/}
              {/*    参赛球队*/}
              {/*  </View>*/}
              {/*  <View className="w-full center qz-heat-team-header__status-value">*/}
              {/*    {teamHeats && teamHeats.total ? teamHeats.total : 0}*/}
              {/*  </View>*/}
              {/*</View>*/}
              {/*<View className="at-col at-col-4">*/}
              {/*  <View className="w-full center qz-heat-team-header__status-title">*/}
              {/*    累计人气值*/}
              {/*  </View>*/}
              {/*  <View className="w-full center qz-heat-team-header__status-value">*/}
              {/*    {totalHeat ? totalHeat : 0}*/}
              {/*  </View>*/}
              {/*</View>*/}
              {/*<View className="at-col at-col-4">*/}
              <View className="at-col at-col-12">
                <View className="w-full center qz-heat-team-header__status-title">
                  活动结束倒计时
                </View>
                <View className="w-full center qz-heat-team-header__status-value">
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
                    className="qz-heat-team-content"
                    style={this.props.tabScrollStyle}
                    upperThreshold={20}
                    lowerThreshold={20}
                    onScrollToUpper={this.onPullDownRefresh}
                    onScrollToLower={this.onReachBottom}>
          <View className="qz-heat-team__list">
            {pulldownRefresh ? <View className="qz-heat-team__loading">
              <AtActivityIndicator mode="center" content="加载中..."/>
            </View> : null}
            {teamHeats && teamHeats.records.map((data: any, index) => (
                <View key={data.id}
                      className={`qz-heat-team__list-item ${currentTeamHeat && currentTeamHeat.id == data.id ? "qz-heat-team__list-item-active" : ""}`}
                      onClick={onTeamClick.bind(this, data)}>
                  {isTopTeamHeat(data, topTeamHeats) ?
                    <View
                      className={`qz-heat-team__list-item-rank qz-heat-team__list-item-rank-${isTopTeamHeat(data, topTeamHeats)}`}>
                    </View> : <View className="qz-heat-team__list-item-rank">{index + 1}.</View>}
                  <View className="qz-heat-team__list-item-img-container">
                    <Image src={data.team && data.team.headImg ? data.team.headImg : noperson}/>
                  </View>
                  <View className="qz-heat-team__list-item-name">
                    <Text>{data.team && data.team.name ? data.team.name : "球队"}</Text>
                  </View>
                  <View className="qz-heat-team__list-item-right-share">
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
                      onClick={this.handleShareMoment.bind(this, data)}/>
                  </View>
                  <View className="qz-heat-team__list-item-heat">
                    <Image src={flame}/>
                    <Text className="qz-heat-team__list-item-heat-value">{getHeat(data)}</Text>
                  </View>
                </View>
              )
            )}
            {teamHeats && teamHeats.total <= teamHeats.records.length ? <View className="qz-heat-team__nomore">
              <AtLoadMore status="noMore" noMoreText="没有更多了"/>
            </View> : null}
          </View>
        </ScrollView>
        <View className="qz-heat-team-footer">
          <View className="at-row">
            <View className="at-col at-col-9 qz-heat-team-footer-left">
              {currentTeamHeat ?
                <View className="qz-heat-team-footer-left-info">
                  <View className="qz-heat-team-footer-user">
                    <Image
                      src={currentTeamHeat.team && currentTeamHeat.team.headImg ? currentTeamHeat.team.headImg : noperson}/>
                    <Text>{currentTeamHeat.team && currentTeamHeat.team.name ? currentTeamHeat.team.name : "球队"}</Text>
                  </View>
                  <View className="qz-heat-team-footer-heat">
                    <Image src={flame}/>
                    <Text>{getHeat(currentTeamHeat)}</Text>
                    {/*<Text>(第{currentTeamHeat.index}名)</Text>*/}
                  </View>
                </View>
                :
                <View className="qz-heat-team-footer-heat">
                  请选择球队
                </View>
              }
              <View className="qz-heat-team-footer-left-share">
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
            <View className="at-col at-col-3 qz-heat-team-footer-right">
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

export default HeatLeagueTeam
