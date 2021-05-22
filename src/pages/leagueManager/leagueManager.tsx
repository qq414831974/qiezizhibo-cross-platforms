import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Image, Text} from '@tarojs/components'
import {AtActivityIndicator, AtTabs, AtTabsPane, AtMessage, AtFloatLayout, AtFab, AtToast} from "taro-ui"
import {connect} from 'react-redux'
import defaultLogo from '../../assets/default-logo.png'
import cancel from '../../assets/cancel.png'

import './leagueManager.scss'
import leagueAction from "../../actions/league";
import LeagueManagerMatches from "./components/league-manager-matches"
import LeagueTeamTable from "./components/league-team-table"
import LeaguePlayerTable from "./components/league-player-table";
import LeagueRegulations from "./components/league-regulations";
import withShare from "../../utils/withShare";
import * as global from "../../constants/global";
import {clearLoginToken, getExpInfoByExpValue, getStorage, hasLogin, random_weight} from "../../utils/utils";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import payAction from "../../actions/pay";
import userAction from "../../actions/user";
import * as error from "../../constants/error";
import LoginModal from "../../components/modal-login";
import PhoneModal from "../../components/modal-phone";
import LevelUpModal from "../../components/modal-level-up";
import GiftPanel from "../../components/gift-panel";
import HeatPlayer from "../../components/heat-player";
import HeatLeagueTeam from "../../components/heat-league-team";
import GiftRank from "../../components/gift-rank";
import HeatReward from "../../components/heat-reward";
import ModalAlbum from "../../components/modal-album";
import ShareMoment from "../../components/share-moment";
import BetRank from "../../components/bet-rank";
import ModalPay from "../../components/modal-pay";
import depositAction from "../../actions/deposit";
import configAction from "../../actions/config";
import NavBar from "../../components/nav-bar";
import RectFab from "../../components/fab-rect";
import LeagueMember from "../../components/league-member";
import noperson from "../../assets/no-person.png";
import hotIcon from "../../assets/home/hot-icon.png";
import HeatRank from "../../components/heat-rank";

