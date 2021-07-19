import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Image, Text, Button, CheckboxGroup, Checkbox,} from '@tarojs/components'
import {
  AtActivityIndicator,
  AtModal,
  AtModalAction,
  AtModalHeader,
  AtModalContent,
  AtActionSheet,
  AtActionSheetItem,
  AtToast,
  AtIcon,
} from "taro-ui"
import {connect} from "react-redux";

import edit from '../../assets/edit.png'
import eye from '../../assets/live/eye.png'

import './registration.scss'
import NavBar from "../../components/nav-bar";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import registrationAction from "../../actions/registration";
import {formatDate, formatMonthDay, getStorage, getTimeDifference, hasLogin} from "../../utils/utils";
import defaultLogo from "../../assets/default-logo.png";
import plus from "../../assets/live/plus.png";
import {default_poster, warning} from "../../utils/assets";
import noperson from "../../assets/no-person.png";
import LoginModal from "../../components/modal-login";
import PhoneModal from "../../components/modal-phone";
import ContractModal from "./components/contract-modal";
import ModalVerify from "./components/verify-modal";
import ModalLastChance from "./components/last-chance-modal";
import * as error from "../../constants/error";
import userAction from "../../actions/user";
import * as global from "../../constants/global";
import withShare from "../../utils/withShare";
import ShareMoment from "../../components/share-moment";
import ModalAlbum from "../../components/modal-album";
// import withOfficalAccount from "../../utils/withOfficialAccount";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {
  registrationCompleteFunc: any;
  registrationVerifyCompleteFunc: any;
}

type PageOwnProps = {}

