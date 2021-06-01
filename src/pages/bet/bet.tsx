import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Button, Picker} from '@tarojs/components'
import {AtLoadMore, AtAvatar, AtIcon, AtButton, AtModal, AtModalContent, AtModalAction} from "taro-ui"
import {connect} from 'react-redux'

import './bet.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import {formatTime, getTimeDifference, toLogin} from "../../utils/utils";
import defaultLogo from "../../assets/default-logo.png";
import BetRule from "./components/bet-rule";
import BetModal from "./components/modal-bet";
import {FootballEventType} from "../../constants/global";
import BetRank from "../../components/bet-rank";
import * as error from "../../constants/error";
import NavBar from "../../components/nav-bar";

const eventType: { [key: number]: { text: string, color: string }; } = {};
eventType[-1] = {text: "未开始", color: "unopen"};
eventType[0] = {text: "比赛中", color: "live"};
eventType[11] = {text: "加时", color: "live"};
eventType[12] = {text: "点球大战", color: "live"};
eventType[13] = {text: "伤停", color: "live"};
eventType[14] = {text: "中场", color: "live"};
eventType[15] = {text: "下半场", color: "live"};
eventType[16] = {text: "暂停", color: "live"};
eventType[21] = {text: "比赛结束", color: "finish"};

const numberList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const scoreList: { [key: string]: Array<{ title: string, score: string }>; } = {};
scoreList["host"] = [{
  title: "1-0",
  score: "1-0"
}, {
  title: "2-0",
  score: "2-0"
}, {
  title: "2-1",
  score: "2-1"
}, {
  title: "3-0",
  score: "3-0"
}, {
  title: "3-1",
  score: "3-1"
}, {
  title: "3-2",
  score: "3-2"
}, {
  title: "4-0",
  score: "4-0"
}, {
  title: "4-1",
  score: "4-1"
}, {
  title: "4-2",
  score: "4-2"
}, {
  title: "4-3",
  score: "4-3"
}, {
  title: "5-0",
  score: "5-0"
}, {
  title: "5-1",
  score: "5-1"
}, {
  title: "5-2",
  score: "5-2"
}, {
  title: "5-3",
  score: "5-3"
}, {
  title: "5-4",
  score: "5-4"
}];
scoreList["draw"] = [{
  title: "0-0",
  score: "0-0"
}, {
  title: "1-1",
  score: "1-1"
}, {
  title: "2-2",
  score: "2-2"
}, {
  title: "3-3",
  score: "3-3"
}, {
  title: "4-4",
  score: "4-4"
}, {
  title: "5-5",
  score: "5-5"
}];
scoreList["guest"] = [{
  title: "0-1",
  score: "0-1"
}, {
  title: "0-2",
  score: "0-2"
}, {
  title: "1-2",
  score: "1-2"
}, {
  title: "0-3",
  score: "0-3"
}, {
  title: "1-3",
  score: "1-3"
}, {
  title: "2-3",
  score: "2-3"
}, {
  title: "0-4",
  score: "0-4"
}, {
  title: "1-4",
  score: "1-4"
}, {
  title: "2-4",
  score: "2-4"
}, {
  title: "3-4",
  score: "3-4"
}, {
  title: "0-5",
  score: "0-5"
}, {
  title: "1-5",
  score: "1-5"
}, {
  title: "2-5",
  score: "2-5"
}, {
  title: "3-5",
  score: "3-5"
}, {
  title: "4-5",
  score: "4-5"
}];

