import Taro, {Component, Config} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {AtActivityIndicator, AtTabs, AtTabsPane, AtMessage, AtFloatLayout, AtFab, AtToast} from "taro-ui"
import {connect} from '@tarojs/redux'
import defaultLogo from '../../assets/default-logo.png'

import './leagueManager.scss'
import leagueAction from "../../actions/league";
import LeagueManagerMatches from "./components/league-manager-matches"
import LeagueTeamTable from "./components/league-team-table"
import LeaguePlayerTable from "./components/league-player-table";
import LeagueRegulations from "./components/league-regulations";
import withShare from "../../utils/withShare";
import * as global from "../../constants/global";
import {clearLoginToken, getStorage, hasLogin, random, random_weight} from "../../utils/utils";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import payAction from "../../actions/pay";
import userAction from "../../actions/user";
import * as error from "../../constants/error";
import LoginModal from "../../components/modal-login";
import PhoneModal from "../../components/modal-phone";
import GiftPanel from "../../components/gift-panel";
import GiftNotify from "../../components/gift-notify";
import HeatPlayer from "../../components/heat-player";
import HeatLeagueTeam from "../../components/heat-league-team";
import GiftRank from "../../components/gift-rank";
import HeatReward from "../../components/heat-reward";
import ModalAlbum from "../../components/modal-album";
import ShareMoment from "../../components/share-moment";

