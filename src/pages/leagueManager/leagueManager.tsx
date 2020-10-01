import Taro, {Component, Config} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {AtActivityIndicator, AtTabs, AtTabsPane, AtMessage, AtFloatLayout, AtFab} from "taro-ui"
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
import {clearLoginToken, getStorage, hasLogin, random_weight} from "../../utils/utils";
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
import GiftRank from "../../components/gift-rank";
import HeatReward from "../../components/heat-reward";

type PageStateProps = {
  leagueTeams: any;
  leaguePlayers: any;
  league: any;
  locationConfig: { city: string, province: string }
  shareSentence: any;
  userInfo: any;
  giftList: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
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
  topPlayerHeats: any;
  playerHeatTotal: any,
  giftSendQueue: any,
  giftRanks: any,
  giftRanksLoading: any,
  broadcastList: any,
  playerHeatRefreshFunc: any,
  playerHeatLoading: any,
  giftRanksOpen: any,
  heatRewardOpen: any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueManager {
  props: IProps;
}

@withShare({})
class LeagueManager extends Component<PageOwnProps, PageState> {
  tabsY: number;
  timerID_socketHeartBeat: any = null
  timerID_giftController: any = null
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
      giftSendQueue: [],
      giftRanks: null,
      giftRanksLoading: false,
      broadcastList: [],
      playerHeatRefreshFunc: null,
      playerHeatLoading: false,
      giftRanksOpen: false,
      heatRewardOpen: false,
    }
  }

  $setSharePath = () => `/pages/home/home?id=${this.props.league.id}&page=leagueManager`

  $setShareTitle = () => {
    const shareSentence = random_weight(this.props.shareSentence.filter(value => value.type == global.SHARE_SENTENCE_TYPE.league).map(value => {
      return {...value, weight: value.weight + "%"}
    }));
    if (shareSentence == null) {
      return this.props.league.name
    }
    return shareSentence.sentence;
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getParamId() && this.getLeagueList(this.getParamId());
    let {tabs} = this.getTabsList();
    this.switchTab(tabs[global.LEAGUE_TABS_TYPE.leagueMatch]);
    this.initHeatCompetition(this.getParamId());
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
          let {tabs} = this.getTabsList();
          this.switchTab(tabs[global.LEAGUE_TABS_TYPE.heatPlayer]);
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
    this.timerID_giftController = setInterval(() => {
      this.addUnsetToGiftSendQueue();
    }, 1000)
  }
  clearTimer_Gift = () => {
    if (this.timerID_giftController) {
      clearInterval(this.timerID_giftController)
    }
  }
  startTimer_HeartBeat = () => {
    this.clearTimer_HeartBeat();
    this.timerID_socketHeartBeat = setInterval(() => {
      this.socketTask && this.socketTask.send({data: "success"});
    }, 5000)
  }
  clearTimer_HeartBeat = () => {
    if (this.timerID_socketHeartBeat) {
      clearInterval(this.timerID_socketHeartBeat)
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
  getPlayerHeatInfo = (pageNum, pageSize, name, first) => {
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
          this.setState({playerHeats: data})
        } else {
          this.setState({playerHeats: data, topPlayerHeats: this.getTopThreeHeat(data.records)})
        }
      })
      new Request().get(api.API_LEAGUE_PLAYER_HEAT_TOTAL, {leagueId: this.getParamId()}).then((data: any) => {
        this.setState({playerHeatTotal: data})
      })
    }
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
  getTopThreeHeat = (playerHeats) => {
    let sorted: any = [];
    let index = 1;
    for (let i = 0; i < playerHeats.length; i++) {
      if (index <= 3) {
        if (i == 0) {
          index = 1;
          playerHeats[i].index = index;
          sorted.push(playerHeats[i]);
          continue;
        }
        let heat = this.getHeat(playerHeats[i]);
        let heatPre = this.getHeat(playerHeats[i - 1]);
        if (heat == heatPre) {
          playerHeats[i].index = index;
          sorted.push(playerHeats[i]);
        } else {
          index = index + 1;
          if (index <= 3) {
            playerHeats[i].index = index;
            sorted.push(playerHeats[i]);
          }
        }
      }
    }
    return sorted;
  }
  getHeat = (playerHeat) => {
    let heat = 0;
    if (playerHeat.heat) {
      heat = heat + playerHeat.heat;
    }
    if (playerHeat.heatBase) {
      heat = heat + playerHeat.heatBase;
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
    const {league = null} = this.props;
    const {heatRule = null} = this.state;
    if (league && league.dateBegin && heatRule && heatRule.startInterval) {
      let startTime = new Date(league.dateBegin)
      startTime.setMinutes(startTime.getMinutes() + heatRule.startInterval);
      return startTime;
    }
    return null
  }
  getHeatEndTime = () => {
    const {league = null} = this.props;
    const {heatRule = null} = this.state;
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
    if (giftOrder.match != null && giftOrder.targetType == global.HEAT_TYPE.TEAM_HEAT && giftOrder.externalId != null) {
      if (giftOrder.match.hostTeamId == giftOrder.externalId) {
        position = "left";
      } else {
        position = "right";
      }
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
  getLeagueList = (id) => {
    this.setState({loading: true})
    Taro.showLoading({title: global.LOADING_TEXT})
    Promise.all([
      leagueAction.getLeagueInfo({id: id, detailRound: true}),
      leagueAction.getLeagueTeam({leagueId: id}),
      leagueAction.getLeaguePlayer({leagueId: id, goal: true}),
      leagueAction.getLeagueReport(id),
    ]).then(() => {
      this.setState({loading: false})
      Taro.hideLoading();
    });
  }
  switchTab = (tab) => {
    // const onSearch = this.onSearch;
    this.setState({
      currentTab: tab
    }, () => {
      // onSearch();
    })
    // this.setState({
    //   currentTab: tab
    // });
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
    const {league} = this.props
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

  render() {
    const {leaguePlayers, leagueTeams, league} = this.props
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
          title={`礼物送给${this.state.heatType == global.HEAT_TYPE.TEAM_HEAT && this.state.currentSupportTeam ? this.state.currentSupportTeam.name : ((this.state.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.state.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) && this.state.currentSupportPlayer ? this.state.currentSupportPlayer.name : "")}`}
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
        {this.state.currentTab == tabs[global.LEAGUE_TABS_TYPE.heatPlayer] ?
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
    league: state.league.league,
    locationConfig: state.config.locationConfig,
    shareSentence: state.config ? state.config.shareSentence : [],
    giftList: state.pay ? state.pay.gifts : [],
  }
}
export default connect(mapStateToProps)(LeagueManager)
