import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Image, Video, ScrollView} from '@tarojs/components'
import {AtTabs, AtTabsPane, AtIcon, AtMessage} from "taro-ui"
import {connect} from '@tarojs/redux'
import MatchUp from './components/match-up'
import StatBar from './components/stat-bar'
import RoundButton from '../../components/round-button'
import * as api from '../../constants/api'

import './live.scss'
import matchAction from "../../actions/match";
import liveAction from "../../actions/live";
import playerAction from "../../actions/player";
import {getTimeDifference, getStorage, hasLogin, clearLoginToken} from '../../utils/utils'
import {FootballEventType, MATCH_TYPE, LOADING_TEXT, CacheManager} from "../../constants/global";
import defaultLogo from '../../assets/default-logo.png'
import supportLeft from '../../assets/live/support-left.png'
import supportRight from '../../assets/live/support-right.png'
import star from '../../assets/live/star.png'
import starActive from '../../assets/live/star-active.png'
import share from '../../assets/live/share.png'
import headphones from '../../assets/live/headphones.png'
import playButton from '../../assets/live/play-button-disabled.png'
import withShare from "../../utils/withShare";
import TimeLine from "./components/time-line";
import Statistics from "./components/statistics";
import LineUp from "./components/line-up";
import ChattingRoom from "./components/chatting-room";
import LoginModal from "../../components/modal-login";
import PhoneModal from "../../components/modal-phone";
import EncryptionModal from "../../components/modal-encryption";
import * as error from "../../constants/error";
import userAction from "../../actions/user";
import goal from "../../assets/live/goal.png";
import shoot from "../../assets/live/shoot.png";
import yellowcard from "../../assets/live/yellowcard.png";
import redcard from "../../assets/live/redcard.png";
import change from "../../assets/live/change.png";
import substitutionLeft from "../../assets/live/substitution_arrow.png";
import substitutionRight from "../../assets/live/substitution_arrow_right.png";
import owngoal from "../../assets/live/owngoal.png";
import Request from "../../utils/request";

type Bulletin = {
  id: number,
  content: string,
  type: string,
  url: string
}