type PageState = {
  leagueInfo: any;
  leagueRegistration: any;
  loading: boolean;
  teamInfo: any;
  playerList: any;
  phoneOpen: any;
  loginOpen: any;
  contractCheck: any;
  contarctShow: any;
  regitrationDeleteShow: any;
  reRegConfirmShow: any;
  regDocConfirmShow: any;
  regDocLoading: any;
  redDocTempFilePath: any;
  regDocOpenSuccess: any;
  regVerifyShow: any;
  regLastChanceShow: any;
  regStatus: any;
  endDiffDayTime: any;
  timerID_CountDown: any;
  teamLoading: boolean;
  shareMomentOpen: boolean;
  shareMomentLoading: boolean;
  shareMomentPoster: any;
  permissionShow: any;
  downloading: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Registration {
  props: IProps;
}

const STATUS = {
  unknow: -1,
  unopen: 0,
  open: 1,
  finish: 2,
}

// @withOfficalAccount()
@withShare({menus: ['shareAppMessage']})
class Registration extends Component<IProps, PageState> {
  navRef: any = null;
  leagueId: any = null;
  teamId: any = null;
  editable: any = true;
  isShare: any = false;

  constructor(props) {
    super(props)
    this.state = {
      leagueInfo: null,
      leagueRegistration: null,
      loading: false,
      teamInfo: null,
      playerList: [{}, {}, {}, {}, {}],
      phoneOpen: false,
      loginOpen: false,
      contractCheck: false,
      contarctShow: false,
      regitrationDeleteShow: false,
      reRegConfirmShow: false,
      regDocConfirmShow: false,
      regDocLoading: false,
      redDocTempFilePath: null,
      regDocOpenSuccess: false,
      regVerifyShow: false,
      regLastChanceShow: false,
      regStatus: null,
      endDiffDayTime: null,
      timerID_CountDown: null,
      teamLoading: false,
      shareMomentOpen: false,
      shareMomentLoading: false,
      shareMomentPoster: null,
      permissionShow: false,
      downloading: false,
    }
  }

  $setSharePath = () => {
    if (!this.editable) {
      return `/pages/home/home?id=${this.leagueId}&page=leagueManager`
    }
    if (this.teamId == null) {
      return `/pages/home/home?id=${this.leagueId}&page=leagueManager`
    }
    return `/pages/home/home?page=registration&leagueId=${this.leagueId}&regTeamId=${this.teamId}&editable=true&isShare=true`
  }

  $setShareTitle = () => {
    if (this.teamId == null) {
      return this.state.leagueInfo ? this.state.leagueInfo.name : "茄子TV赛事报名";
    }
    const teamInfo = this.state.teamInfo;
    return `${teamInfo.name}报名开始`;
  }

  $setOnShareCallback = () => {
    if (this.editable && this.teamId != null) {
      Taro.showToast({title: "分享成功后，对方填写成功后，刷新后可查看", icon: "none"});
    } else if (this.teamId == null) {
      Taro.showToast({title: "分享失败，请先添加球队后再试", icon: "none"});
    }
  }

  $setShareImageUrl = () => {
    if (!this.editable) {
      if (this.state.leagueRegistration && this.state.leagueRegistration.sharePic) {
        return this.state.leagueRegistration.sharePic;
      }
    }
    return null;
  }

  onShareAppMessage() {
  }

  onShareTimeline() {
  }

  componentWillMount() {
    this.leagueId = this.getParamLeagueId();
    this.teamId = this.getParamTeamId();
    this.editable = this.getParamEditable() === 'true';
    this.isShare = this.getParamIsShare() === 'true';
  }

  async componentDidMount() {
    if (!await this.isUserLogin()) {
      this.showAuth();
    }
    if (this.leagueId != null) {
      this.setState({loading: true})
      Promise.all([this.getLeagueInfo(this.leagueId), this.getLeagueRegistration(this.leagueId)]).then(() => {
        this.setState({loading: false})
      })
    }
    if (this.teamId != null) {
      this.getLeagueTeamRegistration(this.teamId);
      this.setState({contractCheck: true})
    }
    // else {
    //   this.getCachedTeam(this.leagueId);
    //   this.getCachedPlayerList(this.leagueId);
    // }
    registrationAction.setRegistrationTeamCallbackFunc(this.onTeamInfoConfirm)
    registrationAction.setRegistrationPlayerCallbackFunc(this.onPlayerInfoConfirm)
    registrationAction.setRegistrationPlayerDeleteCallbackFunc(this.onPlayerInfoDelete)
    this.startTimer_CountDown()
  }

  componentWillUnmount() {
    this.clearTimer_CountDown();
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  getParamLeagueId = () => {
    let leagueId;
    const router = getCurrentInstance().router;
    if (router && router.params) {
      if (router.params.leagueId == null) {
        leagueId = router.params.scene
      } else {
        leagueId = router.params.leagueId
      }
    } else {
      return null;
    }
    return leagueId;
  }
  getParamTeamId = () => {
    let teamId;
    const router = getCurrentInstance().router;
    if (router && router.params) {
      if (router.params.regTeamId == null) {
        teamId = router.params.scene
      } else {
        teamId = router.params.regTeamId
      }
    } else {
      return null;
    }
    return teamId;
  }
  getParamEditable = () => {
    let editable;
    const router = getCurrentInstance().router;
    if (router && router.params) {
      if (router.params.editable == null) {
        editable = router.params.scene
      } else {
        editable = router.params.editable
      }
    } else {
      return null;
    }
    return editable;
  }
  getParamIsShare = () => {
    let isShare;
    const router = getCurrentInstance().router;
    if (router && router.params) {
      if (router.params.isShare == null) {
        isShare = router.params.scene
      } else {
        isShare = router.params.isShare
      }
    } else {
      return null;
    }
    return isShare;
  }
  getLeagueInfo = (id) => {
    new Request().get(api.API_LEAGUE(id), null).then((data: any) => {
      this.setState({leagueInfo: data})
    })
  }
  getLeagueRegistration = (id) => {
    new Request().get(api.API_LEAGUE_REGISTRATION, {leagueId: id}).then((data: any) => {
      this.setState({leagueRegistration: data})
    })
  }
  getLeagueTeamRegistration = (id, onlyTeam?) => {
    this.setState({teamLoading: true})
    new Request().get(api.API_LEAGUE_REGISTRATION_TEAM_BY_ID(id), null).then((data: any) => {
      if (data) {
        this.setState({teamInfo: data})
        if (!onlyTeam) {
          new Request().get(api.API_LEAGUE_REGISTRATION_PLAYER, {
            registerTeamId: id,
            leagueId: this.leagueId
          }).then((playerData: any) => {
            this.setState({teamLoading: false})
            if (playerData && playerData.length > 0) {
              this.setState({playerList: playerData})
            }
          })
        } else {
          this.setState({teamLoading: false})
        }
      } else {
        this.setState({teamLoading: false})
      }
    })
  }
  onRefreshClick = () => {
    this.getLeagueTeamRegistration(this.teamId);
  }
  onTeamClick = (team) => {
    if (this.isShare) {
      return;
    }
    const user = this.props.userInfo;
    if (user == null || user.userNo == null) {
      Taro.showToast({title: "请先登录再进行操作", icon: "none"});
      return;
    }
    registrationAction.setRegistrationTeam(team)
    Taro.navigateTo({url: `../registrationTeam/registrationTeam?editable=${this.editable}&leagueId=${this.leagueId}`});
  }
  onPlayerClick = ({player, index}) => {
    const user = this.props.userInfo;
    if (user == null || user.userNo == null) {
      Taro.showToast({title: "请先登录再进行操作", icon: "none"});
      return;
    }
    if (player.userNo != null && user.userNo != player.userNo && this.isShare) {
      Taro.showToast({title: "无法修改别人创建的球员", icon: "none"});
      return;
    }
    registrationAction.setRegistrationPlayer(player)
    Taro.navigateTo({url: `../registrationPlayer/registrationPlayer?index=${index}&editable=${this.editable}`});
  }
  onTeamInfoConfirm = (teamInfo) => {
    const user = this.props.userInfo;
    if (user == null || user.userNo == null) {
      Taro.showToast({title: "请先登录再进行操作", icon: "none"});
      return;
    }
    teamInfo.leagueId = this.leagueId;
    if (this.teamId == null) {
      new Request().post(api.API_LEAGUE_REGISTRATION_TEAM_PRE, {
        team: teamInfo,
        userNo: this.props.userInfo.userNo
      }).then((data: any) => {
        if (data && data.registerTeamId) {
          this.teamId = data.registerTeamId;
          this.getLeagueTeamRegistration(data.registerTeamId, true)
          this.props.registrationCompleteFunc && this.props.registrationCompleteFunc();
          Taro.showToast({title: "修改成功，已保存", icon: "none"})
        } else {
          Taro.showToast({title: "球队报名失败", icon: "none"});
        }
      })
    } else {
      // if (this.state.teamInfo && this.state.teamInfo.verifyStatus == -2) {
      teamInfo.id = this.teamId;
      new Request().put(api.API_LEAGUE_REGISTRATION_TEAM_PRE, teamInfo).then((data) => {
        if (data) {
          this.getLeagueTeamRegistration(this.teamId, true)
          this.props.registrationCompleteFunc && this.props.registrationCompleteFunc();
          Taro.showToast({title: "修改成功，已保存", icon: "none"})
        } else {
          Taro.showToast({title: "球队报名失败", icon: "none"});
        }
      })
      // }
    }
  }
  onPlayerInfoConfirm = (playerInfo) => {
    const user = this.props.userInfo;
    if (user == null || user.userNo == null) {
      Taro.showToast({title: "请先登录再进行操作", icon: "none"});
      return;
    }
    return new Promise((resolve, _reject) => {
      let playerList = this.state.playerList;
      let index = playerInfo.index;
      const currentPlayer = playerList[index];
      let idVerify = true;
      let shirtVerify = true;
      let userNoVerify = true;
      for (let key in playerList) {
        if (playerInfo.identityNumber == playerList[key].identityNumber && index != key) {
          idVerify = false;
        }
        if (playerInfo.shirtNum == playerList[key].shirtNum && index != key) {
          shirtVerify = false;
        }
      }
      if (currentPlayer != null && currentPlayer.userNo != null && user.userNo != currentPlayer.userNo && this.isShare) {
        userNoVerify = false;
      }
      if (idVerify && shirtVerify && userNoVerify) {
        playerInfo.leagueId = this.leagueId;
        playerInfo.registerTeamId = this.teamId;
        if (currentPlayer == null || currentPlayer.id == null) {
          new Request().post(api.API_LEAGUE_REGISTRATION_PLAYER, {
            registerTeamId: this.teamId,
            userNo: user.userNo,
            player: playerInfo
          }).then((data) => {
            if (data) {
              this.getLeagueTeamRegistration(this.teamId)
              Taro.showToast({title: "球员报名成功", icon: "none"})
            } else {
              Taro.showToast({title: "球员报名失败", icon: "none"});
            }
          })
        } else {
          playerInfo.id = currentPlayer.id;
          new Request().put(api.API_LEAGUE_REGISTRATION_PLAYER, {
            registerTeamId: this.teamId,
            userNo: user.userNo,
            player: playerInfo
          }).then((data) => {
            if (data) {
              this.getLeagueTeamRegistration(this.teamId)
              Taro.showToast({title: "球员报名成功", icon: "none"})
            } else {
              Taro.showToast({title: "球员报名失败", icon: "none"});
            }
          })
        }
        resolve(true);
      } else if (!idVerify) {
        resolve(error.ERROR_PLAYER_ID_NUMBER_DUPLICATE);
      } else if (!shirtVerify) {
        resolve(error.ERROR_PLAYER_SHIRT_NUMBER_DUPLICATE);
      } else if (!userNoVerify) {
        resolve(error.ERROR_PLAYER_USER_NOT_VALID);
      }
    });
  }
  onPlayerInfoDelete = (index) => {
    const user = this.props.userInfo;
    if (user == null || user.userNo == null) {
      Taro.showToast({title: "请先登录再进行操作", icon: "none"});
      return;
    }
    let playerList = this.state.playerList;
    const currentPlayer = playerList[index];
    if (currentPlayer != null && currentPlayer.id != null) {
      if (currentPlayer.userNo != null && user.userNo != currentPlayer.userNo && this.isShare) {
        Taro.showToast({title: "无法修改别人创建的球员", icon: "none"});
        return;
      }
      new Request().delete(`${api.API_LEAGUE_REGISTRATION_PLAYER}?registerPlayerId=${currentPlayer.id}&userNo=${user.userNo}`, null).then((data) => {
        if (data) {
          this.getLeagueTeamRegistration(this.teamId)
          Taro.showToast({title: "删除成功", icon: "none"})
        } else {
          Taro.showToast({title: "删除失败", icon: "none"})
        }
      })
    } else {
      playerList.splice(index, 1)
      this.setState({playerList: playerList}, () => {
        Taro.showToast({title: "删除成功", icon: "none"})
      })
    }
  }
  getDateString = (leagueRegistration) => {
    if (leagueRegistration == null) {
      return null;
    }
    const now = new Date();
    const end = new Date(leagueRegistration.dateEnd);
    let dateString = "";
    if (now.getFullYear() != end.getFullYear()) {
      dateString = "报名截止：" + formatDate(end);
    } else {
      dateString = "报名截止：" + formatMonthDay(end);
    }
    return dateString;
  }
  onAddPlayerClick = () => {
    const playerList = this.state.playerList;
    playerList.push({})
    this.setState({playerList: playerList})
  }
  getPlayerList = () => {
    const playerList: Array<any> = [];
    for (let key in this.state.playerList) {
      const player = this.state.playerList[key]
      if (player != null && player.name != null) {
        playerList.push(player)
      }
    }
    return playerList;
  }
  onRegitrationConfirmClick = () => {
    const lastChance = this.state.teamInfo ? this.state.teamInfo.lastChance : false;
    const endTime = this.state.leagueRegistration && this.state.leagueRegistration.dateEnd ? new Date(this.state.leagueRegistration.dateEnd) : null;
    const nowDate = new Date();
    if (endTime != null && endTime.getTime() < nowDate.getTime() && !lastChance) {
      Taro.showToast({title: "不在报名时段内", icon: "none"});
      return;
    }
    const user = this.props.userInfo;
    if (user == null || user.userNo == null) {
      Taro.showToast({title: "请先登录再进行操作", icon: "none"});
      return;
    }
    if (!this.state.contractCheck) {
      Taro.showToast({title: "请阅读并同意免责协议", icon: "none"});
      return;
    }
    const team = this.state.teamInfo;
    if (this.teamId != null) {
      team.id = this.teamId;
    }
    const playerList: Array<any> = this.getPlayerList();
    if (this.state.teamInfo == null || this.state.teamInfo.name == null) {
      Taro.showToast({title: "请添加球队", icon: "none"});
      return;
    }
    if (playerList == null || playerList.length <= 0) {
      Taro.showToast({title: "请添加球员", icon: "none"});
      return;
    }
    if (playerList.length < 5) {
      Taro.showToast({title: "至少要五名球员，请添加球员", icon: "none"});
      return;
    }
    const request = {
      userNo: user.userNo,
      leagueId: this.leagueId,
      teamRegistration: team,
      playerRegistrations: playerList,
    }
    this.onSubscribe(() => {
      if (this.teamId != null) {
        new Request().put(api.API_LEAGUE_REGISTRATION_TEAM, request).then((data) => {
          if (data) {
            // if (this.teamId == null) {
            //   this.removeCacheTeam();
            //   this.removeCachePlayer();
            // }
            Taro.navigateBack({
              delta: 1,
            });
            this.props.registrationCompleteFunc && this.props.registrationCompleteFunc();
            Taro.showToast({title: `提交审核成功`, icon: "none"});
          }
        })
      } else {
        new Request().post(api.API_LEAGUE_REGISTRATION_TEAM, request).then((data) => {
          if (data) {
            // if (this.teamId == null) {
            //   this.removeCacheTeam();
            //   this.removeCachePlayer();
            // }
            Taro.navigateBack({
              delta: 1,
            });
            this.props.registrationCompleteFunc && this.props.registrationCompleteFunc();
            Taro.showToast({title: `提交审核成功`, icon: "none"});
          }
        })
      }
    });
  }
  onRegitrationDeleteClick = () => {
    const lastChance = this.state.teamInfo ? this.state.teamInfo.lastChance : false;
    const endTime = this.state.leagueRegistration && this.state.leagueRegistration.dateEnd ? new Date(this.state.leagueRegistration.dateEnd) : null;
    const nowDate = new Date();
    if (endTime != null && endTime.getTime() < nowDate.getTime() && !lastChance) {
      Taro.showToast({title: "不在报名时段内", icon: "none"});
      return;
    }
    this.setState({regitrationDeleteShow: true})
  }
  onRegitrationDeleteCancel = () => {
    this.setState({regitrationDeleteShow: false})
  }
  onRegitrationDeleteConfirm = () => {
    const lastChance = this.state.teamInfo ? this.state.teamInfo.lastChance : false;
    const endTime = this.state.leagueRegistration && this.state.leagueRegistration.dateEnd ? new Date(this.state.leagueRegistration.dateEnd) : null;
    const nowDate = new Date();
    if (endTime != null && endTime.getTime() < nowDate.getTime() && !lastChance) {
      Taro.showToast({title: "不在报名时段内", icon: "none"});
      return;
    }
    new Request().delete(`${api.API_LEAGUE_REGISTRATION_TEAM}?registerTeamId=${this.teamId}`, null).then((data) => {
      if (data) {
        // this.removeCacheTeam();
        // this.removeCachePlayer();
        Taro.navigateBack({
          delta: 1,
        });
        this.props.registrationCompleteFunc && this.props.registrationCompleteFunc();
        Taro.showToast({title: `取消成功`, icon: "none"});
      }
    })
  }
  onSubscribe = (callback) => {
    const user = this.props.userInfo;
    let tmplIds: any = [];
    tmplIds.push(global.SUBSCRIBE_TEMPLATES.REGISTRATION_VERIFY);
    const openid = user.wechatOpenid;
    let param: any = {
      userNo: this.props.userInfo.userNo,
      openId: openid,
      leagueId: this.leagueId,
      registrationTeamId: this.teamId,
    };
    Taro.requestSubscribeMessage({tmplIds: tmplIds}).then((res: any) => {
      if (res.errMsg == "requestSubscribeMessage:ok") {
        delete res.errMsg
        new Request().post(api.API_SUBSCRIBE_REGISTRATION_VERIFY, {templateIds: res, ...param}).then((data: any) => {
          if (data) {
            Taro.showToast({title: "订阅成功", icon: "none"});
          }
          callback && callback();
        })
      }
    }).catch(() => {
      callback && callback();
    })
  }
  onReRegShow = () => {
    if (this.teamId != null && this.state.teamInfo && this.state.teamInfo.verifyStatus == 1) {
      this.setState({reRegConfirmShow: true})
    } else {
      this.onRegitrationConfirmClick();
    }
  }
  onReRegCancel = () => {
    this.setState({reRegConfirmShow: false})
  }
  onReRegConfrim = () => {
    this.onRegitrationConfirmClick();
  }
  onContractCheck = (e) => {
    if (e.detail.value.indexOf("contract") >= 0) {
      this.setState({contractCheck: true})
    } else {
      this.setState({contractCheck: false})
    }
  }
  onContractClick = () => {
    this.setState({contarctShow: true})
  }
  onContractCancel = () => {
    this.setState({contarctShow: false})
  }
  onRegitrationDocClick = () => {
    this.setState({regDocLoading: true})
    if (this.state.redDocTempFilePath != null || this.state.regDocOpenSuccess) {
      this.setState({regDocLoading: false, regDocConfirmShow: true})
    } else {
      const {teamInfo} = this.state
      if (teamInfo && teamInfo.docUrl) {
        Taro.downloadFile({
          url: teamInfo.docUrl,
          success: (res) => {
            var filePath = res.tempFilePath;
            if (filePath) {
              this.setState({redDocTempFilePath: filePath, regDocLoading: false, regDocConfirmShow: true});
            }
          }
        })
      }
    }
  }
  onRegitrationDocCancel = () => {
    this.setState({regDocConfirmShow: false})
  }
  onRegDocOnlinePreView = () => {
    const {redDocTempFilePath, teamInfo} = this.state
    if (redDocTempFilePath) {
      Taro.getFileSystemManager().saveFile({
        tempFilePath: redDocTempFilePath,
        filePath: `${Taro.env.USER_DATA_PATH}/${teamInfo && teamInfo.name ? teamInfo.name : "比赛"}报名表.pdf`,
        success: (res) => {
          Taro.openDocument({
            filePath: res.savedFilePath,
            fileType: 'pdf',
            showMenu: true,
            success: (openRes) => {
              console.log(openRes)
              this.setState({regDocOpenSuccess: true})
            },
            fail: () => {
              this.setState({regDocOpenSuccess: false})
              Taro.showToast({title: "在线预览失败", icon: "none"})
            }
          })
        },
        fail: (e) => {
          console.log(e)
          this.setState({regDocOpenSuccess: false})
          Taro.showToast({title: "在线预览失败", icon: "none"})
        }
      })
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
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      });
    } else {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
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
    this.getUserInfo((res) => {
      const phone = res.payload.phone
      if (res.payload != null && phone == null) {
        this.setState({phoneOpen: true})
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
  getVerifyStatus = (status) => {
    if (status == null) {
      return null;
    }
    switch (status) {
      case -2:
        return "未提交";
      case -1:
        return "审核中";
      case 0:
        return "审核不通过";
      case 1:
        return "已审核通过";
    }
  }
  onRegVerifyClick = () => {
    this.setState({regVerifyShow: true})
  }
  onRegVerifyCancel = () => {
    this.setState({regVerifyShow: false})
  }
  onRegVerifyError = () => {
    Taro.showToast({title: "审核失败", icon: "none"})
    this.setState({regVerifyShow: false})
  }
  onRegVerifySuccess = () => {
    this.setState({regVerifyShow: false})
    Taro.showToast({
      title: "审核成功", icon: "none", duration: 2000
    })
    setTimeout(() => {
      Taro.navigateBack({
        delta: 1
      });
      this.props.registrationVerifyCompleteFunc && this.props.registrationVerifyCompleteFunc();
    }, 2000)
  }
  onRegLastChanceClick = () => {
    this.setState({regLastChanceShow: true})
  }
  onRegLastChanceCancel = () => {
    this.setState({regLastChanceShow: false})
  }
  onRegLastChanceError = () => {
    Taro.showToast({title: "修改失败", icon: "none"})
    this.setState({regLastChanceShow: false})
  }
  onRegLastChanceSuccess = () => {
    this.setState({regLastChanceShow: false})
    Taro.showToast({
      title: "修改成功", icon: "none", duration: 3000
    })
    setTimeout(() => {
      Taro.navigateBack({
        delta: 1
      });
      this.props.registrationVerifyCompleteFunc && this.props.registrationVerifyCompleteFunc();
    }, 3000)
  }
  isLeagueRegistrationEnd = () => {
    if (this.state.regStatus == STATUS.finish) {
      return true;
    }
    return false;
  }
  getEndDiffTime = () => {
    const endTime = this.state.leagueRegistration && this.state.leagueRegistration.dateEnd ? new Date(this.state.leagueRegistration.dateEnd) : null;
    if (endTime) {
      const diff = getTimeDifference(endTime, true);
      this.setState({
        endDiffDayTime: diff,
      });
    }
  }
  getStatus = () => {
    const endTime = this.state.leagueRegistration && this.state.leagueRegistration.dateEnd ? new Date(this.state.leagueRegistration.dateEnd) : null;
    if (endTime == null) {
      return STATUS.unknow;
    }
    const nowDate = new Date().getTime();
    const endTime_diff = endTime.getTime() - nowDate;
    if (endTime_diff > 0) {
      return STATUS.open;
    } else {
      return STATUS.finish;
    }
  }
  startTimer_CountDown = () => {
    this.clearTimer_CountDown();
    const timerID_CountDown = setInterval(() => {
      const status = this.getStatus();
      this.setState({regStatus: status})
      if (status == STATUS.open) {
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
  onCountDownTitleClick = () => {
    Taro.showToast({title: "报名截止后，组委不再受理球队的报名及报名表修改，如需修改或报名请联系组委会", icon: "none", duration: 2000})
  }
  onGenCodeClick = () => {
    if (this.state.downloading) {
      return;
    }
    this.setState({downloading: true})
    new Request().get(api.API_LEAGUE_REGISTRATION_TEAM_BY_ID(this.teamId), null).then((data: any) => {
      if (data) {
        if (data && data.sharePic) {
          this.setState({shareMomentPoster: data.sharePic, shareMomentOpen: true, downloading: false})
        } else {
          new Request().get(api.API_GET_REGISTRATION_TEAM_SHARE, {registerTeamId: this.teamId}).then((shareData: any) => {
            if (shareData) {
              this.setState({shareMomentPoster: shareData, shareMomentOpen: true, downloading: false})
            } else {
              Taro.showToast({title: "生成失败", icon: "none"})
              this.setState({downloading: false})
            }
          });
        }
      } else {
        Taro.showToast({title: "生成失败", icon: "none"})
        this.setState({downloading: false})
      }
    });
  }
  onInviteClick = () => {
    Taro.showToast({title: "填写球队后才可邀请球员填写", icon: "none", duration: 2000})
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
              title: "图片保存到相册成功",
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

  render() {
    const {leagueInfo, teamInfo, leagueRegistration, regStatus, endDiffDayTime} = this.state
    if (this.state.loading) {
      return <View className="qz-registration-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }

    return (
      <View className='qz-registration'>
        <NavBar
          title='报名参赛详情'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-registration-header'>
          {leagueInfo &&
          <View className="qz-registration-league"
                style={{backgroundImage: `url(${leagueInfo.poster ? leagueInfo.poster : default_poster})`}}>
            <View className="qz-registration-league__name">
              <Image className="img"
                     src={leagueInfo.headImg ? leagueInfo.headImg : defaultLogo}/>
              <Text className="name">{leagueInfo.name}</Text>
            </View>
            <View className="qz-registration-league__info">
              {leagueInfo.city ? <View className="city">{leagueInfo.city}</View> : null}
              {leagueRegistration && leagueRegistration.dateEnd ?
                <Text className="time">
                  {this.getDateString(leagueRegistration)}
                </Text>
                : null
              }
            </View>
            {teamInfo && teamInfo.docUrl && !this.isShare ? <View className="qz-registration-league__button">
              <Button onClick={this.onRegitrationDocClick}>生成报名表</Button>
            </View> : null}
          </View>
          }
        </View>
        <View className='qz-registration-team' onClick={this.onTeamClick.bind(this, this.state.teamInfo)}>
          <View className='qz-registration-team__info'>
            <Image className="headImg" src={teamInfo && teamInfo.headImg ? teamInfo.headImg : defaultLogo}/>
            <View className='qz-registration-team__info-right'>
              <View className="teamName">
                <Text>{teamInfo && teamInfo.name ? teamInfo.name : "请输入球队信息"}</Text>
              </View>
              <View className="hint">
                <Text>{this.teamId != null && teamInfo ? `${this.getVerifyStatus(teamInfo.verifyStatus)}` : "未提交"}</Text>
              </View>
              <View className="edit">
                <Image src={this.editable && !this.isShare ? edit : eye}/>
              </View>
            </View>
          </View>
        </View>
        {this.state.leagueRegistration && this.state.leagueRegistration.available ?
          <View className='qz-registration-countdown'>
            <View className='qz-registration-countdown__info'>
              <View className="qz-registration-countdown__title" onClick={this.onCountDownTitleClick}>
                报名倒计时<AtIcon value='help' size='12' color='#999'/>
              </View>
              <View className="qz-registration-countdown__time">
                {regStatus == STATUS.open ? `报名中 ${endDiffDayTime ? `${endDiffDayTime.diffTime ? endDiffDayTime.diffDay + endDiffDayTime.diffTime : ""}` : ""}` : ""}
                {regStatus == STATUS.finish ? `报名已结束` : ""}
              </View>
            </View>
          </View>
          : null}
        {
          this.editable && !this.isShare && teamInfo && teamInfo.verifyMessage ?
            <View className="qz-registration-verify">
              {teamInfo && teamInfo.verifyMessage ? teamInfo.verifyMessage : null}
            </View> : null
        }
        <View className="qz-registration-player">
          <View className="qz-registration-player__title">
            球队教练
          </View>
          <View className="qz-registration-player-list">
            <View key="coach"
                  onClick={this.onTeamClick.bind(this, this.state.teamInfo)}
                  className='qz-registration-player-list__item'>
              <View className='qz-registration-player-list__item-inner'>
                <View className='qz-registration-player-list__item-avatar'>
                  <Image mode='scaleToFill' src={noperson}/>
                </View>
                <View className='qz-registration-player-list__item-content item-content'>
                  <View className='item-content__info'>
                    <View
                      className='item-content__info-title'>{teamInfo && teamInfo.coachName ? teamInfo.coachName : "教练"}</View>
                  </View>
                </View>
                <View className='qz-registration-player-list__item-extra item-extra'>
                  <View className='item-extra__phone'>
                    <Text>{teamInfo && teamInfo.coachPhone ? `${teamInfo.coachPhone}` : "待加入"}</Text>
                  </View>
                  <View className='at-icon at-icon-chevron-right'>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="qz-registration-player">
          <View className="qz-registration-player__title">
            <Text className="left">球员列表</Text>
            <Text className="right" onClick={this.onRefreshClick}>
              刷新球员
              <AtIcon value="reload" size='14' color='#4F7DE2'/>
            </Text>
          </View>
          <View className="qz-registration-player-list">
            {this.state.playerList && this.state.playerList.map((player: any, index) => {
              return <View key={`player-${index}`}
                           onClick={this.onPlayerClick.bind(this, {player, index})}
                           className='qz-registration-player-list__item'>
                <View className='qz-registration-player-list__item-inner'>
                  <View className='qz-registration-player-list__item-avatar'>
                    <Image mode='scaleToFill' src={player.headImg ? player.headImg : noperson}/>
                  </View>
                  <View className='qz-registration-player-list__item-content item-content'>
                    <View className='item-content__info'>
                      <View className='item-content__info-title'>{player.name ? player.name : "球员"}</View>
                    </View>
                    <View className='item-content__info-note'>
                      {this.editable && !this.isShare && player && player.verifyMessage ? player.verifyMessage : null}
                    </View>
                  </View>
                  <View className='qz-registration-player-list__item-extra item-extra'>
                    <View className='item-extra__text'>
                      <Text>{player.shirtNum != null ? `${player.shirtNum}号` : "待加入"}</Text>
                    </View>
                    <View className='at-icon at-icon-chevron-right'>
                    </View>
                  </View>
                </View>
              </View>
            })}
            {this.editable ? <View className="qz-registration-player__transparent">
              <Button onClick={this.onAddPlayerClick}><Image src={plus}/></Button>
            </View> : null}
          </View>
          <View className="qz-registration-player__buttons">
            {this.editable && !this.isShare ? <View className="qz-registration-player__add button">
              {this.state.teamInfo == null || this.state.teamInfo.name == null ?
                <Button onClick={this.onInviteClick}><AtIcon value="share" size="12"
                                                             color="#ffffff"/><Text>邀请球员填写</Text></Button>
                : <Button openType="share"><AtIcon value="share" size="12" color="#ffffff"/><Text>邀请球员填写</Text></Button>
              }
            </View> : null}
            {this.editable && !this.isShare ? <View className="qz-registration-player__add button">
              <Button onClick={this.onGenCodeClick}><AtIcon value="image" size="12"
                                                            color="#ffffff"/><Text>生成报名二维码</Text></Button>
            </View> : null}
          </View>
          {this.editable && !this.isShare ? <View className="qz-registration-contract">
            <View className="qz-registration-contract__inner">
              <CheckboxGroup onChange={this.onContractCheck}>
                <Checkbox value="contract" color="#2d8cf0" checked={this.state.contractCheck}><Text
                  className="contract-agreement">我已阅读并同意</Text></Checkbox>
              </CheckboxGroup>
              <Text className="contract" onClick={this.onContractClick}>《免责协议》</Text>
            </View>
            <View className='qz-registration-contract__hint'>
              未提交的修改将自动保存
            </View>
          </View> : null}
          {this.editable && !this.isShare ? <View className="qz-registration-player__confirm">
            <Button onClick={this.onReRegShow}>提交审核</Button>
          </View> : null}
          {this.editable && !this.isShare && this.teamId ? <View className="qz-registration-player__delete">
            <Button onClick={this.onRegitrationDeleteClick}>取消报名</Button>
          </View> : null}
          {!this.editable && !this.isShare ? <View className="qz-registration-player__confirm">
            <Button onClick={this.onRegVerifyClick}>审核</Button>
          </View> : null}
          {!this.editable && !this.isShare && this.isLeagueRegistrationEnd() ?
            <View className="qz-registration-player__confirm">
              <Button onClick={this.onRegLastChanceClick}>让他重新修改一次</Button>
            </View> : null}
        </View>
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}
        />
        <PhoneModal
          isOpened={this.state.phoneOpen}
          handleConfirm={this.onPhoneSuccess}
          handleCancel={this.onPhoneCancel}
          handleClose={this.onPhoneClose}
          handleError={this.onPhoneError}/>
        <ContractModal
          isOpened={this.state.contarctShow}
          registrationRule={this.state.leagueRegistration}
          loading={this.state.loading}
          handleCancel={this.onContractCancel}
        />
        <AtModal
          isOpened={this.state.regitrationDeleteShow}
          onClose={this.onRegitrationDeleteCancel}
          onCancel={this.onRegitrationDeleteCancel}
          onConfirm={this.onRegitrationDeleteConfirm}
        >
          <AtModalHeader>是否确认取消报名</AtModalHeader>
          <AtModalContent>
            <View className="qz-registration__delete-confirm__image">
              <Image src={warning}/>
            </View>
            取消报名后将清除该报名记录，请确认是否取消报名。
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.onRegitrationDeleteCancel}>暂不取消</Button>
            <Button
              className="qz-registration__delete-confirm__button"
              onClick={this.onRegitrationDeleteConfirm}>取消报名</Button>
          </AtModalAction>
        </AtModal>
        <AtModal
          isOpened={this.state.reRegConfirmShow}
          onClose={this.onReRegCancel}
          onCancel={this.onReRegCancel}
          onConfirm={this.onReRegConfrim}
        >
          <AtModalHeader>是否确认提交审核</AtModalHeader>
          <AtModalContent>
            <View
              className="qz-registration__delete-confirm__image">
              <Image
                src={warning}
              />
            </View>
            球队已审核通过，是否确认重新提交审核。
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.onReRegCancel}>暂不提交</Button>
            <Button
              className="qz-registration__delete-confirm__button"
              onClick={this.onReRegConfrim}>确定提交</Button>
          </AtModalAction>
        </AtModal>
        <AtActionSheet
          isOpened={this.state.regDocConfirmShow}
          onCancel={this.onRegitrationDocCancel}
          onClose={this.onRegitrationDocCancel}
          title="在线预览右上角可保存转发到微信"
          cancelText='取消'>
          <AtActionSheetItem onClick={this.onRegDocOnlinePreView}>
            在线预览下载
          </AtActionSheetItem>
          {/*<AtActionSheetItem onClick={this.onRegDocDownload}>*/}
          {/*  下载*/}
          {/*</AtActionSheetItem>*/}
        </AtActionSheet>
        <ModalLastChance
          isOpened={this.state.regLastChanceShow}
          onCancel={this.onRegLastChanceCancel}
          onError={this.onRegLastChanceError}
          onSuccess={this.onRegLastChanceSuccess}
          registrationTeamId={this.teamId}
        />
        <ModalVerify
          isOpened={this.state.regVerifyShow}
          onCancel={this.onRegVerifyCancel}
          onError={this.onRegVerifyError}
          onSuccess={this.onRegVerifySuccess}
          registrationTeamId={this.teamId}
        />
        <ModalAlbum
          isOpened={this.state.permissionShow}
          handleConfirm={this.onPremissionSuccess}
          handleCancel={this.onPremissionCancel}
          handleClose={this.onPremissionClose}/>
        <ShareMoment
          isOpened={this.state.shareMomentOpen}
          loading={this.state.shareMomentLoading}
          poster={this.state.shareMomentPoster}
          handleConfirm={this.onShareMomentConfirm}
          handleCancel={this.onShareMomentCancel}
        />
        <AtToast isOpened={this.state.regDocLoading} text="生成中..." icon="loading"/>
        <AtToast isOpened={this.state.teamLoading} text="加载中..." icon="loading"/>
        <AtToast isOpened={this.state.shareMomentLoading || this.state.downloading} text="下载中..." icon="loading"/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    registrationCompleteFunc: state.registration.registrationCompleteFunc,
    registrationVerifyCompleteFunc: state.registration.registrationVerifyCompleteFunc
  }
}
export default connect(mapStateToProps)(Registration)
