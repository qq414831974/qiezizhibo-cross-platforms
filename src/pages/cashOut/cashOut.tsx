import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image, Input, Button} from '@tarojs/components'
import {AtActivityIndicator, AtIcon} from "taro-ui"
import {connect} from 'react-redux'

import './cashOut.scss'
import {checkNumber, clearLoginToken, getStorage, getYuan, hasLogin} from "../../utils/utils";
import NavBar from "../../components/nav-bar";
import * as error from "../../constants/error";
import userAction from "../../actions/user";
import LoginModal from "../../components/modal-login";
import noperson from "../../assets/no-person.png";
import Request from "../../utils/request";
import * as api from "../../constants/api";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  loginOpen: boolean;
  cashInfo: any;
  check: boolean;
  sumbiting: boolean;
  cashOut: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface CashOut {
  props: IProps;
}

class CashOut extends Component<IProps, PageState> {
  navRef: any = null;
  leagueId = null;
  playerId = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      loginOpen: false,
      cashInfo: null,
      check: true,
      sumbiting: false,
      cashOut: null,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.leagueId = this.getParam("leagueId");
    this.playerId = this.getParam("playerId");
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    this.initCashInfo(userNo, this.leagueId, this.playerId)
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    this.leagueId = this.getParam("leagueId");
    this.playerId = this.getParam("playerId");
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
  initCashInfo = (userNo, leagueId, playerId) => {
    this.setState({loading: true, cashOut: null})
    new Request().get(api.API_CASH_USER_INFO, {
      leagueId: leagueId,
      playerId: playerId,
      userNo: userNo
    }).then((data: any) => {
      if (data != null) {
        this.setState({cashInfo: data, loading: false})
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
      this.initCashInfo(userInfo.payload.userNo, this.leagueId, this.playerId)
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
  onCheckBoxClick = () => {
    this.setState({check: !this.state.check})
  }
  onCashOutInput = (e) => {
    let value = e.detail.value
    value = value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
    value = value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
    value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
    if (value.indexOf(".") < 0 && value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
      value = parseFloat(value);
    }
    if (!value || value == '0' || value == '0.0' || value == '0.00') {
      this.setState({cashOut: null})
      return;
    }
    this.setState({cashOut: value})
  }
  onCashOutClick = () => {
    if (this.state.sumbiting || this.state.loading) {
      return;
    }
    if (!checkNumber(this.state.cashOut)) {
      Taro.showToast({title: "输入有误，请重新输入", icon: "none"});
      return;
    }
    const cashOut = this.state.cashOut * 100;
    if (cashOut < 50) {
      Taro.showToast({title: "金额小于单次最低可提现金额，请重新输入", icon: "none"});
      return;
    }
    if (cashOut > this.state.cashInfo.cashTodayRemain || cashOut > this.getCashRemain(this.state.cashInfo)) {
      Taro.showToast({title: "金额大于可提现金额，请重新输入", icon: "none"});
      return;
    }
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    this.setState({sumbiting: true})
    new Request().post(api.API_CASH_REQUEST, {
      leagueId: this.leagueId,
      playerId: this.playerId,
      userNo: userNo,
      cahOut: cashOut,
      isPreCash: this.state.cashInfo.preCashRemain != null
    }).then((data: any) => {
      if (data != null && data) {
        Taro.showToast({title: "提现申请已提交，将于72小时内到账至微信钱包", icon: "none", duration: 5000});
      } else {
        Taro.showToast({title: "提现失败，请重试，或联系客服", icon: "none"});
      }
      this.setState({sumbiting: false})
      this.initCashInfo(userNo, this.leagueId, this.playerId)
    }).catch((err) => {
      Taro.showToast({title: err && err.data && err.data.message ? err.data.message : "提现失败，请重试，或联系客服", icon: "none"});
      this.setState({sumbiting: false})
      this.initCashInfo(userNo, this.leagueId, this.playerId)
    })
  }
  getCashRemain = (data) => {
    if (data.cashRemain != null) {
      return data.cashRemain
    } else if (data.preCashRemain != null) {
      return data.preCashRemain
    }
    return 0;
  }

  render() {
    const user = this.props.userInfo;
    if (this.state.loading) {
      return <View className="qz-cashout-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-cashout-content'>
        <NavBar
          background="#3bb36b"
          title='提现'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-cashout__user'>
          <View className='qz-cashout__user-avatar-container'>
            <Image className='qz-cashout__user-avatar'
                   src={user && user.avatar ? user.avatar : noperson}/>
          </View>
          <Text className='qz-cashout__user-name'>
            {user && user.name ? user.name : "匿名"}
          </Text>
        </View>
        <View className='qz-cashout__cash'>
          <View className='qz-cashout__cash-form'>
            <View className='text'>
              <Text>提现金额</Text>
            </View>
            <View className='input'>
              <Input
                onInput={this.onCashOutInput}
                value={this.state.cashOut}
                type="number"
                placeholder='请输入金额'
                placeholderClass='input-placeholder'/>
            </View>
            <View className='hint'>
              <Text>提现余额：</Text>
              <Text className="hint-highlight">
                {this.state.cashInfo ? getYuan(this.getCashRemain(this.state.cashInfo)) : 0}元
              </Text>
            </View>
            {this.state.cashInfo && (this.getCashRemain(this.state.cashInfo) > this.state.cashInfo.cashTodayRemain) ?
              <View className='hint'>
                <Text>今日还可提现：</Text>
                <Text className="hint-highlight">
                  {this.state.cashInfo ? getYuan(this.state.cashInfo.cashTodayRemain) : 0}元
                </Text>
              </View> : null}
          </View>
          <View className='qz-cashout__cash-hint'>
            <View className='qz-cashout__cash-hint-title'>
              提现说明：
            </View>
            <View className='qz-cashout__cash-hint-item'>
              · 提现0手续费
            </View>
            <View className='qz-cashout__cash-hint-item'>
              · 每天最高可提现200元
            </View>
            <View className='qz-cashout__cash-hint-item'>
              · 单次最低提现0.5元，低于0.5元的不予提现
            </View>
            <View className='qz-cashout__cash-hint-item'>
              · 72小时内到账至微信零钱
            </View>
          </View>
        </View>
        <View className='qz-cashout__bottom'>
          <View className='qz-cashout__bottom-checkbox-container' onClick={this.onCheckBoxClick}>
            <View
              className={`${this.state.check ? "qz-cashout__bottom-checkbox" : "qz-cashout__bottom-checkbox-disabled"}`}>
              {this.state.check ? <AtIcon value='check' size='10' color='#ffffff'/> : null}
            </View>
            <View className='qz-cashout__bottom-checkbox-text'>
              我已同意并阅读
            </View>
            <View className='qz-cashout__bottom-checkbox-text'>
              提现说明
            </View>
          </View>
          <Button
            className='qz-cashout__bottom-button'
            loading={this.state.sumbiting}
            disabled={this.state.sumbiting}
            onClick={this.onCashOutClick}>
            提现
          </Button>
        </View>
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(CashOut)