type PageStateProps = {
  leagueTeams: any;
  leaguePlayers: any;
  locationConfig: { city: string, province: string }
  shareSentence: any;
  userInfo: any;
  giftList: any;
  deposit: any;
  payEnabled: boolean;
  giftEnabled: boolean;
  expInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
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
  leagueRankSetting: any,
  permissionShow: any,
  downLoading: any,
  shareMomentOpen: any,
  shareMomentPoster: any,
  shareMomentLoading: any,
  heatStartTime: any,
  heatEndTime: any,
  onHandleShareSuccess: any,
  betRanks: any;
  betRanksLoading: any;
  betRankShow: boolean;
  betRankFabHide: boolean;
  leagueBetEnable: boolean;
  payCallback: any;
  payConfirmShow: boolean;
  currentPrice: number;
  levelUpShow: boolean;
  currentLevel: number;
  leagueMemberRule: any;
  leagueMemberOpen: boolean;
  userHaveLeagueMember: any;
  topSixHeats: any,
  heatRankShow: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueManager {
  props: IProps;
}

@withShare({})
class LeagueManager extends Component<IProps, PageState> {
  navRef: any = null;
  tabsY: number;
  socketTask: Taro.SocketTask | null
  timeout_gift: any = {};
  timeout_gift_show: any = {};
  giftRows: any = {left: [{}, {}, {}, {}, {}], right: [{}, {}, {}, {}, {}], unset: []};

  constructor(props) {
    super(props)
    this.state = {
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
      leagueRankSetting: {},
      permissionShow: false,
      downLoading: false,
      shareMomentOpen: false,
      shareMomentPoster: null,
      shareMomentLoading: false,
      heatStartTime: null,
      heatEndTime: null,
      onHandleShareSuccess: null,
      betRanks: null,
      betRanksLoading: false,
      betRankShow: false,
      betRankFabHide: false,
      leagueBetEnable: false,
      payCallback: null,
      payConfirmShow: false,
      currentPrice: 0,
      levelUpShow: false,
      currentLevel: 0,
      leagueMemberRule: null,
      leagueMemberOpen: false,
      userHaveLeagueMember: false,
      topSixHeats: null,
      heatRankShow: false,
    }
  }

  $setSharePath = () => `/pages/home/home?id=${this.getParamId()}&page=leagueManager`

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
    this.state.onHandleShareSuccess && this.state.onHandleShareSuccess();
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
    const {payEnabled} = this.props;
    if (!payEnabled) {
      this.initPayConfig();
    }
    this.getParamId() && this.getLeagueInfo(this.getParamId());
    this.getParamId() && this.getBetRanks(this.getParamId());
    if (this.props.userInfo && this.props.userInfo.userNo) {
      depositAction.getDeposit(this.props.userInfo.userNo);
    }
    // const query = Taro.createSelectorQuery();
    // query.select('.qz-league-manager-tabs').boundingClientRect(rect => {
    //   this.tabsY = (rect as {
    //     left: number
    //     right: number
    //     top: number
    //     bottom: number
    //   }).top;
    // }).exec();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    this.initLeagueMember(this.getParamId())
  }

  componentDidHide() {
  }

  getParamId = () => {
    let id;
    const router = getCurrentInstance().router;
    if (router && router.params != null) {
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
  initPayConfig = (userNo?) => {
    if (userNo == null && this.props.userInfo && this.props.userInfo.userNo) {
      userNo = this.props.userInfo.userNo;
    }
    Taro.getSystemInfo().then((systemInfo) => {
      new Request().get(api.API_SYS_PAYMENT_CONFIG, null).then((config: any) => {
        if (userNo) {
          new Request().get(api.API_USER_ABILITY, {userNo: userNo}).then((ability: any) => {
            if (ability && ability.enablePay) {
              configAction.setPayEnabled(true);
              configAction.setGiftEnabled(true);
            } else {
              if (systemInfo.platform == 'ios') {
                configAction.setPayEnabled(config && config.enablePay ? true : false);
              } else {
                configAction.setPayEnabled(true);
              }
              configAction.setGiftEnabled(config && config.enableGift ? true : false);
            }
          });
        } else {
          if (systemInfo.platform == 'ios') {
            configAction.setPayEnabled(config && config.enablePay ? true : false);
          } else {
            configAction.setPayEnabled(true);
          }
          configAction.setGiftEnabled(config && config.enableGift ? true : false);
        }
      })
    });
  }
  initHeatCompetition = (id) => {
    new Request().get(api.API_LEAUGE_HEAT, {leagueId: id}).then(async (data: any) => {
      if (data.available) {
        payAction.getGiftList({});
        let heatStartTime: any = null;
        let heatEndTime: any = null;
        if (data.type == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT || data.type == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) {
          heatStartTime = this.getHeatStartTime(data, this.state.league);
          heatEndTime = this.getHeatEndTime(data, this.state.league);
        }
        this.setState({
          heatRule: data,
          heatType: data.type,
          heatStartTime: heatStartTime,
          heatEndTime: heatEndTime
        }, () => {
          this.getGiftRanks(id);
          if (data.type == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
            let {tabs} = this.getTabsList();
            this.switchTab(tabs[global.LEAGUE_TABS_TYPE.heatPlayer]);
          } else if (data.type == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) {
            let {tabs} = this.getTabsList();
            this.switchTab(tabs[global.LEAGUE_TABS_TYPE.heatTeam]);
          }
        })
        // this.initSocket(id);
        if (!await this.isUserLogin()) {
          this.showAuth();
          return;
        }
      }
    })
  }

  initLeagueMember = (leagueId) => {
    new Request().get(api.API_LEAGUE_MEMBER, {
      leagueId: leagueId,
    }).then((data: any) => {
      if (data.available) {
        this.setState({leagueMemberRule: data})
        if (this.props.userInfo && this.props.userInfo.userNo) {
          new Request().get(api.API_USER_LEAGUE_MEMBER, {
            pageSize: 10,
            pageNum: 1,
            userNo: this.props.userInfo.userNo,
            leagueId: leagueId
          }).then((userData: any) => {
            this.setState({userHaveLeagueMember: userData.total != null && userData.total > 0 ? true : false})
          });
        }
      }
    });
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

  getBetRanks = (leagueId) => {
    this.setState({betRanksLoading: true})
    new Request().get(api.API_LEAGUE_BET, {leagueId: leagueId}).then((leagueData: any) => {
      if (leagueData && leagueData.available) {
        this.setState({leagueBetEnable: true})
        new Request().get(api.API_BET_RANK, {leagueId: leagueId}).then((data: any) => {
          if (Array.isArray(data)) {
            data = data.filter(res => res.count != null && res.count != 0);
            this.setState({betRanks: data, betRanksLoading: false})
          }
        });
      }
    });
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
          this.setState({playerHeatLoading: false, topSixHeats: this.getTopSixHeat(data.records)})
          if (name) {
            this.setState({playerHeats: data}, () => {
              resolve(data.records);
            })
          } else {
            this.setState({playerHeats: data, topPlayerHeats: this.getTopThreeHeat(data.records)}, () => {
              resolve(data.records);
            })
          }
        })
        // new Request().get(api.API_LEAGUE_PLAYER_HEAT_TOTAL, {leagueId: this.getParamId()}).then((data: any) => {
        //   this.setState({playerHeatTotal: data})
        // })
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
          this.setState({teamHeatLoading: false, topSixHeats: this.getTopSixHeat(data.records)})
          if (name) {
            this.setState({teamHeats: data}, () => {
              resolve(data.records);
            })
          } else {
            this.setState({teamHeats: data, topTeamHeats: this.getTopThreeHeat(data.records)}, () => {
              resolve(data.records);
            })
          }
        })
        // new Request().get(api.API_LEAGUE_TEAM_HEAT_TOTAL, {leagueId: this.getParamId()}).then((data: any) => {
        //   this.setState({teamHeatTotal: data})
        // })
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
  getTopSixHeat = (heatObjects) => {
    let sorted: any = [];
    let index = 1;
    for (let i = 0; i < heatObjects.length; i++) {
      let heat = this.getHeat(heatObjects[i]);
      if (heat == 0) {
        continue;
      }
      if (i < 6) {
        heatObjects[i].number = i + 1;
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
          if (index <= 6) {
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
      const phone = res.payload.phone
      depositAction.getDeposit(res.userNo);
      if (res.payload != null && phone == null) {
        this.setState({phoneOpen: true})
      }
      this.initPayConfig(res.userNo);
      this.initLeagueMember(this.getParamId());
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
    new Request().get(api.API_ORDER_QUERY, {orderId: orderId}).then((res) => {
      if (res == global.ORDER_STAUTS.paid) {
        Taro.showToast({
          title: "支付成功",
          icon: 'none',
        });
        if (type != null && type == global.ORDER_TYPE.gift) {
          this.state.playerHeatRefreshFunc && this.state.playerHeatRefreshFunc();
          this.state.teamHeatRefreshFunc && this.state.teamHeatRefreshFunc();
        }
        // this.isUserLevelUp();
      }
    });
  }
  isUserLevelUp = () => {
    const level = getExpInfoByExpValue(this.props.expInfo, this.props.userInfo.userExp.exp).level
    this.getUserInfo((userInfo) => {
      const currentLevel = getExpInfoByExpValue(this.props.expInfo, userInfo.payload.userExp.exp).level
      if (currentLevel >= (Math.ceil(level / 10)) * 10) {
        this.setState({levelUpShow: true, currentLevel: currentLevel})
      }
    })
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
  getHeatStartTime = (heatRule, league) => {
    if (league && league.dateBegin && heatRule && heatRule.startInterval) {
      let startTime = new Date(league.dateBegin)
      startTime.setMinutes(startTime.getMinutes() + heatRule.startInterval);
      return startTime;
    }
    return null
  }
  getHeatEndTime = (heatRule, league) => {
    if (league && league.dateEnd && heatRule && heatRule.endInterval) {
      let endTime = new Date(league.dateEnd)
      endTime.setMinutes(endTime.getMinutes() + heatRule.endInterval);
      return endTime;
    }
    return null
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
    let url = api.API_LEAGUE(id);
    if (global.CacheManager.getInstance().CACHE_ENABLED) {
      url = api.API_CACHED_LEAGUE(id);
    }
    new Request().get(url, null).then((data: any) => {
      this.setState({league: data}, () => {
        this.getLeagueList(id);
        this.getLeagueRankSetting(id);
        let {tabs} = this.getTabsList();
        this.switchTab(tabs[global.LEAGUE_TABS_TYPE.leagueMatch]);
        this.initHeatCompetition(id);
      })
    })
  }
  getLeagueRankSetting = (id) => {
    new Request().get(api.API_LEAGUE_RANK_SETTING, {leagueId: id}).then((data: any) => {
      this.setState({leagueRankSetting: data})
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
    const {leagueRankSetting} = this.state
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
    if (leagueRankSetting.showLeagueTeam) {
      tabList.push({title: '积分榜'})
      tabs[global.LEAGUE_TABS_TYPE.leagueTeam] = tabIndex;
      tabIndex = tabIndex + 1;
    }
    //射手榜
    if (leagueRankSetting.showLeaguePlayer) {
      tabList.push({title: '射手榜'})
      tabs[global.LEAGUE_TABS_TYPE.leaguePlayer] = tabIndex;
      tabIndex = tabIndex + 1;
    }
    const tabKey = Object.keys(tabs).join(",");
    return {tabList, tabs, tabKey};
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
  onHandleShareSuccess = (func: any) => {
    this.setState({onHandleShareSuccess: func});
  }
  handleBetRankClick = () => {
    this.setState({betRankShow: true});
  }
  handleBetRankCancel = () => {
    this.setState({betRankShow: false});
  }
  hideBetRank = () => {
    this.setState({betRankFabHide: true});
  }
  onPayConfirm = (callback, price) => {
    this.setState({payCallback: callback, payConfirmShow: true, currentPrice: price})
  }
  onPayConfirmClose = () => {
    this.setState({payConfirmShow: false})
  }
  handleWechatConfirm = () => {
    this.state.payCallback && this.state.payCallback(global.PAY_TYPE.ONLINE)
  }
  handleDepositConfirm = () => {
    this.state.payCallback && this.state.payCallback(global.PAY_TYPE.DEPOSIT)
  }
  handleFeedbackClick = () => {
    Taro.navigateTo({
      url: "/pages/feedback/feedback",
    })
  }
  onLevelUpConfirm = () => {
    this.setState({levelUpShow: false})
  }
  onLeagueMemberShow = () => {
    this.setState({leagueMemberOpen: true})
  }
  onLeagueMemberClose = () => {
    this.setState({leagueMemberOpen: false})
  }
  onLeagueMemberPaySuccess = (orderId) => {
    this.setState({leagueMemberOpen: false})
    if (orderId) {
      this.getOrderStatus(orderId, global.ORDER_TYPE.leagueMember);
    }
    Taro.showToast({
      title: "开通成功",
      icon: 'none',
    });
  }
  onLeagueMemberPayError = (reason) => {
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
  handleHeatRankClick = () => {
    this.setState({heatRankShow: true});
  }
  handleHeatRankCancel = () => {
    this.setState({heatRankShow: false});
  }

  render() {
    const {leaguePlayers, leagueTeams} = this.props
    const {league, leagueRankSetting} = this.state
    let {tabList, tabs, tabKey} = this.getTabsList();

    if (this.state.loading) {
      return <View className="qz-league-manager-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }

    return (
      <View className='qz-league-manager-content'>
        <NavBar
          title='茄子TV'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-league-manager-header'>
          {league &&
          <View className='qz-league-manager-header-container'>
            <Image className="img img-round"
                   src={league.headImg ? league.headImg : defaultLogo}/>
            <View className='text'>{league.shortName ? league.shortName : league.name}</View>
            {this.state.userHaveLeagueMember ? <Image className="img"
                                                      src="https://qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/images/202009/vip_card.png"/> : null}
          </View>
          }
        </View>
        <View className='qz-league-manager-tabs'
              style={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px)`}}>
          {league && league.round &&
          <AtTabs
            swipeable={false}
            className='qz-league-manager__top-tabs__content qz-custom-tabs'
            current={this.state.currentTab}
            tabList={tabList}
            key={tabKey}
            onClick={this.switchTab}>
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leagueRule]}>
              <LeagueRegulations
                tabScrollStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px)`}}
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leagueRule]}/>
            </AtTabsPane>
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leagueMatch]}>
              <LeagueManagerMatches
                tabContainerStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px)`}}
                tabScrollStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px - 44px)`}}
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leagueMatch]}/>
            </AtTabsPane>
            {this.state.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT &&
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.heatPlayer]}>
              <HeatPlayer
                isLeauge
                tabContainerStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px)`}}
                tabScrollStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px - 85px - 42px)`}}
                leagueId={this.getParamId()}
                heatType={this.state.heatType}
                onPlayerHeatRefresh={this.onPlayerHeatRefresh}
                // totalHeat={this.state.playerHeatTotal}
                topPlayerHeats={this.state.topPlayerHeats}
                startTime={this.state.heatStartTime}
                endTime={this.state.heatEndTime}
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
                tabContainerStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px)`}}
                tabScrollStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px - 85px - 42px)`}}
                leagueId={this.getParamId()}
                heatType={this.state.heatType}
                onTeamHeatRefresh={this.onTeamHeatRefresh}
                // totalHeat={this.state.teamHeatTotal}
                topTeamHeats={this.state.topTeamHeats}
                startTime={this.state.heatStartTime}
                endTime={this.state.heatEndTime}
                teamHeats={this.state.teamHeats}
                onHandleTeamSupport={this.handleTeamSupport}
                hidden={this.state.currentTab != tabs[global.LEAGUE_TABS_TYPE.heatTeam]}
                onGetTeamHeatInfo={this.getTeamHeatInfo}
                onGetTeamHeatInfoAdd={this.getTeamHeatInfoAdd}
                onPictureDownLoading={this.showDownLoading}
                onPictureDownLoaded={this.showShareMoment}
              />
            </AtTabsPane>}
            {leagueRankSetting.showLeagueTeam &&
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leagueTeam]}>
              <LeagueTeamTable
                tabScrollStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px)`}}
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leagueTeam]}
                teamGroup={leagueTeams}/>
            </AtTabsPane>}
            {leagueRankSetting.showLeaguePlayer &&
            <AtTabsPane current={this.state.currentTab} index={tabs[global.LEAGUE_TABS_TYPE.leaguePlayer]}>
              <LeaguePlayerTable
                tabScrollStyle={{height: `calc(100vh - ${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px - 35px - 44px)`}}
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
          title={`礼物送给${(this.state.heatType == global.HEAT_TYPE.TEAM_HEAT || this.state.heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) && this.state.currentSupportTeam ? this.state.currentSupportTeam.name : ((this.state.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.state.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) && this.state.currentSupportPlayer ? this.state.currentSupportPlayer.name : "")}`}
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
            onHandleShareSuccess={this.onHandleShareSuccess}
            hidden={!this.state.giftOpen}
            onPayConfirm={this.onPayConfirm}
            onPayClose={this.onPayConfirmClose}
          />
        </AtFloatLayout>
        <GiftRank
          giftRanks={this.state.giftRanks}
          loading={this.state.giftRanksLoading}
          isOpened={this.state.giftRanksOpen}
          handleCancel={this.hideGfitRank}
          expInfo={this.props.expInfo}/>
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
        <BetRank
          betRanks={this.state.betRanks}
          loading={this.state.betRanksLoading}
          isOpened={this.state.betRankShow}
          handleCancel={this.handleBetRankCancel}
          expInfo={this.props.expInfo}
        />
        <ModalPay
          isOpened={this.state.payConfirmShow}
          price={this.state.currentPrice}
          onCancel={this.onPayConfirmClose}
          onWechatPay={this.handleWechatConfirm}
          onDepositPay={this.handleDepositConfirm}/>
        <LevelUpModal
          level={this.state.currentLevel}
          isOpened={this.state.levelUpShow}
          handleConfirm={this.onLevelUpConfirm}
        />
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
        {this.state.leagueBetEnable && this.state.currentTab != tabs[global.LEAGUE_TABS_TYPE.heatPlayer] && this.state.currentTab != tabs[global.LEAGUE_TABS_TYPE.heatTeam] && !this.state.betRankFabHide ?
          <View className="qz-league-manager-fab qz-league-manager-fab-square qz-league-manager-fab-betrank">
            <Image onClick={this.hideBetRank} className="qz-league-manager-fab-close" src={cancel}/>
            <AtFab onClick={this.handleBetRankClick}>
              <Image className="qz-league-manager-fab-image"
                     src="https://qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/images/202009/bet_rank.png"/>
            </AtFab>
          </View>
          : null
        }
        {!this.state.userHaveLeagueMember && this.state.leagueMemberRule && this.state.leagueMemberRule.available && this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.leagueMatch] ?
          <RectFab
            className="qz-fab-rect-single-line"
            onClick={this.onLeagueMemberShow}
            background="linear-gradient(90deg,#f8e2c4,#f3bb6c);"
            top={`calc(${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px + 35px + 44px)`}
          >
            <Image src="https://qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/images/202009/crown.png"/>
            <Text style={{color: "#754e19"}}>开通联赛会员</Text>
          </RectFab>
          : null}
        <LeagueMember
          league={this.state.league}
          isOpened={this.state.leagueMemberOpen}
          leagueMemberRule={this.state.leagueMemberRule}
          onClose={this.onLeagueMemberClose}
          onHandlePaySuccess={this.onLeagueMemberPaySuccess}
          onHandlePayError={this.onLeagueMemberPayError}
          onPayConfirm={this.onPayConfirm}
          onPayClose={this.onPayConfirmClose}
        />
        <RectFab
          className="qz-fab-rect-multi-line"
          onClick={this.handleHeatRankClick}
          background="#ECF5FD"
          top={`calc(${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px + 35px + 44px + 42px)`}
        >
          <View className="qz-league-manager-heat">
            <View className="w-full center">
              <Image className="qz-league-manager-heat-title" src={hotIcon}/>
            </View>
            <View className="w-full center qz-league-manager-heat-items">
              {this.state.topSixHeats && this.state.topSixHeats.filter(record => record.number <= 3).map(data => {
                if (this.state.heatType && (this.state.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.state.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT)) {
                  return <Image key={data.id} className="qz-league-manager-heat-img-overlap"
                                src={data.player && data.player.headImg ? data.player.headImg : noperson}/>
                }
                return <Image key={data.id} className="qz-league-manager-heat-img-overlap"
                              src={data.team && data.team.headImg ? data.team.headImg : noperson}/>
              })}
            </View>
            <View className='at-icon at-icon-chevron-right qz-league-manager-heat-arrow'/>
          </View>
        </RectFab>
        <HeatRank
          heatRanks={this.state.topSixHeats}
          loading={this.state.teamHeatLoading || this.state.playerHeatLoading}
          isOpened={this.state.heatRankShow}
          handleCancel={this.handleHeatRankCancel}
          heatType={this.state.heatType}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    deposit: state.deposit.depositInfo ? state.deposit.depositInfo.deposit : 0,
    userInfo: state.user.userInfo,
    leaguePlayers: state.league.leaguePlayers,
    leagueTeams: state.league.leagueTeams,
    locationConfig: state.config.locationConfig,
    shareSentence: state.config ? state.config.shareSentence : [],
    giftList: state.pay ? state.pay.gifts : [],
    payEnabled: state.config ? state.config.payEnabled : null,
    giftEnabled: state.config ? state.config.giftEnabled : null,
    expInfo: state.config ? state.config.expInfo : [],
  }
}
export default connect(mapStateToProps)(LeagueManager)
