import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image, Button} from '@tarojs/components'
import {connect} from 'react-redux'

import {AtActivityIndicator} from 'taro-ui'

import './playerVerify.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import ModalPlayerVerifyConfirm from "./components/player-verify-confirm-modal";
import ModalPlayerVerifyHint from "./components/player-verify-hint-modal";
import ModalPlayerVerifyInherit from "./components/player-verify-inherit-modal";
import ModalHintCashTotal from "./components/cash-total-hint-modal";
import ModalCashExpireHint from "./components/cash-expire-hint-modal";
import * as error from "../../constants/error";
import {clearLoginToken, getStorage, hasLogin, getYuan, formatTime} from "../../utils/utils";
import userAction from "../../actions/user";
import LoginModal from "../../components/modal-login";
import * as global from "../../constants/global";
import logo from "../../assets/default-logo.png";
import noperson from "../../assets/no-person.png";
import NavBar from "../../components/nav-bar";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  cashLoading: boolean;
  loginOpen: boolean;
  hintOpen: boolean;
  inheritOpen: boolean;
  confirmOpen: boolean;
  cashHintOpen: boolean;
  cashExpireOpen: boolean;
  currentPlayer: any;
  hint: any;
  cashTotal: number;
  cashRemain: number;
  leaguePlayerCashList: any;
  expireDateString: any;
  currentPercent: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface PersonVerify {
  props: IProps;
}