const STATUS = {
  unknow: -1,
  unopen: 0,
  open: 1,
  finish: 2,
}
type PageStateProps = {
  userInfo: any;
  expInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  total: number;
  current: number;
  match: any;
  betInfo: any;
  startDiffDayTime: any;
  endDiffDayTime: any;
  timerID_CountDown: any;
  betStatus: any;
  rankShow: boolean;
  ruleShow: boolean;
  betShow: boolean;
  currentBetScore: any;
  currentBetScoreSelect: any;
  betRanks: any;
  betRanksLoading: any;
  freeBetLoading: boolean;
  freeBetTimes: number;
  betInputShow: boolean;
  betInputHost: any;
  betInputGuest: any;
  costomType: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Bet {
  props: IProps;
}

class Bet extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      total: 0,
      current: 0,
      match: {},
      betInfo: null,
      startDiffDayTime: null,
      endDiffDayTime: null,
      timerID_CountDown: null,
      betStatus: null,
      rankShow: false,
      ruleShow: false,
      betShow: false,
      currentBetScore: null,
      currentBetScoreSelect: null,
      betRanks: null,
      betRanksLoading: null,
      freeBetLoading: false,
      freeBetTimes: 0,
      betInputShow: false,
      betInputHost: null,
      betInputGuest: null,
      costomType: null,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    const id = this.getParamId();
    if (id) {
      this.getMatchInfo(id);
      this.getFreeBetTime();
    }
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getFreeBetTime = () => {
    const openId = this.props.userInfo ? this.props.userInfo.wechatOpenid : null
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    if (userNo == null || openId == null) {
      Taro.showToast({
        title: "登录失效，请重新登录",
        icon: 'none',
        complete: () => {
          toLogin();
        }
      })
      return;
    }
    this.setState({freeBetLoading: true});
    new Request().get(api.API_BET_FREE, {userNo: userNo}).then((freeBet: any) => {
      if (freeBet) {
        this.setState({freeBetTimes: freeBet.freeTime, freeBetLoading: false})
      }
    })
  }
  getMatchInfo = (id) => {
    this.setState({loading: true})
    new Request().get(api.API_MATCH(id), null).then((data: any) => {
      if (data) {
        this.setState({match: data});
        this.getBetRanks(data.leagueId);
        new Request().get(api.API_MATCH_BET, {matchId: id}).then((betData: any) => {
          if (betData) {
            this.setState({betInfo: betData, loading: false}, () => {
              this.startTimer_CountDown();
            })
          }
        })
      }
    })
  }
  getBetRanks = (leagueId) => {
    this.setState({betRanksLoading: true})
    new Request().get(api.API_BET_RANK, {leagueId: leagueId}).then((data: any) => {
      if (Array.isArray(data)) {
        data = data.filter(res => res.count != null && res.count != 0);
        this.setState({betRanks: data, betRanksLoading: false})
      }
    });
  }
  getParamId = () => {
    const router = getCurrentInstance().router;
    let id;
    if (router != null && router.params != null) {
      if (router.params.id == null && router.params.scene != null) {
        id = router.params.scene
      } else if (router.params.id != null) {
        id = router.params.id
      } else {
        return null
      }
    } else {
      return null;
    }
    return id;
  }

  startTimer_CountDown = () => {
    this.clearTimer_CountDown();
    const timerID_CountDown = setInterval(() => {
      const status = this.getStatus();
      this.setState({betStatus: status})
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
  getStartDiffTime = () => {
    const {betInfo = {}, match = {}} = this.state
    let startTime = new Date(match.startTime)
    if (match && match.startTime && betInfo && betInfo.startInterval) {
      startTime.setMinutes(startTime.getMinutes() + betInfo.startInterval);
    }
    if (startTime) {
      const diff = getTimeDifference(startTime, true);
      this.setState({
        startDiffDayTime: diff,
      });
    }
  }
  getEndDiffTime = () => {
    const {betInfo = {}, match = {}} = this.state
    let endTime = new Date(match.startTime)
    if (match && match.startTime && betInfo && betInfo.endInterval) {
      endTime.setMinutes(endTime.getMinutes() + betInfo.endInterval);
    }
    if (endTime) {
      const diff = getTimeDifference(endTime, true);
      this.setState({
        endDiffDayTime: diff,
      });
    }
  }
  getStatus = () => {
    const {betInfo = {}, match = {}} = this.state

    const startTime = new Date(match.startTime);
    let endTime = new Date(match.startTime);

    if (match.status > FootballEventType.UNOPEN) {
      return STATUS.finish;
    }

    if (match && match.startTime && betInfo && betInfo.endInterval) {
      endTime.setMinutes(endTime.getMinutes() + betInfo.endInterval);
    }
    if (match && match.startTime && betInfo && betInfo.startInterval) {
      startTime.setMinutes(startTime.getMinutes() + betInfo.startInterval);
    }

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
  handleBetRankClick = () => {
    this.setState({rankShow: true});
  }
  handleBetRankCancel = () => {
    this.setState({rankShow: false});
  }
  handleBetRuleClick = () => {
    this.setState({ruleShow: true});
  }
  handleBetRuleCancel = () => {
    this.setState({ruleShow: false});
  }
  handleBetClick = (score, select) => {
    // if (this.state.betStatus != STATUS.open) {
    //   Taro.showToast({
    //     'title': "不在竞猜时间段内",
    //     'icon': 'none',
    //   })
    //   return;
    // }
    this.setState({betShow: true, currentBetScore: score, currentBetScoreSelect: select});
  }
  handleBetCancel = () => {
    this.setState({betShow: false});
  }
  handleBetError = (reason) => {
    this.setState({betShow: false});
    switch (reason) {
      case error.ERROR_PAY_CANCEL: {
        Taro.showToast({
          title: "支付失败,用户取消支付",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_PAY_ERROR: {
        Taro.showToast({
          title: "支付失败",
          icon: 'none',
        });
        return;
      }
    }
  }
  handleBetConfirm = () => {
    this.setState({betShow: false});
    Taro.showToast({
      'title': "参与过的竞猜，可在主界面“我的→我的竞猜”中查看。",
      'icon': 'none',
      'duration': 5000,
    })
  }
  onInputScoreClick = (type) => {
    this.setState({betInputShow: true, betInputHost: null, betInputGuest: null, costomType: type})
  }
  onBetInputHide = () => {
    this.setState({betInputShow: false})
  }
  handleBetHostScoreChange = (e) => {
    this.setState({
      betInputHost: e.detail.value
    })
  }
  handleBetGuestScoreChange = (e) => {
    this.setState({
      betInputGuest: e.detail.value
    })
  }
  handleBetInputConfirm = () => {
    if (this.state.betInputHost == null || this.state.betInputGuest == null ||
      Number(this.state.betInputHost) != this.state.betInputHost || Number(this.state.betInputGuest) != this.state.betInputGuest) {
      Taro.showToast({
        'title': "请选择正确的比分",
        'icon': 'none',
      })
      return;
    }
    this.setState({betInputShow: false})
    this.handleBetClick(`${this.state.betInputHost}-${this.state.betInputGuest}`, `${this.state.costomType}-costom`)
  }

  render() {
    const {match = {}, loading, startDiffDayTime, endDiffDayTime, betStatus} = this.state
    if (loading) {
      return <AtLoadMore status="loading" loadingText="加载中..."/>
    }
    return (
      <View className='qz-bet-content'>
        <NavBar
          title='比分竞猜'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-bet-match-up'>
          <View className='qz-bet-match-up__team'>
            <View className='qz-bet-match-up__team-avatar'>
              <AtAvatar circle
                        size='large'
                        image={match.hostTeam && match.hostTeam.headImg ? match.hostTeam.headImg : defaultLogo}/>
            </View>
            <Text
              className='qz-bet-match-up__team-name'>
              {match.hostTeam ? match.hostTeam.name : ""}
            </Text>
          </View>
          <View className='qz-bet-match-up__vs'>
            <View className='qz-bet-match-up__vs-content'>
              {match.league != null ?
                <Text className="qz-bet-match-up__vs-league-name">
                  {match.league.shortName ? match.league.shortName : match.league.name}
                </Text> : <View/>}
              {match.startTime ? <Text className='qz-bet-match-up__vs-match-time'>
                {`${formatTime(new Date(match.startTime))} ${eventType[match.status != null ? match.status : -1].text}`}
              </Text> : null}
              <Text
                className={match.penaltyScore ? 'qz-bet-match-up__vs-match-score qz-bet-match-up__vs-match-score-small' : 'qz-bet-match-up__vs-match-score'}>
                {match.status == -1 ? "VS" : match.score}
              </Text>
              {match.penaltyScore ?
                <Text className='qz-bet-match-up__vs-match-score-penalty'>
                  {match.penaltyScore}
                </Text> : null
              }
              {match.round != null ?
                <Text className='qz-bet-match-up__vs-match-round'>
                  {match.round}
                </Text> : <View/>}
              {match.place ?
                <View className='qz-bet-match-up__vs-match-place'>
                  <AtIcon value='map-pin' size='12' className='qz-bet-match-up__vs-match-place-icon'/>
                  <Text className='text'>
                    {match.place}
                  </Text>
                </View>
                : null
              }
            </View>
          </View>
          <View className='qz-bet-match-up__team'>
            <View className='qz-bet-match-up__team-avatar'>
              <AtAvatar circle
                        size='large'
                        image={match.guestTeam && match.guestTeam.headImg ? match.guestTeam.headImg : defaultLogo}/>
            </View>
            <Text
              className='qz-bet-match-up__team-name'>
              {match.guestTeam ? match.guestTeam.name : ""}
            </Text>
          </View>
        </View>
        <View className='qz-bet-score'>
          <View className='qz-bet-score-header'>
            <View className='qz-bet-score-header-item'>
              {match.hostTeam ? match.hostTeam.name : ""}
            </View>
            <View className='qz-bet-score-header-item'>
              和局
            </View>
            <View className='qz-bet-score-header-item'>
              {match.guestTeam ? match.guestTeam.name : ""}
            </View>
          </View>
          <View className='qz-bet-score-content'>
            <View className='qz-bet-score-content-item-list'>
              <View className='qz-bet-score-content-item'>
                {scoreList["host"].map(item =>
                  <View key={item.score}
                        className={item.score == this.state.currentBetScoreSelect ? "qz-bet-score-content-item-view-hover" : "qz-bet-score-content-item-view"}
                        onClick={this.handleBetClick.bind(this, item.score, item.score)}>
                    {item.title}
                  </View>
                )}
              </View>
              <View className='qz-bet-score-content-item' onClick={this.onInputScoreClick.bind(this, "win")}>
                <View
                  className={"win-costom" == this.state.currentBetScoreSelect ? "qz-bet-score-content-item-view-hover" : "qz-bet-score-content-item-view"}>
                  自定义
                </View>
              </View>
            </View>
            <View className='qz-bet-score-content-item-list'>
              <View className='qz-bet-score-content-item'>
                {scoreList["draw"].map(item =>
                  <View key={item.score}
                        className={item.score == this.state.currentBetScoreSelect ? "qz-bet-score-content-item-view-hover" : "qz-bet-score-content-item-view"}
                        onClick={this.handleBetClick.bind(this, item.score, item.score)}>
                    {item.title}
                  </View>
                )}
              </View>
              <View className='qz-bet-score-content-item' onClick={this.onInputScoreClick.bind(this, "draw")}>
                <View
                  className={"draw-costom" == this.state.currentBetScoreSelect ? "qz-bet-score-content-item-view-hover" : "qz-bet-score-content-item-view"}>
                  自定义
                </View>
              </View>
            </View>
            <View className='qz-bet-score-content-item-list'>
              <View className='qz-bet-score-content-item'>
                {scoreList["guest"].map(item =>
                  <View key={item.score}
                        className={item.score == this.state.currentBetScoreSelect ? "qz-bet-score-content-item-view-hover" : "qz-bet-score-content-item-view"}
                        onClick={this.handleBetClick.bind(this, item.score, item.score)}>
                    {item.title}
                  </View>
                )}
              </View>
              <View className='qz-bet-score-content-item' onClick={this.onInputScoreClick.bind(this, "lost")}>
                <View
                  className={"lost-costom" == this.state.currentBetScoreSelect ? "qz-bet-score-content-item-view-hover" : "qz-bet-score-content-item-view"}>
                  自定义
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className='qz-bet-footer'>
          <View className="at-row">
            <View className="at-col at-col-6 qz-bet-footer-left">
              <View className="qz-bet-footer-left-title">
                免费竞猜次数剩余：{this.state.freeBetTimes != null ? this.state.freeBetTimes : 0}
              </View>
              <View className="qz-bet-footer-left-text">
                {betStatus == STATUS.unopen ? `${startDiffDayTime ? `${startDiffDayTime.diffTime ? startDiffDayTime.diffDay + startDiffDayTime.diffTime : ""}` : ""}后开始` : ""}
                {betStatus == STATUS.open ? `竞猜中 ${endDiffDayTime ? `${endDiffDayTime.diffTime ? endDiffDayTime.diffDay + endDiffDayTime.diffTime : ""}` : ""}` : ""}
                {betStatus == STATUS.finish ? `竞猜已结束` : ""}
              </View>
            </View>
            <View className="at-col at-col-3 qz-bet-footer-right">
              <AtButton
                className="vertical-middle"
                size="small"
                type="primary"
                full
                circle
                onClick={this.handleBetRankClick}
              >
                竞猜榜
              </AtButton>
            </View>
            <View className="at-col at-col-3 qz-bet-footer-right">
              <AtButton
                className="vertical-middle"
                size="small"
                type="primary"
                full
                circle
                onClick={this.handleBetRuleClick}
              >
                活动规则
              </AtButton>
            </View>
          </View>
        </View>
        <BetRule
          betRule={this.state.betInfo}
          loading={this.state.betInfo == null}
          isOpened={this.state.ruleShow}
          handleCancel={this.handleBetRuleCancel}
        />
        <BetModal
          betStatus={this.state.betStatus}
          isOpened={this.state.betShow}
          matchId={this.getParamId()}
          betInfo={this.state.betInfo}
          match={this.state.match}
          score={this.state.currentBetScore}
          handleCancel={this.handleBetCancel}
          handleError={this.handleBetError}
          handleConfirm={this.handleBetConfirm}
        />
        <BetRank
          betRanks={this.state.betRanks}
          loading={this.state.betRanksLoading}
          isOpened={this.state.rankShow}
          handleCancel={this.handleBetRankCancel}
          expInfo={this.props.expInfo}
        />
        <AtModal isOpened={this.state.betInputShow} onClose={this.onBetInputHide}>
          <AtModalContent>
            <View className="qz-bet-input-container">
              <View className="qz-bet-input-header">
                请选择比分
              </View>
              <View className="at-row">
                <View className="at-col at-col-5">
                  <Picker value={0} mode='selector' range={numberList} onChange={this.handleBetHostScoreChange}>
                    <View className="qz-bet-input-socre">
                      {this.state.betInputHost ? this.state.betInputHost : '请选择'}
                    </View>
                  </Picker>
                </View>
                <View className="at-col at-col-2">
                  <View className="qz-bet-input-socre">
                    -
                  </View>
                </View>
                <View className="at-col at-col-5">
                  <Picker value={0} mode='selector' range={numberList} onChange={this.handleBetGuestScoreChange}>
                    <View className="qz-bet-input-socre">
                      {this.state.betInputGuest ? this.state.betInputGuest : '请选择'}
                    </View>
                  </Picker>
                </View>
              </View>
            </View>
          </AtModalContent>
          <AtModalAction>
            <Button className="mini-gray" onClick={this.onBetInputHide}>关闭</Button>
            <Button className="black" onClick={this.handleBetInputConfirm}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    expInfo: state.config ? state.config.expInfo : [],
  }
}
export default connect(mapStateToProps)(Bet)
