import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {connect} from "react-redux";
import {View, Image, Text} from '@tarojs/components'
import {AtList, AtListItem, AtActivityIndicator} from 'taro-ui'
import Accordion from "../../components/accordion";

import './leagueMemberVerify.scss'
import logo from "../../assets/default-logo.png";
import noperson from "../../assets/no-person.png";
import NavBar from "../../components/nav-bar";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import * as global from "../../constants/global";
import {default_poster} from "../../utils/assets";
import LoginModal from "../../components/modal-login";
import ModalVerifyConfirm from "./components/verify-confirm-modal";
import * as error from "../../constants/error";
import {clearLoginToken, getStorage, hasLogin} from "../../utils/utils";
import userAction from "../../actions/user";
import withShare from "../../utils/withShare";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  league: any;
  teamGroup: any;
  loading: boolean;
  teamOpen: any;
  playerList: any;
  leagueMemberRule: any;
  userLeagueMember: any;
  playerLimit: any;
  loginOpen: boolean;
  confirmOpen: boolean;
  currentPlayer: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueMemberVerify {
  props: IProps;
}
@withShare({})
class LeagueMemberVerify extends Component<IProps, PageState> {

  navRef: any = null;
  leagueId: any = null;

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      league: null,
      teamGroup: null,
      loading: true,
      teamOpen: null,
      playerList: null,
      leagueMemberRule: null,
      userLeagueMember: null,
      playerLimit: null,
      loginOpen: false,
      confirmOpen: false,
      currentPlayer: null
    }
  }
  $setSharePath = () => `/pages/home/home?id=${this.leagueId}&page=leagueMemberVerify`

  $setShareTitle = () => `球员VIP开通`

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    this.leagueId = this.getParamId();
    this.setState({loading: true})
    Promise.all([
      this.getLeagueInfo(this.leagueId),
      this.getLeagueTeamList(this.leagueId),
      this.initLeagueMember(this.leagueId)
    ]).then(() => {
      this.setState({loading: false})
    })
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
  getLeagueInfo = (leagueId) => {
    return new Request().get(api.API_LEAGUE(leagueId), null).then((data: any) => {
      this.setState({league: data})
    })
  }
  getLeagueTeamList = (leagueId) => {
    return new Request().get(api.API_LEAGUE_TEAM, {leagueId: leagueId}).then((data: any) => {
      if (data) {
        this.setState({teamGroup: this.getTeamGroupList(data)})
      }
    })
  }
  getTeamPlayerList = (teamId) => {
    Taro.showLoading({title: global.LOADING_TEXT})
    return new Request().get(api.API_PLAYERS, {pageNum: 1, pageSize: 100, teamId: teamId}).then((data: any) => {
      if (data && data.records) {
        let playerList = this.state.playerList
        if (playerList == null) {
          playerList = {};
        }
        playerList[teamId] = data.records;
        this.setState({playerList: playerList}, () => {
          Taro.hideLoading();
        })
      } else {
        Taro.hideLoading();
      }
    })
  }
  initLeagueMember = (leagueId) => {
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    return new Request().get(api.API_LEAGUE_MEMBER, {
      leagueId: leagueId,
      showLimit: true,
    }).then((data: any) => {
      if (data.available || data.verifyAvailable) {
        this.setState({leagueMemberRule: data, playerLimit: data.playerLimit})
        new Request().get(api.API_USER_LEAGUE_MEMBER, {
          pageSize: 10,
          pageNum: 1,
          userNo: userNo,
          leagueId: leagueId
        }).then((userData: any) => {
          const total = userData.total;
          const records = userData.records;
          if (total != null && total > 0 && records != null) {
            let sorted = records.filter(item => {
              return item.isValid
            })
            if (sorted.length > 0) {
              this.setState({userLeagueMember: sorted[0]})
            }
          }
        });
      }
    });
  }

  getTeamGroupList = (teamGroups) => {
    let list: Array<any> = [];
    const groups: Array<any> = Object.keys(teamGroups).sort();
    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];
      if (group !== '无分组') {
        list.push({group: group, team: teamGroups[group], index: i})
      }
    }
    return list;
  }
  handleTeamClick = (teamId) => {
    let teamOpen = this.state.teamOpen;
    if (teamOpen == null) {
      teamOpen = {}
      teamOpen[teamId] = false;
    }
    teamOpen[teamId] = !teamOpen[teamId];
    if (teamOpen[teamId] && (this.state.playerList == null || this.state.playerList[teamId] == null)) {
      this.getTeamPlayerList(teamId).then(() => {
        this.setState({teamOpen: teamOpen})
      })
    } else {
      this.setState({teamOpen: teamOpen})
    }
  }
  getMemberHeadImg = () => {
    const userLeagueMember = this.state.userLeagueMember;
    if ((userLeagueMember != null && userLeagueMember.sourceType == 0) || userLeagueMember == null) {
      return this.state.league && this.state.league.headImg ? this.state.league.headImg : logo;
    } else if (userLeagueMember.sourceType == 1) {
      return userLeagueMember && userLeagueMember.verifyPlayer && userLeagueMember.verifyPlayer.headImg ? userLeagueMember.verifyPlayer.headImg : noperson;
    }
    return null;
  }
  getMemberName = () => {
    const userLeagueMember = this.state.userLeagueMember;
    if ((userLeagueMember != null && userLeagueMember.sourceType == 0) || userLeagueMember == null) {
      return this.state.league && this.state.league.name ? this.state.league.name : "联赛";
    } else if (userLeagueMember.sourceType == 1) {
      return userLeagueMember && userLeagueMember.verifyPlayer ? userLeagueMember.verifyPlayer.name : "球员";
    }
    return null;
  }
  getMemberIdNumber = () => {
    const userLeagueMember = this.state.userLeagueMember;
    if (userLeagueMember != null && userLeagueMember.sourceType == 0) {
      return userLeagueMember.id != null ? `会员号：q-${this.leagueId}${userLeagueMember.id}` : null;
    } else if (userLeagueMember != null && userLeagueMember.sourceType == 1) {
      return userLeagueMember.id != null ? `会员号：v-${this.leagueId}${userLeagueMember.id}` : null;
    }
    return null;
  }
  getMemberExpireTime = () => {
    const userLeagueMember = this.state.userLeagueMember;
    if (userLeagueMember != null && userLeagueMember.sourceType == 0) {
      return null;
    } else if (userLeagueMember != null && userLeagueMember.sourceType == 1) {
      return userLeagueMember.expireTime != null ? `，到期时间：${userLeagueMember.expireTime}` : null;
    }
    return null;
  }
  getPlayerLimitText = (playerId) => {
    const limit = this.getPlayerLimit(playerId);
    if (limit == null) {
      return null;
    }
    return `已绑定：${limit}`;
  }
  getPlayerLimit = (playerId) => {
    const playerLimit = this.state.playerLimit;
    if (playerLimit == null || playerLimit[playerId] == null) {
      return null;
    }
    return playerLimit[playerId];
  }
  onPlayerClick = (playerInfo) => {
    if (this.state.userLeagueMember) {
      Taro.showToast({title: "您已开通", icon: "none"})
      return;
    }
    if (playerInfo == null) {
      return;
    }
    const used = this.getPlayerLimit(playerInfo.id);
    const limited = this.state.leagueMemberRule && this.state.leagueMemberRule.verifyLimited ? this.state.leagueMemberRule.verifyLimited : 2;
    if (used == null || used >= limited) {
      Taro.showToast({title: "该球员无法继续绑定", icon: "none"})
      return;
    }
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    this.setState({currentPlayer: playerInfo, confirmOpen: true});
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
    this.getUserInfo(() => {
      this.initLeagueMember(this.leagueId);
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

  clearLoginState = () => {
    clearLoginToken();
    userAction.clearUserInfo();
  }
  onConfirmSuccess = () => {
    if (this.state.currentPlayer == null) {
      return;
    }
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    this.setState({confirmOpen: false})
    Taro.navigateTo({url: `../personVerify/personVerify?type=0&leagueId=${this.leagueId}&playerId=${this.state.currentPlayer.id}&userNo=${userNo}`});
  }
  onConfirmCancel = () => {
    this.setState({confirmOpen: false})
  }

  render() {
    const {loading, teamGroup} = this.state
    if (loading) {
      return <View className="qz-league-member-verify__result-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-league-member-verify__result'>
        <NavBar
          title='选择球员'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        {loading ? <View className="qz-league-member-verify__result-loading">
            <AtActivityIndicator
              mode="center"
              content="加载中..."/>
          </View> :
          <View className='qz-league-member-verify__result-content'>
            {this.state.league &&
            <View className="qz-league-member-verify__league"
                  style={{backgroundImage: `url(${this.state.league && this.state.league.poster ? this.state.league.poster : default_poster})`}}>
              <View className="qz-league-member-verify__league-overlay"/>
              <View className="qz-league-member-verify__league-name">
                <Image className="img"
                       src={this.getMemberHeadImg()}/>
                <Text className="name">{this.getMemberName()}</Text>
              </View>
              <View className="qz-league-member-verify__league-idnumber">
                <Text className="name">{this.getMemberIdNumber()}</Text>
              </View>
            </View>
            }
            {this.state.userLeagueMember ?
              <View className='qz-league-member-verify__hint'>
                您已开通{this.getMemberExpireTime()}
              </View>
              : <View className='qz-league-member-verify__tips'>
                <View className='qz-league-member-verify__tip'>
                  <Text className="at-icon at-icon-alert-circle"/>
                  请选择下方球员进行认证，认证后即可开通
                </View>
                <View className='qz-league-member-verify__tip'>
                  <Text className="at-icon at-icon-play"/>
                  {this.state.leagueMemberRule && this.state.leagueMemberRule.verifyExpireMonths ? this.state.leagueMemberRule.verifyExpireMonths : 1}个月内可免费观看此联赛的所有比赛录像
                </View>
                <View className='qz-league-member-verify__tip'>
                  <Text className="at-icon at-icon-play"/>
                  一名球员可绑定{this.state.leagueMemberRule && this.state.leagueMemberRule.verifyLimited ? this.state.leagueMemberRule.verifyLimited : 2}个账号，绑定后不可解绑，请谨慎操作
                </View>
              </View>}
            {teamGroup.map((group => {
              return (
                <View className='qz-league-member-verify__container' key={`group-${group.index}`}>
                  <View
                    className={group.group == ["default"] ? "qz-league-member-verify__header-none" : "qz-league-member-verify__header"}>
                    {group.group}
                  </View>
                  <View className='qz-league-member-verify__list'>
                    {group.team.map((teamInfo => {
                      return (
                        <Accordion
                          key={`team-${teamInfo.teamId}`}
                          open={this.state.teamOpen ? this.state.teamOpen[teamInfo.team ? teamInfo.team.id : null] : false}
                          onClick={this.handleTeamClick.bind(this, teamInfo.team ? teamInfo.team.id : null)}
                          icon={teamInfo.team ? teamInfo.team.headImg : logo}
                          title={teamInfo.team ? teamInfo.team.name : "队伍"}>
                          <AtList>
                            {this.state.playerList && this.state.playerList[teamInfo.team ? teamInfo.team.id : null] ?
                              this.state.playerList[teamInfo.team ? teamInfo.team.id : null].map((player: any) => {
                                return <AtListItem
                                  key={`player-${teamInfo.teamId}-${player.id}`}
                                  className="qz-league-member-verify__list-item"
                                  title={player && player.name ? player.name : "球员"}
                                  note={this.getPlayerLimitText(player.id)}
                                  thumb={player && player.headImg ? player.headImg : noperson}
                                  extraText={player && player.shirtNum != null ? `${player.shirtNum}号` : null}
                                  onClick={this.onPlayerClick.bind(this, player)}
                                />
                              })
                              : null}
                          </AtList>
                        </Accordion>
                      )
                    }))}
                  </View>
                </View>
              )
            }))}
          </View>
        }
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}/>
        <ModalVerifyConfirm
          isOpened={this.state.confirmOpen}
          handleConfirm={this.onConfirmSuccess}
          handleCancel={this.onConfirmCancel}
          currentPlayer={this.state.currentPlayer}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(LeagueMemberVerify)