class PersonVerify extends Component<IProps, PageState> {
  navRef: any = null;
  type = null;
  playerId = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      cashLoading: false,
      loginOpen: false,
      hintOpen: false,
      inheritOpen: false,
      confirmOpen: false,
      cashHintOpen: false,
      cashExpireOpen: false,
      currentPlayer: null,
      hint: null,
      cashTotal: 0,
      cashRemain: 0,
      leaguePlayerCashList: null,
      expireDateString: null,
      currentPercent: null,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.type = this.getParam("type");
    this.playerId = this.getParam("playerId");
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    this.type = this.getParam("type");
    this.playerId = this.getParam("playerId");
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    this.refresh(userNo);
  }

  componentDidHide() {
  }

  getParam = (name) => {
    const router = getCurrentInstance().router;
    if (router && router.params != null && router.params[name] != null) {
      return router.params[name]
    } else {
      return null;
    }
  }
  refresh = (userNo) => {
    if (this.playerId != null) {
      this.initPlayerVerifyInfo(this.playerId, userNo);
    } else {
      this.initUserIdentity(userNo);
    }
  }
  initUserIdentity = (userNo) => {
    this.setState({loading: true})
    new Request().get(api.API_USER_IDENTITY, {
      userNo: userNo
    }).then((data: any) => {
      if (data && data.id) {
        let currentPlayer: any = {};
        currentPlayer.headImg = this.props.userInfo && this.props.userInfo.avatar ? this.props.userInfo.avatar : noperson;
        currentPlayer.name = this.props.userInfo && this.props.userInfo.name ? this.props.userInfo.name : "球员";
        this.setState({currentPlayer: currentPlayer, loading: false})
        this.initCashOverView(null, userNo);
      } else {
        this.setState({loading: false, hint: "您还未绑定球员，请到球星夸夸榜中选择球员进行验证。", hintOpen: true})
      }
    })
  }
  initPlayerVerifyInfo = (playerId, userNo) => {
    this.setState({loading: true})
    new Request().get(api.API_PLAYER_VERIFY, {
      playerId: playerId,
      userNo: userNo
    }).then((data: any) => {
      if (data != null && data.id != null) {
        let confirmOpen = false;
        let inheritOpen = false;
        let hintOpen = false;
        let hint = null;
        if (data.isMe) {
          this.initCashOverView(playerId, userNo);
        } else if (data.verifyEnabled) {
          confirmOpen = true;
        } else if (data.inhertEnabled) {
          inheritOpen = true;
        } else {
          hintOpen = true;
        }
        this.setState({currentPlayer: data, loading: false, confirmOpen, inheritOpen, hintOpen, hint})
      } else {
        Taro.showToast({title: "获取球员失败信息，请返回重试", icon: "none"});
      }
    })
  }
  initCashOverView = (playerId, userNo) => {
    this.setState({cashLoading: true})
    new Request().get(api.API_CASH_OVERVIEW, {
      playerId: playerId,
      userNo: userNo
    }).then((data: any) => {
      if (data != null) {
        if (data.playerCash) {
          this.setState({cashTotal: data.playerCash.cashTotal, cashRemain: data.playerCash.cashRemain});
        }
        if (data.leaguePlayerCashList) {
          this.setState({leaguePlayerCashList: data.leaguePlayerCashList})
        }
        this.setState({cashLoading: false})
      }
    })
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
    this.getUserInfo((userInfo) => {
      this.refresh(userInfo.payload.userNo);
    })
  }

  async getUserInfo(onSuccess?: Function | null) {
    if (await hasLogin()) {
      const openid = await getStorage('wechatOpenid');
      userAction.getUserInfo({openId: openid}, {
        success: (res) => {
          Taro.hideLoading()
          if (onSuccess) {
            onSuccess(res);
          }
        }, failed: () => {
          this.clearLoginState();
          Taro.hideLoading()
        }
      });
    } else {
      this.clearLoginState();
      Taro.hideLoading()
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
    Taro.navigateTo({url: `../personVerify/personVerify?type=1&playerId=${this.state.currentPlayer.id}&userNo=${userNo}`});
  }
  onConfirmCancel = () => {
    Taro.navigateBack({
      delta: 1
    });
  }
  onHintCancel = () => {
    Taro.navigateBack({
      delta: 1
    });
  }
  onCashHintClick = (percent) => {
    this.setState({cashHintOpen: true, currentPercent: percent})
  }
  onCashExpireHintClick = (data) => {
    this.setState({
      cashExpireOpen: true,
      expireDateString: data.expireTime ? formatTime(new Date(data.expireTime)) : null
    })
  }
  onCashHintCancel = () => {
    this.setState({cashHintOpen: false})
  }
  onCashExpireCancel = () => {
    this.setState({cashExpireOpen: false})
  }
  onInheritSuccess = () => {
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    Taro.showLoading({title: global.LOADING_TEXT})
    new Request().get(api.API_PLAYER_VERIFY_INHERIT, {
      playerId: this.playerId,
      userNo: userNo
    }).then((data: any) => {
      if (data) {
        Taro.hideLoading();
        Taro.showToast({title: "绑定成功", icon: "success"});
        setTimeout(() => {
          this.initPlayerVerifyInfo(this.playerId, userNo);
        }, 2000);
      } else {
        Taro.showToast({title: "绑定失败，请返回重试", icon: "none"});
      }
    })
  }
  onInheritCancel = () => {
    Taro.navigateBack({
      delta: 1
    });
  }
  getLeaguePlayerCashTotal = (data) => {
    if (data.isSettled) {
      return getYuan(data.cashSettlement);
    } else if (data.cashPercent) {
      return `预计：${getYuan(data.cashPredict)}`;
    } else if (data.preCashAvailable) {
      return `预计：${getYuan(data.preCashPredict)}`;
    } else {
      return `预计：${getYuan(data.cashPredict)}`;
    }
  }
  getLeagueName = (data) => {
    if (data.league && data.league.shortName) {
      return data.league.shortName;
    } else {
      return data.league && data.league.name ? data.league.name : "联赛";
    }
  }
  onCashClick = (data) => {
    if (!data.isSettled && !data.preCashAvailable) {
      Taro.showToast({title: "请在球星夸夸榜结束结算后再操作", icon: "none"})
      return;
    }
    if ((data.isSettled && data.cashRemain <= 0) || (data.preCashAvailable && data.preCashRemain <= 0)) {
      Taro.showToast({title: "提现金额不足，无法继续提现", icon: "none"})
      return;
    }
    Taro.navigateTo({
      url: `/pages/cashOut/cashOut?leagueId=${data.leagueId}&playerId=${data.playerId}`,
    })
  }
  onCashRecordClick = () => {
    if (this.playerId == null) {
      Taro.navigateTo({
        url: `/pages/cashOutRecord/cashOutRecord`,
      })
    } else {
      Taro.navigateTo({
        url: `/pages/cashOutRecord/cashOutRecord?playerId=${this.playerId}`,
      })
    }
  }
  isCashEnabled = (data) => {
    if (data.isSettled) {
      if (data.cashRemain <= 0) {
        return false;
      }
      return true;
    } else if (data.preCashAvailable) {
      if (data.preCashRemain <= 0) {
        return false;
      }
      return true;
    }
    return false;
  }

  render() {
    const getLeaguePlayerCashTotal = this.getLeaguePlayerCashTotal;
    const getLeagueName = this.getLeagueName;
    const onCashClick = this.onCashClick;
    const onCashHintClick = this.onCashHintClick;
    const onCashExpireHintClick = this.onCashExpireHintClick;

    if (this.state.loading) {
      return <View className="qz-player-verify-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-player-verify'>
        <NavBar
          background="#3bb36b"
          title=''
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-player-verify__player'>
          <View className='qz-player-verify__player-avatar-container'>
            <Image className='qz-player-verify__player-avatar'
                   src={this.state.currentPlayer && this.state.currentPlayer.headImg ? this.state.currentPlayer.headImg : noperson}/>
          </View>
          <Text className='qz-player-verify__player-name'>
            {this.state.currentPlayer && this.state.currentPlayer.name ? this.state.currentPlayer.name : "球员"}
          </Text>
        </View>
        <View className='qz-player-verify__info'>
          <View className='item_view'>
            <View className='item'>
              <View className='title_number'>{getYuan(this.state.cashRemain)}</View>
              <View className='desc'>可提现</View>
            </View>
            <View className='line'/>
            <View className='item'>
              <View className='title_number'>{getYuan(this.state.cashTotal)}</View>
              <View className='desc'>总收入</View>
            </View>
          </View>
        </View>
        {this.state.cashLoading ? <View>
          <View className="qz-player-verify-loading">
            <AtActivityIndicator
              mode="center"
              content="加载中..."/>
          </View>
        </View> : null}
        <View className='qz-player-verify__leagues'>
          {this.state.leaguePlayerCashList ? this.state.leaguePlayerCashList.map((data: any) => {
            return <View className='qz-player-verify__league'>
              <View className='qz-player-verify__league-info'>
                <View className='qz-player-verify__league-info__cash'>
                  <Text className="total">{getLeaguePlayerCashTotal(data)} 元</Text>
                </View>
                <View className='qz-player-verify__league-info__name'>
                  <Image className="headImg" src={data.league && data.league.headImg ? data.league.headImg : logo}/>
                  <Text className="name">{getLeagueName(data)}</Text>
                  <Text className="status">{data.isSettled ? "已结束" : "进行中"}</Text>
                </View>
                <View className='qz-player-verify__league-info__rate-container'>
                  <View>
                    {data.cashPercent ? <View className='qz-player-verify__league-info__rate'>
                      <Text>目前提现比例：</Text>
                      <Text className="rate">{data.cashPercent != null ? data.cashPercent : 0}% </Text>
                    </View> : null}
                    {data.preCashPercent ? <View className='qz-player-verify__league-info__rate'>
                      <Text>暂可提现比例：</Text>
                      <Text className="rate">{data.preCashPercent != null ? data.preCashPercent : 0}% </Text>
                    </View> : null}
                    {!data.cashPercent && !data.preCashPercent ? <View className='qz-player-verify__league-info__rate'>
                      <Text>暂不可提现</Text>
                    </View> : null}
                  </View>
                  <Text onClick={onCashHintClick.bind(this, data.preCashPercent)}
                        className="at-icon at-icon-alert-circle icon"/>
                </View>
              </View>
              <View className='qz-player-verify__league-operation'>
                {data.available ?
                  <View className='qz-player-verify__league-operation__item'>
                    <Button
                      className={`qz-player-verify__league-operation__button ${this.isCashEnabled(data) ? "" : "qz-player-verify__league-operation__button--disable"}`}
                      onClick={onCashClick.bind(this, data)}>
                      去提现
                    </Button>
                    {data.isSettled ? <View>
                      <View className='qz-player-verify__league-operation__cash'>
                        <Text className="text">可提现：</Text>
                        <Text className="cash">{getYuan(data.cashRemain)}元</Text>
                      </View>
                      <View className='qz-player-verify__league-operation__cash'>
                        <Text className="text">已提现：</Text>
                        <Text className="cash">{getYuan(data.cashed)}元</Text>
                      </View>
                    </View> : (data.preCashAvailable ?
                      <View>
                        <View className='qz-player-verify__league-operation__cash'>
                          <Text className="text">可提现：</Text>
                          <Text className="cash">{getYuan(data.preCashRemain)}元</Text>
                        </View>
                        <View className='qz-player-verify__league-operation__cash'>
                          <Text className="text">已提现：</Text>
                          <Text className="cash">{getYuan(data.cashed)}元</Text>
                        </View>
                      </View> : <View className='qz-player-verify__league-operation__cash'>
                        <Text className="text">未结算</Text>
                      </View>)}
                  </View>
                  :
                  <View className='qz-player-verify__league-operation__item'>
                    <View
                      className='qz-player-verify__league-operation__cash qz-player-verify__league-operation__cash-flex'
                      onClick={onCashExpireHintClick.bind(this, data)}>
                      <Text className="text-big">已失效</Text>
                      <Text className="at-icon at-icon-alert-circle icon text-big"/>
                    </View>
                    {data.expireTime ? <View className='qz-player-verify__league-operation__cash'>
                      <Text className="expire">{formatTime(new Date(data.expireTime))}</Text>
                    </View> : null}
                  </View>
                }
              </View>
            </View>
          }) : null}
        </View>
        <View className='qz-player-verify__buttons'>
          {/*<Button>提现</Button>*/}
          <Button onClick={this.onCashRecordClick}>提现记录</Button>
        </View>
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}/>
        <ModalPlayerVerifyConfirm
          isOpened={this.state.confirmOpen}
          handleConfirm={this.onConfirmSuccess}
          handleCancel={this.onConfirmCancel}
          currentPlayer={this.state.currentPlayer}/>
        <ModalPlayerVerifyInherit
          isOpened={this.state.inheritOpen}
          handleConfirm={this.onInheritSuccess}
          handleCancel={this.onInheritCancel}
          currentPlayer={this.state.currentPlayer}/>
        <ModalPlayerVerifyHint
          isOpened={this.state.hintOpen}
          hint={this.state.hint}
          handleCancel={this.onHintCancel}/>
        <ModalHintCashTotal
          isOpened={this.state.cashHintOpen}
          percent={this.state.currentPercent}
          handleCancel={this.onCashHintCancel}/>
        <ModalCashExpireHint
          isOpened={this.state.cashExpireOpen}
          dateString={this.state.expireDateString}
          handleCancel={this.onCashExpireCancel}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(PersonVerify)