type PageStateProps = {
  leagueTeams: any;
  leaguePlayers: any;
  locationConfig: { city: string, province: string }
  shareSentence: any;
  userInfo: any;
  giftList: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  timerID_socketHeartBeat: any;
  timerID_giftController: any;
  loadingmore: boolean;
  loading: boolean;
  tabloading: boolean;
  currentTab: number;
  tabsClass: string;
  loginOpen: any,
  phoneOpen: any,
  heatRule: null,
  heatType: null,
  giftOpen: any,
  currentSupportTeam: any,
  currentSupportPlayer: any,
  playerHeats: any,
  topPlayerHeats: any,
  playerHeatTotal: any,
  teamHeats: any,
  topTeamHeats: any,
  teamHeatTotal: any,
  giftSendQueue: any,
  giftRanks: any,
  giftRanksLoading: any,
  broadcastList: any,
  playerHeatRefreshFunc: any,
  playerHeatLoading: any,
  teamHeatRefreshFunc: any,
  teamHeatLoading: any,
  giftRanksOpen: any,
  heatRewardOpen: any,
  league: any,
  permissionShow: any,
  downLoading: any,
  shareMomentOpen: any,
  shareMomentPoster: any,
  shareMomentLoading: any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueManager {
  props: IProps;
}

@withShare({})
class LeagueManager extends Component<PageOwnProps, PageState> {
  tabsY: number;
  socketTask: Taro.SocketTask | null
  timeout_gift: any = {};
  timeout_gift_show: any = {};
  giftRows: any = {left: [{}, {}, {}, {}, {}], right: [{}, {}, {}, {}, {}], unset: []};

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '茄子体育',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  constructor(props) {
    super(props)
    this.state = {
      timerID_socketHeartBeat: null,
      timerID_giftController: null,
      loadingmore: false,
      loading: false,
      tabloading: false,
      currentTab: 0,
      tabsClass: '',
      loginOpen: false,
      phoneOpen: false,
      heatRule: null,
      heatType: null,
      giftOpen: false,
      currentSupportTeam: null,
      currentSupportPlayer: null,
      playerHeats: null,
      topPlayerHeats: null,
      playerHeatTotal: null,
      teamHeats: null,
      topTeamHeats: null,
      teamHeatTotal: null,
      giftSendQueue: [],
      giftRanks: null,
      giftRanksLoading: false,
      broadcastList: [],
      playerHeatRefreshFunc: null,
      playerHeatLoading: false,
      teamHeatRefreshFunc: null,
      teamHeatLoading: false,
      giftRanksOpen: false,
      heatRewardOpen: false,
      league: {},
      permissionShow: false,
      downLoading: false,
      shareMomentOpen: false,
      shareMomentPoster: null,
      shareMomentLoading: false,
    }
  }

  $setSharePath = () => `/pages/home/home?id=${this.state.league.id}&page=leagueManager`

  $setShareTitle = () => {
    const shareSentence = random_weight(this.props.shareSentence.filter(value => value.type == global.SHARE_SENTENCE_TYPE.league).map(value => {
      return {...value, weight: value.weight + "%"}
    }));
    if (shareSentence == null) {
      return this.state.league.name
    }
    return shareSentence.sentence;
  }

  $setOnShareCallback = () => {
    Taro.showToast({title: "分享成功", icon: "none"});
    if (this.state.heatType != null) {
      let freeGift: any = null;
      this.props.giftList && this.props.giftList.forEach((data: any) => {
        if (data.type == global.GIFT_TYPE.FREE) {
          freeGift = data;
        }
      });
      if (freeGift != null && this.props.userInfo && this.props.userInfo.userNo) {
        new Request().get(api.API_GIFT_SEND_FREE_LIMIT, {
          userNo: this.props.userInfo.userNo,
          giftId: freeGift.id,
        }).then((limit: any) => {
          if (limit < freeGift.limited * 2) {
            new Request().post(api.API_GIFT_SEND_FREE_LIMIT, {
              userNo: this.props.userInfo.userNo,
              giftId: freeGift.id,
              times: 1,
            }).then((result) => {
              if (result) {
                payAction.getGiftList({matchId: this.getParamId()});
              }
            })
          }
        });
      }
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getParamId() && this.getLeagueInfo(this.getParamId());
    const query = Taro.createSelectorQuery();
    query.select('.qz-league-manager-tabs').boundingClientRect(rect => {
      this.tabsY = (rect as {
        left: number
        right: number
        top: number
        bottom: number
      }).top;
    }).exec();
  }

  componentWillUnmount() {
    this.clearTimer_HeartBeat();
    this.socketTask && this.socketTask.close({})
    this.socketTask = null;
    this.clearTimer_Gift();
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getParamId = () => {
    let id;
    if (this.$router.params) {
      if (this.$router.params.id == null) {
        id = this.$router.params.scene
      } else {
        id = this.$router.params.id
      }
    } else {
      return null;
    }
    return id;
  }
  initHeatCompetition = (id) => {
    new Request().get(api.API_LEAUGE_HEAT, {leagueId: id}).then(async (data: any) => {
      if (data.available) {
        payAction.getGiftList({});
        this.setState({heatRule: data, heatType: data.type}, () => {
          this.getGiftRanks(id);
          if (data.type == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
            let {tabs} = this.getTabsList();
            this.switchTab(tabs[global.LEAGUE_TABS_TYPE.heatPlayer]);
          } else if (data.type == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) {
            let {tabs} = this.getTabsList();
            this.switchTab(tabs[global.LEAGUE_TABS_TYPE.heatTeam]);
          }
        })
        this.startTimer_Gift();
        // this.initSocket(id);
        if (!await this.isUserLogin()) {
          this.showAuth();
          return;
        }
      }
    })
  }
  startTimer_Gift = () => {
    this.clearTimer_Gift();
    const timerID_giftController = setInterval(() => {
      this.addUnsetToGiftSendQueue();
    }, 1000)
    this.setState({timerID_giftController: timerID_giftController})
  }
  clearTimer_Gift = () => {
    if (this.state.timerID_giftController) {
      clearInterval(this.state.timerID_giftController)
      this.setState({timerID_giftController: null})
    }
  }
  startTimer_HeartBeat = () => {
    this.clearTimer_HeartBeat();
    const timerID_socketHeartBeat = setInterval(() => {
      this.socketTask && this.socketTask.send({data: "success"});
    }, 5000)
    this.setState({timerID_socketHeartBeat: timerID_socketHeartBeat})
  }
  clearTimer_HeartBeat = () => {
    if (this.state.timerID_socketHeartBeat) {
      clearInterval(this.state.timerID_socketHeartBeat)
      this.setState({timerID_socketHeartBeat: null})
    }
  }
  initSocket = async (matchId) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
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
          const comment = JSON.parse(res.data);
          if (comment && comment.broadcast) {
            const giftOrder = JSON.parse(comment.content);
            context.addToGiftSendQueue(giftOrder);
            let broadcastList = context.state.broadcastList;
            let broadcastText = '';
            if (giftOrder && giftOrder.user && giftOrder.user.name) {
              broadcastText = broadcastText + giftOrder.user.name + "送出";
            }
            if (giftOrder && giftOrder.gift && giftOrder.gift.name) {
              broadcastText = broadcastText + giftOrder.gift.name + giftOrder.num + "个";
            }
            broadcastList.push({broadcast: true, content: broadcastText, id: giftOrder.id, date: new Date()})
            context.setState({broadcastList: broadcastList})
          }
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

  async getUserInfo(onSuccess?: Function | null) {
    if (await hasLogin()) {
      const openid = await getStorage('wechatOpenid');
      userAction.getUserInfo({openId: openid}, {
        success: (res) => {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
          if (onSuccess) {
            onSuccess(res);
          }
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

  onPlayerHeatRefresh = (func) => {
    this.setState({playerHeatRefreshFunc: func});
  }
  getPlayerHeatInfo = (pageNum, pageSize, name) => {
    return new Promise((resolve) => {
      if (this.state.playerHeatLoading) {
        return;
      }
      let heatType = this.state.heatType;
      let param: any = {pageNum: pageNum, pageSize: pageSize}
      if (name) {
        param.name = name;
      }
      if (heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
        param.leagueId = this.getParamId();
        this.setState({playerHeatLoading: true})
        new Request().get(api.API_LEAGUE_PLAYER_HEAT, param).then((data: any) => {
          this.setState({playerHeatLoading: false})
          if (name) {
            this.setState({playerHeats: data}, () => {
              resolve();
            })
          } else {
            this.setState({playerHeats: data, topPlayerHeats: this.getTopThreeHeat(data.records)}, () => {
              resolve();
            })
          }
        })
        new Request().get(api.API_LEAGUE_PLAYER_HEAT_TOTAL, {leagueId: this.getParamId()}).then((data: any) => {
          this.setState({playerHeatTotal: data})
        })
      }
    });
  }
  getPlayerHeatInfoAdd = (pageNum, pageSize, name) => {
    if (this.state.playerHeatLoading) {
      return;
    }
    let heatType = this.state.heatType;
    let param: any = {pageNum: pageNum, pageSize: pageSize}
    if (name) {
      param.name = name;
    }
    if (heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
      param.leagueId = this.getParamId();
      this.setState({playerHeatLoading: true})
      new Request().get(api.API_LEAGUE_PLAYER_HEAT, param).then((data: any) => {
        this.setState({playerHeatLoading: false})
        const playerHeats = this.state.playerHeats;
        playerHeats.records = playerHeats.records.concat(data.records);
        playerHeats.current = data.current;
        if (playerHeats.current > data.pages) {
          playerHeats.current = data.pages;
        }
        this.setState({playerHeats: playerHeats})
      })
    }
  }
  onTeamHeatRefresh = (func) => {
    this.setState({teamHeatRefreshFunc: func});
  }
  getTeamHeatInfo = (pageNum, pageSize, name) => {
    return new Promise((resolve) => {
      if (this.state.teamHeatLoading) {
        return;
      }
      let heatType = this.state.heatType;
      let param: any = {pageNum: pageNum, pageSize: pageSize}
      if (name) {
        param.name = name;
      }
      if (heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) {
        param.leagueId = this.getParamId();
        this.setState({teamHeatLoading: true})
        new Request().get(api.API_LEAGUE_TEAM_HEAT, param).then((data: any) => {
          this.setState({teamHeatLoading: false})
          if (name) {
            this.setState({teamHeats: data}, () => {
              resolve();
            })
          } else {
            this.setState({teamHeats: data, topTeamHeats: this.getTopThreeHeat(data.records)}, () => {
              resolve();
            })
          }
        })
        new Request().get(api.API_LEAGUE_TEAM_HEAT_TOTAL, {leagueId: this.getParamId()}).then((data: any) => {
          this.setState({teamHeatTotal: data})
        })
      }
    })
  }
  getTeamHeatInfoAdd = (pageNum, pageSize, name) => {
    if (this.state.teamHeatLoading) {
      return;
    }
    let heatType = this.state.heatType;
    let param: any = {pageNum: pageNum, pageSize: pageSize}
    if (name) {
      param.name = name;
    }
    if (heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) {
      param.leagueId = this.getParamId();
      this.setState({teamHeatLoading: true})
      new Request().get(api.API_LEAGUE_TEAM_HEAT, param).then((data: any) => {
        this.setState({teamHeatLoading: false})
        const teamHeats = this.state.teamHeats;
        teamHeats.records = teamHeats.records.concat(data.records);
        teamHeats.current = data.current;
        if (teamHeats.current > data.pages) {
          teamHeats.current = data.pages;
        }
        this.setState({teamHeats: teamHeats})
      })
    }
  }
  getTopThreeHeat = (heatObjects) => {
    let sorted: any = [];
    let index = 1;
    for (let i = 0; i < heatObjects.length; i++) {
      let heat = this.getHeat(heatObjects[i]);
      if (heat == 0) {
        continue;
      }
      if (index <= 3) {
        if (i == 0) {
          index = 1;
          heatObjects[i].index = index;
          sorted.push(heatObjects[i]);
          continue;
        }
        let heatPre = this.getHeat(heatObjects[i - 1]);
        if (heat == heatPre) {
          heatObjects[i].index = index;
          sorted.push(heatObjects[i]);
        } else {
          index = index + 1;
          if (index <= 3) {
            heatObjects[i].index = index;
            sorted.push(heatObjects[i]);
          }
        }
      }
    }
    return sorted;
  }
  getHeat = (heatObject) => {
    let heat = 0;
    if (heatObject.heat) {
      heat = heat + heatObject.heat;
    }
    if (heatObject.heatBase) {
      heat = heat + heatObject.heatBase;
    }
    return heat;
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
    this.getUserInfo((res) => {
      const {phone} = res.payload
      if (res.payload != null && phone == null) {
        this.setState({phoneOpen: true})
      }
    })
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

  onGiftPayError = (reason) => {
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
      case error.ERROR_SEND_GIFT_ERROR: {
        Taro.showToast({
          title: "赠送礼物失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onGiftPaySuccess = (orderId: any) => {
    this.setState({giftOpen: false})
    if (orderId == global.GIFT_TYPE.FREE) {
      this.getParamId() && payAction.getGiftList({matchId: this.getParamId()});
      this.state.playerHeatRefreshFunc && this.state.playerHeatRefreshFunc();
      this.state.teamHeatRefreshFunc && this.state.teamHeatRefreshFunc();
    } else {
      this.getOrderStatus(orderId, global.ORDER_TYPE.gift);
    }
    Taro.showToast({
      title: "送出礼物成功",
      icon: 'none',
    });
  }

  getOrderStatus = async (orderId: string, type) => {
    new Request().post(api.API_ORDER_QUERY(orderId), {}).then((res) => {
      if (res == global.ORDER_STAUTS.paid) {
        Taro.showToast({
          title: "支付成功",
          icon: 'none',
        });
        if (type != null && type == global.ORDER_TYPE.gift) {
          this.state.playerHeatRefreshFunc && this.state.playerHeatRefreshFunc();
          this.state.teamHeatRefreshFunc && this.state.teamHeatRefreshFunc();
        }
      }
    });
  }
  isUserLogin = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      return false;
    } else {
      return true;
    }
  }
  clearLoginState = () => {
    clearLoginToken();
    userAction.clearUserInfo();
  }
  showGiftPanel = async () => {
    if (!await this.isUserLogin()) {
      this.showAuth();
      return;
    }
    this.setState({giftOpen: true})
  }
  hideGiftPanel = () => {
    this.setState({giftOpen: false})
  }
  getHeatStartTime = () => {
    const {heatRule, league} = this.state;
    if (league && league.dateBegin && heatRule && heatRule.startInterval) {
      let startTime = new Date(league.dateBegin)
      startTime.setMinutes(startTime.getMinutes() + heatRule.startInterval);
      return startTime;
    }
    return null
  }
  getHeatEndTime = () => {
    const {heatRule, league} = this.state;
    if (league && league.dateEnd && heatRule && heatRule.endInterval) {
      let endTime = new Date(league.dateEnd)
      endTime.setMinutes(endTime.getMinutes() + heatRule.endInterval);
      return endTime;
    }
    return null
  }
  addUnsetToGiftSendQueue = () => {
    let unshiftIndex = -1;
    this.giftRows.unset.some((data, index) => {
      this.addToGiftSendQueue(data);
      unshiftIndex = index;
      return true;
    })
    if (unshiftIndex != -1) {
      this.giftRows.unset.splice(unshiftIndex, 1);
    }
  }

  addToGiftSendQueue = (giftOrder) => {
    let position = "left";
    if (random(0, 100) % 2 == 0) {
      position = "left";
    } else {
      position = "right";
    }
    giftOrder.position = position;
    const row = this.assignGiftRow(giftOrder, position);
    giftOrder.row = row;
    if (row != -1) {
      this.state.giftSendQueue.push(giftOrder)
      this.initGiftTimeout(giftOrder.id);
      this.setState({giftSendQueue: this.state.giftSendQueue})
    }
  }

  assignGiftRow = (giftOrderItem, position) => {
    let rowIndex = -1;
    let isInsert = false;
    const giftRow = this.giftRows[position];
    let giftRow_reverse = this.giftRows["position"];
    if (position == "left") {
      giftRow_reverse = this.giftRows["right"];
    } else {
      giftRow_reverse = this.giftRows["left"];
    }
    if (giftRow != null) {
      giftRow.map((row, index) => {
        if (row.id == null && giftRow_reverse[index].id == null && !isInsert) {
          giftRow[index] = giftOrderItem;
          rowIndex = index;
          isInsert = true;
        }
      })
    }
    if (rowIndex == -1) {
      this.giftRows.unset.push(giftOrderItem);
    }
    return rowIndex;
  }

  initGiftTimeout(id) {
    this.timeout_gift[id] = setTimeout(() => {
      this.timeout_gift[id] = null
      const showQueue = this.state.giftSendQueue;
      showQueue.forEach(data => {
        if (data.id == id) {
          data.active = true;
        }
      });
      this.setState({giftSendQueue: showQueue}, () => {
        this.timeout_gift_show[id] = setTimeout(() => {
          this.timeout_gift_show[id] = null
          const giftSendQueue = this.state.giftSendQueue.filter(item => item.id != id);
          this.setState({giftSendQueue: giftSendQueue});
          let giftRowsShadow = this.giftRows;
          for (let position in giftRowsShadow) {
            for (let rowKey in giftRowsShadow[position]) {
              if (giftRowsShadow[position][rowKey] != null && giftRowsShadow[position][rowKey].id == id) {
                giftRowsShadow[position][rowKey] = {};
              }
            }
          }
          this.giftRows = giftRowsShadow;
        }, 5000);
      });
    }, 300);
  }

  getGiftRanks = (id) => {
    this.setState({giftRanksLoading: true})
    new Request().get(api.API_GIFT_RANK_LEAGUE(id), null).then((data: any) => {
      if (Array.isArray(data)) {
        data = data.filter(res => res.charge != null && res.charge != 0);
        this.setState({giftRanks: data, giftRanksLoading: false})
      }
    });
  }
  handlePlayerSupport = (player) => {
    this.setState({currentSupportPlayer: player})
    this.showGiftPanel();
  }
  handleTeamSupport = (team) => {
    this.setState({currentSupportTeam: team})
    this.showGiftPanel();
  }
  getLeagueInfo = (id) => {
    this.setState({loading: true})
    Taro.showLoading({title: global.LOADING_TEXT})
    new Request().get(api.API_LEAGUE(id), {detailRound: true}).then((data: any) => {
      this.setState({league: data}, () => {
        this.getLeagueList(id);
        let {tabs} = this.getTabsList();
        this.switchTab(tabs[global.LEAGUE_TABS_TYPE.leagueMatch]);
        this.initHeatCompetition(this.getParamId());
      })
    })
  }
  getLeagueList = (id) => {
    Promise.all([
      leagueAction.getLeagueTeam({leagueId: id}),
      leagueAction.getLeaguePlayer({leagueId: id, goal: true}),
      leagueAction.getLeagueReport(id),
    ]).then(() => {
      this.setState({loading: false})
      Taro.hideLoading();
    });
  }
  switchTab = (tab) => {
    this.setState({
      currentTab: tab
    })
  }
  onGiftRankClick = () => {
    this.setState({giftRanksOpen: true});
  }
  onHeatRewardClick = () => {
    this.setState({heatRewardOpen: true});
  }
  hideGfitRank = () => {
    this.setState({giftRanksOpen: false});
  }
  hideReward = () => {
    this.setState({heatRewardOpen: false});
  }
  getTabsList = () => {
    const {league} = this.state
    let tabList: any = []
    const tabs: any = {};
    let tabIndex = 0;
    //规程
    tabList.push({title: "规程"})
    tabs[global.LEAGUE_TABS_TYPE.leagueRule] = tabIndex;
    tabIndex = tabIndex + 1;
    //赛程
    tabList.push({title: "赛程"})
    tabs[global.LEAGUE_TABS_TYPE.leagueMatch] = tabIndex;
    tabIndex = tabIndex + 1;
    //人气PK
    if (this.state.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
      tabList.push({title: '人气PK'})
      tabs[global.LEAGUE_TABS_TYPE.heatPlayer] = tabIndex;
      tabIndex = tabIndex + 1;
    }
    //球队PK
    if (this.state.heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) {
      tabList.push({title: '人气PK'})
      tabs[global.LEAGUE_TABS_TYPE.heatTeam] = tabIndex;
      tabIndex = tabIndex + 1;
    }
    //积分榜
    if (league.showleagueteam) {
      tabList.push({title: '积分榜'})
      tabs[global.LEAGUE_TABS_TYPE.leagueTeam] = tabIndex;
      tabIndex = tabIndex + 1;
    }
    //射手榜
    if (league.showleagueplayer) {
      tabList.push({title: '射手榜'})
      tabs[global.LEAGUE_TABS_TYPE.leaguePlayer] = tabIndex;
      tabIndex = tabIndex + 1;
    }
    return {tabList, tabs};
  }
  showDownLoading = () => {
    this.setState({downLoading: true})
  }
  showShareMoment = (imgUrl) => {
    this.setState({downLoading: false})
    if (imgUrl) {
      this.setState({shareMomentPoster: imgUrl, shareMomentOpen: true})
    }
  }
  showPremission = () => {
    this.setState({permissionShow: true})
  }
  onPremissionClose = () => {
    this.setState({permissionShow: false})
  }
  onPremissionCancel = () => {
    this.setState({permissionShow: false})
  }
  onPremissionSuccess = () => {
    this.setState({permissionShow: false})
  }
  onShareMomentConfirm = () => {
    this.setState({shareMomentLoading: true})
    Taro.downloadFile({
      url: this.state.shareMomentPoster,
      success: (res) => {
        if (res.statusCode === 200) {
          Taro.saveImageToPhotosAlbum({filePath: res.tempFilePath}).then(saveres => {
            console.log(saveres)
            Taro.showToast({
              title: "图片保存到相册成功，快去发朋友圈吧",
              icon: 'none',
            });
            this.setState({shareMomentLoading: false})
          }, () => {
            Taro.showToast({
              title: "图片保存到相册失败",
              icon: 'none',
            });
            this.setState({shareMomentLoading: false})
            this.showPremission();
          })
        }
      }
    });
  }
  onShareMomentCancel = () => {
    this.setState({shareMomentOpen: false})
  }

  render() {
    const {leaguePlayers, leagueTeams} = this.props
    const {league} = this.state
    let {tabList, tabs} = this.getTabsList();

    if (this.state.loading) {
      return <View className="qz-league-manager-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }

    return (
      <View className='qz-league-manager-content'>
        <View className='qz-league-manager-header'>
          {league &&
          <View className='qz-league-manager-header-container'>
            <Image className="img"
                   src={league.headImg ? league.headImg : defaultLogo}/>
            <View className='text'>{league.shortname ? league.shortname : league.name}</View>
          </View>
          }
        </View>

        <View className='qz-league-manager-tabs'>
          {league && league.round &&
          <AtTabs
            swipeable={false}
            className='qz-league-manager__top-tabs__content qz-custom-tabs'
            current={this.state.currentTab}
            tabList={tabList}
            onClick={this.switchTab}>
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leagueRule]}>
              <LeagueRegulations
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leagueRule]}/>
            </AtTabsPane>
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leagueMatch]}>
              <LeagueManagerMatches
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leagueMatch]}/>
            </AtTabsPane>
            {this.state.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT &&
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.heatPlayer]}>
              <HeatPlayer
                isLeauge
                leagueId={this.getParamId()}
                heatType={this.state.heatType}
                onPlayerHeatRefresh={this.onPlayerHeatRefresh}
                totalHeat={this.state.playerHeatTotal}
                topPlayerHeats={this.state.topPlayerHeats}
                startTime={this.getHeatStartTime()}
                endTime={this.getHeatEndTime()}
                playerHeats={this.state.playerHeats}
                onHandlePlayerSupport={this.handlePlayerSupport}
                hidden={this.state.currentTab != tabs[global.LEAGUE_TABS_TYPE.heatPlayer]}
                onGetPlayerHeatInfo={this.getPlayerHeatInfo}
                onGetPlayerHeatInfoAdd={this.getPlayerHeatInfoAdd}
                onPictureDownLoading={this.showDownLoading}
                onPictureDownLoaded={this.showShareMoment}
              />
            </AtTabsPane>}
            {this.state.heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT &&
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.heatTeam]}>
              <HeatLeagueTeam
                isLeague
                leagueId={this.getParamId()}
                heatType={this.state.heatType}
                onTeamHeatRefresh={this.onTeamHeatRefresh}
                totalHeat={this.state.teamHeatTotal}
                topTeamHeats={this.state.topTeamHeats}
                startTime={this.getHeatStartTime()}
                endTime={this.getHeatEndTime()}
                teamHeats={this.state.teamHeats}
                onHandleTeamSupport={this.handleTeamSupport}
                hidden={this.state.currentTab != tabs[global.LEAGUE_TABS_TYPE.heatTeam]}
                onGetTeamHeatInfo={this.getTeamHeatInfo}
                onGetTeamHeatInfoAdd={this.getTeamHeatInfoAdd}
                onPictureDownLoading={this.showDownLoading}
                onPictureDownLoaded={this.showShareMoment}
              />
            </AtTabsPane>}
            {league.showleagueteam &&
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leagueTeam]}>
              <LeagueTeamTable
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leagueTeam]}
                teamGroup={leagueTeams}/>
            </AtTabsPane>}
            {league.showleagueplayer &&
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leaguePlayer]}>
              <LeaguePlayerTable
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leaguePlayer]}
                playerList={leaguePlayers}/>
            </AtTabsPane>}
          </AtTabs>}
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
        <AtMessage/>
        <AtFloatLayout
          className="qz-gift-float"
          title={`礼物送给${(this.state.heatType == global.HEAT_TYPE.TEAM_HEAT || this.state.heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) && this.state.currentSupportTeam ? this.state.currentSupportTeam.name : ((this.state.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.state.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) && this.state.currentSupportPlayer ? this.state.currentSupportPlayer.name : "")}       1茄币=1元`}
          onClose={this.hideGiftPanel}
          isOpened={this.state.giftOpen}>
          <GiftPanel
            leagueId={this.getParamId()}
            matchInfo={null}
            supportTeam={this.state.currentSupportTeam}
            supportPlayer={this.state.currentSupportPlayer}
            heatType={this.state.heatType}
            gifts={this.props.giftList}
            loading={this.props.giftList == null || this.props.giftList.length == 0}
            onHandlePaySuccess={this.onGiftPaySuccess}
            onHandlePayError={this.onGiftPayError}
            hidden={!this.state.giftOpen}/>
        </AtFloatLayout>
        {this.state.giftSendQueue && this.state.giftSendQueue.map((data: any) => (
          <GiftNotify
            active={data.active}
            key={data.id}
            position={data.position}
            gift={data.gift}
            user={data.user}
            num={data.num}
            row={data.row}/>
        ))}
        <GiftRank
          giftRanks={this.state.giftRanks}
          loading={this.state.giftRanksLoading}
          isOpened={this.state.giftRanksOpen}
          handleCancel={this.hideGfitRank}
        />
        <HeatReward
          heatRule={this.state.heatRule}
          loading={this.state.heatRule == null}
          isOpened={this.state.heatRewardOpen}
          handleCancel={this.hideReward}
        />
        <ShareMoment
          isOpened={this.state.shareMomentOpen}
          loading={this.state.shareMomentLoading}
          poster={this.state.shareMomentPoster}
          handleConfirm={this.onShareMomentConfirm}
          handleCancel={this.onShareMomentCancel}
        />
        <AtToast isOpened={this.state.downLoading} text="生成中..." status="loading"/>
        <ModalAlbum
          isOpened={this.state.permissionShow}
          handleConfirm={this.onPremissionSuccess}
          handleCancel={this.onPremissionCancel}
          handleClose={this.onPremissionClose}/>
        {this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.heatPlayer] || this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.heatTeam] ?
          <View>
            <View className="qz-league-manager-fab qz-league-manager-fab-square qz-league-manager-fab-giftrank">
              <AtFab onClick={this.onGiftRankClick}>
                <Image className="qz-league-manager-fab-image"
                       src="https://qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/images/202009/gift_rank.png"/>
              </AtFab>
            </View>
            <View className="qz-league-manager-fab qz-league-manager-fab-square qz-league-manager-fab-heatreward">
              <AtFab onClick={this.onHeatRewardClick}>
                <Image className="qz-league-manager-fab-image"
                       src="https://qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/images/202009/heat_reward.png"/>
              </AtFab>
            </View>
          </View>
          : null
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    leaguePlayers: state.league.leaguePlayers,
    leagueTeams: state.league.leagueTeams,
    locationConfig: state.config.locationConfig,
    shareSentence: state.config ? state.config.shareSentence : [],
    giftList: state.pay ? state.pay.gifts : [],
  }
}
export default connect(mapStateToProps)(LeagueManager)