type PageStateProps = {
  match: any;
  mediaList: any;
  matchStatus: any;
  ping: any;
  playerList: any;
  userInfo: any;
  commentList: any;
  danmuList: any;
  bulletinConfig: Array<Bulletin>,
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  diffDayTime: any;
  liveStatus: LiveStatus;
  currentTab: number;
  leftMoveClass: string;
  rightMoveClass: string;
  leftNooice: number;
  rightNooice: number;
  nooiceEnabled: boolean;
  isCollect: boolean;
  playerLoading: boolean;
  chatLoading: boolean;
  commentIntoView: any;
  loginOpen: boolean;
  phoneOpen: boolean;
  currentMedia: number;
  isFullScreen: boolean;
  videoShowMore: boolean;
  mediaListShowMore: boolean;
  videoTime: number;
  danmuCurrent: any;
  liveLoading: boolean;
  liveLoaded: boolean;
  tryplayed: boolean;
  firstplay: boolean;
  danmuUnable: boolean;
  comments: any;
  isEncryption: any;
  password: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Live {
  props: IProps;
}

enum LiveStatus {
  FINISH,//比赛结束
  UNOPEN,//未开始
  ONTIME,//比赛时间开始了没在推流
  NOTPUSH,//比赛点了开始但没在推流
  ENABLED,//可以看
  LOADING,//加载中
}

const eventType = {
  1: {text: "进球", icon: goal},
  2: {text: "射门", icon: shoot},
  7: {text: "黄牌", icon: yellowcard},
  8: {text: "红牌", icon: redcard},
  10: {text: "换人", icon: change, secondIcon: {left: substitutionLeft, right: substitutionRight}},
  22: {text: "乌龙球", icon: owngoal},
};

@withShare({})
class Live extends Component<PageOwnProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  timerID_liveInfo: any = null
  timerID_CountDown: any = null
  timerID_matchStatus: any = null
  timerID_socketHeartBeat: any = null
  timerID_danmu: any = null
  timeoutID_playCountDown: any = null;
  socketTask: Taro.SocketTask | null
  videoContext: Taro.VideoContext | null
  timeout_danmu: any = {};
  animElemIds: any = {};
  danmuRow: any = [[], [], [], [], []];
  isupdating: boolean = false;

  config: Config = {
    navigationBarTitleText: '校园足球赛事频道',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  constructor(props) {
    super(props)
    const diff = getTimeDifference(new Date());
    this.state = {
      loading: false,
      diffDayTime: diff,
      liveStatus: LiveStatus.LOADING,
      currentTab: 0,
      leftMoveClass: '',
      rightMoveClass: '',
      leftNooice: 0,
      rightNooice: 0,
      nooiceEnabled: true,
      isCollect: false,
      playerLoading: false,
      chatLoading: false,
      commentIntoView: null,
      loginOpen: false,
      phoneOpen: false,
      currentMedia: 0,
      isFullScreen: false,
      videoShowMore: true,
      mediaListShowMore: false,
      videoTime: 0,
      danmuCurrent: [],
      liveLoading: false,
      liveLoaded: false,
      tryplayed: false,
      firstplay: true,
      danmuUnable: false,
      comments: [],
      isEncryption: false,
      password: null,
    }
  }

  $setSharePath = () => `/pages/home/home?id=${this.props.match.id}&page=live`

  $setShareTitle = () => this.props.match.name

  // $setShareImageUrl = () => '可设置分享图片路径(优先级最高)'

  componentWillMount() {
    matchAction.getMatchInfo_clear()
  }

  // componentDidMount() {
  componentDidShow() {
    Taro.showLoading({title: LOADING_TEXT})
    this.$router.params && this.$router.params.id && this.getMatchInfo(this.$router.params.id).then((data) => {
      if (data.activityId) {
        if (data.status == FootballEventType.FINISH) {
          this.getLiveMediaInfo(data.activityId)
          if (data.type.indexOf(4) >= 0) {
            this.getMatchDanmu(data.id, this.state.currentMedia);
          }
        }
        const activityId = data.activityId;
        this.setState({liveLoading: true})
        this.getLiveInfo(activityId).then((res) => {
          if (res.isPushing) {
            this.setState({liveLoaded: true, liveLoading: false})
          } else {
            this.setState({liveLoaded: false, liveLoading: false})
          }
          this.startTimer_liveInfo(activityId);
        })
        this.getMatchStatus(data.id).then((status) => {
          this.setUpNooice(status);
          this.startTimer_matchStatus(data.id);
        });
        this.getDiffTime(data)
        this.startTimer_CountDown();
        this.startTimer_Danmu();
        this.getCollection(data.id);
        this.getMatchEncryption(data.id);
        if (data.type.indexOf(4) >= 0) {
          this.initSocket(data.id);
        }
        data.hostTeamId && this.getTeamPlayer(data.id, data.hostTeamId);
      }
      Taro.hideLoading();
    })
    this.videoContext = Taro.createVideoContext("videoPlayer");
    Taro.getSystemInfo().then(data => {
      if (data.platform == 'android') {
        this.setState({danmuUnable: true})
      }
    })
  }

  componentWillUnmount() {
    this.componentDidHide();
  }

  componentDidHide() {
    this.clearTimer_liveInfo();
    this.clearTimer_matchStatus();
    this.clearTimer_CountDown();
    this.clearTimer_HeartBeat();
    this.clearTimer_Danmu();
    this.socketTask && this.socketTask.close({})
    this.socketTask = null;
    this.videoContext && this.videoContext.pause();
    this.videoContext = null;
    this.clearTimer_playCountDown();
  }

  // componentDidShow() {
  //   console.log("componentDidShow")
  // }

  // componentDidHide() {
  //   // this.clearTimer_liveInfo();
  // }

  initSocket = async (matchId) => {
    const context = this;
    const token = await getStorage('accessToken');
    const header = token ? {'Authorization': `Bearer ${token}`} : {};
    Taro.connectSocket({
      url: api.websocket(matchId),
      header: header
    }).then(task => {
      this.socketTask = task;
      task.onOpen(function () {
        context.startTimer_HeartBeat();
      })
      task.onMessage(function (res) {
        if (res.data == 'unauthenticated') {
          Taro.showToast({
            title: "登陆状态过期请重新授权",
            duration: 1000,
            icon: "none",
            complete: () => {
              context.showAuth();
            }
          });
        } else if (res.data !== 'success') {
          if (context.props.matchStatus.status < FootballEventType.FINISH) {
            const comment = JSON.parse(res.data);
            context.sendLiveDanmu({text: comment.content, id: comment.id, user: comment.user});
          } else {
            context.getMatchDanmu(context.props.match.id, context.state.currentMedia);
          }
          context.getCommentList(context.props.match.id);
        }
      })
      task.onError(function () {
        console.log('onError')
      })
      task.onClose(function (e) {
        console.log('onClose: ', e)
      })
    })
  }
  sendMessage = async (message) => {
    const token = await getStorage('accessToken');
    return new Promise((resolve, reject) => {
      if (message == null || message == '') {
        reject();
        return;
      }
      if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
        reject();
        this.showAuth();
        return;
      } else if (this.props.userInfo.phone == null || this.props.userInfo.phone == '') {
        reject();
        this.showPhone();
        return;
      }
      let params: any = {content: message, userNo: this.props.userInfo.userNo, token: token};
      if (this.props.matchStatus.status == FootballEventType.FINISH) {
        params = {
          content: message,
          userNo: this.props.userInfo.userNo,
          token: token,
          danmuindex: this.state.currentMedia,
          danmusecond: this.state.videoTime + 1,
        };
      }
      new Request().post(`${api.API_SYSTEM_SECURITY_CHECK}`, message).then(res => {
        if (res == true) {
          this.socketTask.send({
            data: JSON.stringify(params),
            success: () => {
              resolve();
            },
            fail: () => {
              reject();
              Taro.showToast({title: "发送失败", icon: "none"});
            }
          })
        } else {
          reject();
          Taro.showToast({title: "内容含有违法违规内容", icon: "none"});
        }
      });
    })
  }
  clearTimer_playCountDown = () => {
    if (this.timeoutID_playCountDown) {
      clearTimeout(this.timeoutID_playCountDown)
    }
  }
  startTimer_Danmu = () => {
    this.clearTimer_Danmu();
    this.timerID_danmu = setInterval(() => {
      this.refreshDanmu();
    }, 100)
  }
  clearTimer_Danmu = () => {
    if (this.timerID_danmu) {
      clearInterval(this.timerID_danmu)
    }
  }
  startTimer_HeartBeat = () => {
    this.clearTimer_HeartBeat();
    this.timerID_socketHeartBeat = setInterval(() => {
      this.socketTask.send({data: "success"});
    }, 5000)
  }
  clearTimer_HeartBeat = () => {
    if (this.timerID_socketHeartBeat) {
      clearInterval(this.timerID_socketHeartBeat)
    }
  }
  startTimer_CountDown = () => {
    this.clearTimer_liveInfo();
    this.timerID_CountDown = setInterval(() => {
      this.getDiffTime()
    }, 1000)
  }
  clearTimer_CountDown = () => {
    if (this.timerID_CountDown) {
      clearInterval(this.timerID_CountDown)
    }
  }
  startTimer_matchStatus = (id) => {
    this.clearTimer_matchStatus();
    let timeout = 60000;
    if (CacheManager.getInstance().CACHE_ENABLED) {
      timeout = 300000;
    }
    this.timerID_matchStatus = setInterval(() => {
      const {match} = this.props;
      this.$router.params && this.$router.params.id && this.getMatchInfo(this.$router.params.id).then((data) => {
        if (match && match.status != FootballEventType.FINISH && data.status == FootballEventType.FINISH) {
          this.getLiveMediaInfo(data.activityId)
          this.getMatchDanmu(data.id, this.state.currentMedia);
        }
      })
      this.getMatchStatus(id).then((status) => {
        this.setUpNooice(status);
      })
    }, timeout)
  }
  clearTimer_matchStatus = () => {
    if (this.timerID_matchStatus) {
      clearInterval(this.timerID_matchStatus)
    }
  }

  startTimer_liveInfo = (id) => {
    this.clearTimer_liveInfo();
    this.timerID_liveInfo = setInterval(() => {
      this.setState({liveLoading: true})
      this.getLiveInfo(id).then((res) => {
        if (res.isPushing) {
          this.setState({liveLoaded: true, liveLoading: false})
        } else {
          this.setState({liveLoaded: false, liveLoading: false})
        }
      });
    }, 60000)
  }
  clearTimer_liveInfo = () => {
    if (this.timerID_liveInfo) {
      clearInterval(this.timerID_liveInfo)
    }
  }

  async getUserInfo() {
    if (await hasLogin()) {
      const openid = await getStorage('wechatOpenid');
      userAction.getUserInfo({openId: openid}, {
        success: () => {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }, failed: () => {
          this.clearLoginState();
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      });
    } else {
      this.clearLoginState();
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    }
  }

  getMatchDanmu = (id, index) => {
    if (this.props.match && this.props.match.type.indexOf(4) >= 0) {
      matchAction.getMatchDanmu({matchId: id, index: index});
    }
  }

  getMatchInfo = (id) => {
    return matchAction.getMatchInfo(id)
  }
  getMatchStatus = (id) => {
    return matchAction.getMatchStatus({matchId: id})
  }
  getLiveMediaInfo = (id) => {
    return liveAction.getLiveMediaList(id)
  }
  getLiveInfo = (id) => {
    return new Request().get(api.API_CACHED_LIVE_MANUAL(id), null).then((data: any) => {
      if (data.available) {
        return liveAction.livePingManual(id)
      } else {
        return liveAction.livePing(id)
      }
    })
    // return liveAction.livePing(id)
  }
  getCollection = async (id) => {
    const collectMatch = await getStorage('collectMatch')
    if (collectMatch == null) {
      this.setState({
        isCollect: false
      });
    } else {
      this.setState({
        isCollect: !!collectMatch[id]
      });
    }
  }
  getTeamPlayer = (matchId, teamId) => {
    this.setState({playerLoading: true})
    playerAction.getPlayerList({pageNum: 1, pageSize: 100, teamId: teamId}).then(() => {
      this.setState({playerLoading: false})
    })
  }
  getPlayPath = (match) => {
    if (match.status < FootballEventType.FINISH) {
      if (!match.playPath.startsWith('http')) {
        return "https://" + match.playPath;
      } else {
        return match.playPath;
      }
    } else {
      if (this.props.mediaList && this.props.mediaList.length > 0) {
        const index = this.state.currentMedia <= this.props.mediaList.length - 1 ? this.state.currentMedia : 0;
        const mediaUrl = this.props.mediaList[index].media ? this.props.mediaList[index].media.path : this.props.mediaList[index].url;
        if (!mediaUrl.startsWith('http')) {
          return "https://" + mediaUrl;
        } else {
          return mediaUrl;
        }
      }
    }
    return match.playPath;
  }
  getDiffTime = (data = null) => {
    const {match = data} = this.props;
    if (match) {
      const startTime = match.startTime;
      if (startTime) {
        const diff = getTimeDifference(startTime);
        this.setState({
          diffDayTime: diff,
        }, () => {
          this.setState({liveStatus: this.getLiveStatus()})
        });
      }
    }
  }
  getLiveStatus = () => {
    const {match = null} = this.props;
    let status = LiveStatus.LOADING;
    if (match) {
      if (match.status == FootballEventType.FINISH) {
        status = LiveStatus.FINISH;
      } else {
        if (this.state.liveLoading && !this.state.liveLoaded) {
          status = LiveStatus.LOADING;
        } else if (this.state.diffDayTime != null && match.status == FootballEventType.UNOPEN && !this.props.ping.isPushing) {
          status = LiveStatus.UNOPEN;
        } else if (this.state.diffDayTime == null && match.status == FootballEventType.UNOPEN && !this.props.ping.isPushing) {
          status = LiveStatus.ONTIME;
        } else if (this.state.diffDayTime == null && match.status > FootballEventType.UNOPEN && !this.props.ping.isPushing) {
          status = LiveStatus.NOTPUSH;
        } else {
          status = LiveStatus.ENABLED;
        }
      }
    }
    return status;
  }
  getCommentList = (matchId) => {
    this.setState({chatLoading: true})
    matchAction.getMatchComment({pageNum: 1, pageSize: 10, matchId: matchId}).then(() => {
      // this.setState({commentIntoView: `message-${this.props.commentList.list.length}`})
      const commentList: Array<any> = this.getCommentsList(this.props.commentList.records);
      // setTimeout(() => {
      if (commentList && commentList.length > 0) {
        this.setState({
          comments: this.props.commentList.records,
          chatLoading: false,
          commentIntoView: `message-${commentList[commentList.length - 1].id}`
        })
      } else {
        this.setState({
          comments: this.props.commentList.records,
          chatLoading: false,
        })
      }
      // }, 500)
    })
  }
  getCommentList_next = () => {
    const commentList: Array<any> = this.getCommentsList(this.props.commentList.records);
    return new Promise((resolve, reject) => {
      this.setState({chatLoading: true})
      matchAction.getMatchComment_add({
        pageNum: this.props.commentList.current ? this.props.commentList.current + 1 : 1,
        pageSize: 10,
        matchId: this.props.match.id
      }).then(() => {
        const commentList_next: Array<any> = this.getCommentsList(this.props.commentList.records);
        let index = commentList_next.indexOf(commentList[0]) - 1;
        if (index < 0) {
          index = 0
        }
        if (commentList && commentList.length > 0) {
          this.setState({
            comments: this.props.commentList.records,
            chatLoading: false,
            commentIntoView: `message-${commentList_next[index].id}`,
          })
        } else {
          this.setState({
            comments: this.props.commentList.records,
            chatLoading: false,
          })
        }
        resolve();
      }, () => {
        reject();
      })
    })
  }
  getCommentsList = (comments) => {
    return comments.sort((item1, item2) => {
      const date1 = new Date(item1.date).getTime();
      const date2 = new Date(item2.date).getTime();
      return date1 > date2 ? 1 : (date1 == date2 ? 0 : -1)
    });
  }
  setUpNooice = (status) => {
    this.setState({leftNooice: status.hostnooice, rightNooice: status.guestnooice})
  }

  isThisYear = (date: Date) => {
    const nowDate = new Date();
    if (nowDate.getFullYear() == date.getFullYear()) {
      return true;
    }
    return false;
  }
  switchTab = (tab) => {
    const {match = null} = this.props;
    const tabs: Array<any> = [];
    let tabIndex = 0;
    match && match.type.map(item => {
      if (item != 1) {
        tabIndex = tabIndex + 1;
        tabs[item] = tabIndex;
      }
    })
    this.setState({
      currentTab: tab
    }, () => {
      if (tabs[4] && this.state.currentTab == tabs[4]) {
        this.getCommentList(this.props.match.id);
      }
    })
  }
  onLeagueClick = (item) => {
    if (item.isparent) {
      Taro.navigateTo({url: `../series/series?id=${item.id}`});
    } else {
      Taro.navigateTo({url: `../leagueManager/leagueManager?id=${item.id}`});
    }
  }
  addNooice = (teamId) => {
    matchAction.addMatchNooice({matchId: this.props.match.id, teamId: teamId})
  }
  handleLeftNooice = async () => {
    // if (!this.state.nooiceEnabled) {
    //   Taro.showToast({title: "点赞太快了,请稍后再试哦", icon: "none"})
    //   return
    // }
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.showAuth();
      return;
    }
    this.setState({leftMoveClass: 'move', nooiceEnabled: false});
    setTimeout(() => {
      this.setState({
        leftMoveClass: '',
        leftNooice: this.state.leftNooice + 1,
        nooiceEnabled: true
      });
      this.props.match && this.props.match.hostteam && this.addNooice(this.props.match.hostteam.id)
    }, 1000);
  }
  handleRightNooice = async () => {
    // if (!this.state.nooiceEnabled) {
    //   Taro.showToast({title: "点赞太快了,请稍后再试哦", icon: "none"})
    //   return
    // }
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.showAuth();
      return;
    }
    this.setState({rightMoveClass: 'move', nooiceEnabled: false});
    setTimeout(() => {
      this.setState({
        rightMoveClass: '',
        rightNooice: this.state.rightNooice + 1,
        nooiceEnabled: true
      });
      this.props.match && this.props.match.guestteam && this.addNooice(this.props.match.guestteam.id)
    }, 1000);
  }
  onCollectClick = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.showAuth();
      return;
    }
    const collectMatch = await getStorage('collectMatch')
    let collect = {};
    if (collectMatch != null) {
      collect = collectMatch;
    }
    collect[this.props.match.id] = this.state.isCollect ? false : this.props.match

    Taro.setStorage({key: 'collectMatch', data: collect}).then(() => {
      this.setState({
        isCollect: !this.state.isCollect
      }, () => {
        if (this.state.isCollect) {
          Taro.showToast({title: "收藏成功", icon: "none"});
        } else {
          Taro.showToast({title: "取消收藏成功", icon: "none"});
        }
      });
    }, () => {
      Taro.showToast({title: "收藏失败", icon: "none"});
    });
  }
  switchTeamPlayer = (tab) => {
    if (tab == 0) {
      this.props.match.hostTeamId && this.getTeamPlayer(this.props.match.id, this.props.match.hostTeamId)
    } else {
      this.props.match.guestTeamId && this.getTeamPlayer(this.props.match.id, this.props.match.guestTeamId)
    }
  }

  showAuth = () => {
    this.setState({loginOpen: true});
  }

  onAuthClose = () => {
    this.setState({loginOpen: false})
  }

  onAuthCancel = () => {
    this.setState({loginOpen: false})
  }

  onAuthError = (reason) => {
    switch (reason) {
      case error.ERROR_WX_UPDATE_USER: {
        Taro.showToast({
          title: "更新用户信息失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_WX_LOGIN: {
        Taro.showToast({
          title: "微信登录失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_LOGIN: {
        Taro.showToast({
          title: "登录失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onAuthSuccess = () => {
    this.setState({loginOpen: false})
    this.getUserInfo()
  }

  showPhone = async () => {
    const {userInfo} = this.props
    if (userInfo && userInfo.phone) {
      return;
    }
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      Taro.showToast({title: "请登录后再操作", icon: "none"});
      this.setState({loginOpen: true})
    } else {
      this.setState({phoneOpen: true})
    }
  }

  onPhoneClose = () => {
    this.setState({phoneOpen: false})
  }

  onPhoneCancel = () => {
    this.setState({phoneOpen: false})
  }

  onPhoneError = (reason) => {
    switch (reason) {
      case error.ERROR_WX_UPDATE_USER: {
        Taro.showToast({
          title: "更新用户信息失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_WX_LOGIN: {
        Taro.showToast({
          title: "微信登录失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_LOGIN: {
        Taro.showToast({
          title: "登录失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onPhoneSuccess = () => {
    this.setState({phoneOpen: false})
    this.getUserInfo()
  }
  clearLoginState = () => {
    clearLoginToken();
    userAction.clearUserInfo();
  }
  bindFullScreen = (e) => {
    const {fullScreen} = e.detail;
    this.setState({isFullScreen: fullScreen})
  }
  handleVideoArrowClick = () => {
    this.setState({videoShowMore: !this.state.videoShowMore})
  }
  handleMediaListMoreClick = () => {
    this.setState({mediaListShowMore: !this.state.mediaListShowMore})
  }
  handleMediaFragmentClick = (index) => {
    this.getMatchDanmu(this.props.match.id, index);
    this.setState({currentMedia: index})
  }
  bindPlayEnd = () => {
    const match = this.props.match;
    if (match.status < FootballEventType.FINISH) {
      return;
    } else {
      if (this.props.mediaList && this.props.mediaList.length > 0) {
        if (this.props.mediaList[this.state.currentMedia + 1]) {
          this.getMatchDanmu(this.props.match.id, this.state.currentMedia + 1);
          this.setState({currentMedia: this.state.currentMedia + 1})
        }
      }
    }
  }
  bindPlayStart = async () => {
    if (CacheManager.getInstance().CACHE_ENABLED) {
      return;
    }
    if (!this.state.firstplay) {
      if (this.state.tryplayed) {
        const token = await getStorage('accessToken');
        if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
          this.showAuth();
          this.videoContext && this.videoContext.pause();
        }
      }
      return
    }
    setTimeout(() => {
      this.setState({videoShowMore: false})
    }, 3000)
    this.setState({firstplay: false})
    this.clearTimer_playCountDown();
    this.timeoutID_playCountDown = setTimeout(async () => {
      if (this.props.match && this.props.match.status == FootballEventType.FINISH) {
        const token = await getStorage('accessToken');
        if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
          this.setState({tryplayed: true})
          Taro.showToast({
            title: "录播视频只提供10秒试看，登录后可观看完整视频。",
            duration: 2000,
            icon: "none",
          });
          this.showAuth();
          this.videoContext && this.videoContext.pause();
        }
      }
    }, 10000)
  }

  handleVideoTime = (e) => {
    const {danmuList = null, match = null} = this.props;
    if ((match && match.status == FootballEventType.FINISH)) {
      this.setState({videoTime: Math.floor(e.detail.currentTime)})
      danmuList && danmuList.map(item => {
        if (item.time == Math.floor(e.detail.currentTime) && this.animElemIds[item.id] == null) {
          // console.log("e.detail.currentTime-" + item.id)
          // console.log(e.detail.currentTime)
          this.animElemIds[item.id] = `danmu-${item.id}`;
          item.row = this.assignDanmuRow(item)
          this.state.danmuCurrent.push(item)
          this.initAnimation(item.id);
          this.setState({danmuCurrent: this.state.danmuCurrent})
        }
      })
    }
  }
  sendLiveDanmu = (item) => {
    item.row = this.assignDanmuRow(item)
    this.state.danmuCurrent.push(item)
    this.initAnimation(item.id);
    this.setState({danmuCurrent: this.state.danmuCurrent})
  }

  initAnimation(id) {
    this.timeout_danmu[id] = setTimeout(() => {
      this.timeout_danmu[id] = null
    }, 6000)
  }

  refreshDanmu = () => {
    const indexs: Array<any> = [];
    this.state.danmuCurrent.map((item) => {
      if (this.timeout_danmu[item.id] == null) {
        indexs.push(item);
      }
    });
    // console.log("this.state.danmuCurrent")
    // console.log(this.state.danmuCurrent)
    // console.log("refreshDanmu")
    // console.log(indexs)
    // console.log("timeout_danmu")
    // console.log(this.timeout_danmu)
    if (indexs.length > 0) {
      if (this.isupdating) {
        return;
      }
      this.isupdating = true;
      indexs.map(item => {
        this.state.danmuCurrent.splice(this.state.danmuCurrent.indexOf(item), 1);
      })
      this.setState({danmuCurrent: this.state.danmuCurrent}, () => {
        indexs.map(item => {
          this.animElemIds[item.id] = null;
        })
        this.isupdating = false;
      });
    }
  }
  assignDanmuRow = (danmuItem) => {
    let rowIndex = -1;
    const isNext = (row) => {
      let next = false;
      row.map(col => {
        if (col.time == danmuItem.time) {
          next = true;
        }
      })
      return next;
    }
    let isFind = false;
    this.danmuRow.map((row, index) => {
      if (!isNext(row) && !isFind) {
        this.danmuRow[index].push(danmuItem)
        setTimeout(() => {
          this.danmuRow[index].splice(this.danmuRow[index].indexOf(danmuItem), 1);
        }, 6000)
        rowIndex = index;
        isFind = true;
      }
    })
    // console.log("this.danmuRow-" + rowIndex)
    // console.log(this.danmuRow)
    if (rowIndex == -1) {
      const danmu = danmuItem
      danmu.time = danmu.time + 3;
      return this.assignDanmuRow(danmu)
    }
    return rowIndex;
  }
  bindPlayError = (e) => {
    console.log("bindPlayError")
    console.log(e)
  }

  getMatchEncryption = (matchId) => {
    new Request().get(api.API_MATCH_ENCRYPTION(matchId), null).then((data: any) => {
      if (data.isEncryption && data.password) {
        this.setState({isEncryption: true, password: data.password});
      }
    })
  }
  onEncryptionConfirm = (password) => {
    if (password == this.state.password) {
      Taro.atMessage({
        'message': '欢迎进入',
        'type': 'success',
      })
      this.setState({isEncryption: false});
    } else {
      Taro.atMessage({
        'message': '密码错误',
        'type': 'error',
      })
    }
  }

  render() {
    const {match = null, matchStatus = null} = this.props;
    const {diffDayTime = {diffDay: "", diffTime: "00:00"}, liveStatus, leftNooice = 0, rightNooice = 0} = this.state;
    let tabList = [{title: '赛况'}]
    const tabs: Array<any> = [];
    let tabIndex = 0;
    match && match.type && match.type.map(item => {
      if (item != 1 && item != 5) {
        tabList.push({title: MATCH_TYPE[item]})
        tabIndex = tabIndex + 1;
        tabs[item] = tabIndex;
      }
    })

    return (
      <View className='qz-live-content'>
        <View className='qz-live-match__content'>
          {this.state.isEncryption ? <View className='qz-live-match__video'>
            <Image src={match.poster} className="qz-live-match__video-poster-img"/>
          </View> : <Video
            id="videoPlayer"
            className='qz-live-match__video'
            src={this.getPlayPath(match)}
            title={match.name}
            playBtnPosition="center"
            onFullscreenChange={this.bindFullScreen}
            onEnded={this.bindPlayEnd}
            onPlay={this.bindPlayStart}
            onError={this.bindPlayError}
            autoplay
            // enableDanmu
            // danmuList={danmuList}
            onTimeUpdate={this.handleVideoTime}
            // autoplay
          >
            {liveStatus != LiveStatus.FINISH && liveStatus != LiveStatus.ENABLED ?
              <View className="qz-live-match__video-poster">
                <Image src={match.poster} className="qz-live-match__video-poster-img"/>
                {liveStatus == LiveStatus.UNOPEN ?
                  <View className="qz-live-match__video-poster-time">
                    <View className='qz-live-match__video-poster-time__title'>
                      <View>距比赛开始还有{diffDayTime.diffDay}</View>
                    </View>
                    <View className='qz-live-match__video-poster-time__time'>
                      <View>{diffDayTime.diffTime}</View>
                    </View>
                  </View>
                  :
                  <View className="qz-live-match__video-poster-text">
                    <View className='qz-live-match__video-poster-text__text'>
                      {liveStatus == LiveStatus.ONTIME ? <View>比赛还未开始请耐心等待...</View> : null}
                      {liveStatus == LiveStatus.NOTPUSH ? <View>信号中断...</View> : null}
                      {liveStatus == LiveStatus.LOADING ? <View>载入中...</View> : null}
                    </View>
                  </View>
                }
              </View>
              : <View
                className={`qz-live-match__video-controllers ${this.state.danmuUnable != true ? "qz-live-match__video-controllers-full" : ""}`}>
                {this.state.danmuUnable != true && this.state.danmuCurrent.map(item => (
                  <View
                    key={`danmu-${item.id}`}
                    className="qz-live-match__video-controllers__danmu-container"
                    style={{top: `${21 * (item.row + 1) + item.row * 8}px`}}>
                    <View className="qz-live-match__video-controllers__danmu">
                      <View className="qz-live-match__video-controllers__danmu-inner">
                        <View className="qz-live-match__video-controllers__danmu-inner-container">
                          <Image src={item.user && item.user.avatar ? item.user.avatar : defaultLogo}/>
                          <Text>{item.text}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
                <View
                  className={`qz-live-match__video-controllers__right ${this.state.videoShowMore ? "qz-live-match__video-controllers__right-more" : ""}`}>
                  <View
                    className={`qz-live-match__video-controllers__right-arrow ${this.state.videoShowMore ? "qz-live-match__video-controllers__right-arrow-right" : "qz-live-match__video-controllers__right-arrow-left"}`}
                    onClick={this.handleVideoArrowClick}>
                    <AtIcon value={this.state.videoShowMore ? "chevron-right" : "chevron-left"}/>
                  </View>
                  {this.state.videoShowMore ?
                    <View className="qz-live-match__video-controllers__right-item-container">
                      {this.props.mediaList.map((item, index) => (
                        <View key={item.id}
                              className={`qz-live-match__video-controllers__right-item ${this.state.currentMedia == index ? "qz-live-match__video-controllers__right-item-selected" : ""}`}
                              onClick={this.handleMediaFragmentClick.bind(this, index)}>
                          <Text
                            className="qz-live-match__video-controllers__right-item-text">
                            {`片段${index + 1}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                    : null
                  }
                </View>
              </View>
            }
          </Video>}
          <View className='qz-live-tabs'>
            <AtTabs current={this.state.currentTab}
                    className="qz-live__top-tabs__content"
                    tabList={tabList}
                    onClick={this.switchTab.bind(this)}>
              <AtTabsPane current={this.state.currentTab} index={0}>
                <ScrollView scrollY className="qz-live-match-up__scroll-content">
                  <View className="qz-live-match-up__content">
                    <MatchUp className="qz-live-match-up__match-up" matchInfo={match}
                             matchStatus={matchStatus}
                             onlytime={this.isThisYear(new Date(match.startTime))}/>
                    {match && match.hostteam && match.guestteam ?
                      <View className="qz-live-match-up__nooice">
                        <View className="qz-live-match-up__nooice-left">
                          <Image src={supportLeft}
                                 className="qz-live-match-up__nooice-img"
                                 onClick={this.handleLeftNooice}/>
                        </View>
                        <View className="qz-live-match-up__nooice-center">
                          <RoundButton
                            size={30}
                            img={playButton}
                            text={this.props.matchStatus.online ? this.props.matchStatus.online : "0"}
                            onClick={() => {
                            }}/>
                          <RoundButton
                            size={30}
                            img={this.state.isCollect ? starActive : star}
                            text={this.state.isCollect ? "已收藏" : "收藏"}
                            onClick={this.onCollectClick}/>
                          <RoundButton
                            size={30}
                            img={share}
                            text="分享"
                            openType="share"
                            onClick={() => {
                            }}/>
                          <RoundButton
                            size={30}
                            img={headphones}
                            text="客服"
                            openType="contact"
                            onClick={() => {
                            }}/>
                        </View>
                        <View className="qz-live-match-up__nooice-right">
                          <Image src={supportRight}
                                 className="qz-live-match-up__nooice-img"
                                 onClick={this.handleRightNooice}/>
                        </View>
                      </View>
                      : null}
                    {match.hostteam && match.guestteam ? <StatBar
                      className="qz-live-match-up__stat-bar"
                      percent={leftNooice == 0 && rightNooice == 0 ? 50 : (leftNooice * 100 / (leftNooice + rightNooice))}
                      leftText={`${leftNooice}`}
                      rightText={`${rightNooice}`}
                      leftMoveClass={this.state.leftMoveClass}
                      rightMoveClass={this.state.rightMoveClass}
                    /> : null}
                    {match.league ?
                      <View className="qz-live-match-up__league"
                            onClick={this.onLeagueClick.bind(this, match.league)}>
                        <View className="qz-live-match-up__league-content">
                          <Image className="qz-live-match-up__league-image"
                                 src={match.league && match.league.headImg ? match.league.headImg : defaultLogo}
                          />
                          <Text className="qz-live-match-up__league-text">
                            {match.league ? match.league.name : ""}
                          </Text>
                          <AtIcon value="chevron-right" size="22" color="#CCC"
                                  className="qz-live-match-up__league-arrow"/>
                        </View>
                      </View>
                      : null
                    }
                    {match.type && match.type.indexOf(1) != -1 && this.props.matchStatus.timeLines && this.props.matchStatus.timeLines.length > 0 ?
                      <TimeLine
                        timeline={this.props.matchStatus.timeLines.filter(ele => eventType[ele.eventType] != null)}
                        matchInfo={this.props.match}/> : null}
                  </View>
                </ScrollView>
              </AtTabsPane>
              {match.type && match.type.indexOf(2) != -1 && <AtTabsPane current={this.state.currentTab} index={tabs[2]}>
                <ScrollView scrollY className="qz-live-statistics">
                  <Statistics statistics={this.props.matchStatus.statistics} matchInfo={this.props.match}/>
                </ScrollView>
              </AtTabsPane>}
              {match.type && match.type.indexOf(3) != -1 && <AtTabsPane current={this.state.currentTab} index={tabs[3]}>
                <LineUp players={this.props.playerList}
                        matchInfo={this.props.match}
                        switchTab={this.switchTeamPlayer}
                        loading={this.state.playerLoading}/>
              </AtTabsPane>}
              {match.type && match.type.indexOf(4) != -1 && <AtTabsPane current={this.state.currentTab} index={tabs[4]}>
                <ChattingRoom
                  matchInfo={this.props.match}
                  userInfo={this.props.userInfo}
                  nextPage={this.getCommentList_next}
                  loading={this.state.chatLoading}
                  intoView={this.state.commentIntoView}
                  sendMessage={this.sendMessage}
                  comments={this.state.comments}
                />
              </AtTabsPane>}
            </AtTabs>
          </View>
        </View>
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}/>
        <PhoneModal
          isOpened={this.state.phoneOpen}
          handleConfirm={this.onPhoneSuccess}
          handleCancel={this.onPhoneCancel}
          handleClose={this.onPhoneClose}
          handleError={this.onPhoneError}/>
        <EncryptionModal
          isOpened={this.state.isEncryption}
          handleConfirm={this.onEncryptionConfirm}/>
        <AtMessage/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    match: state.match.match,
    matchStatus: state.match.status,
    mediaList: state.live.mediaList,
    ping: state.live.ping,
    playerList: state.player.playerList.records,
    userInfo: state.user.userInfo,
    commentList: state.match.comment,
    danmuList: state.match.danmu,
    bulletinConfig: state.config ? state.config.bulletinConfig : null,
  }
}
export default connect(mapStateToProps)(Live)
