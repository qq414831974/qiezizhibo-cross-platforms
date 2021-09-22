import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image} from '@tarojs/components'
import {AtActivityIndicator, AtList, AtListItem} from "taro-ui"
import {connect} from 'react-redux'

import './cashOutRecord.scss'
import {clearLoginToken, getStorage, getYuan, hasLogin} from "../../utils/utils";
import NavBar from "../../components/nav-bar";
import * as error from "../../constants/error";
import userAction from "../../actions/user";
import LoginModal from "../../components/modal-login";
import noperson from "../../assets/no-person.png";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import * as global from "../../constants/global";
import inPic from "../../assets/in.png";
import outPic from "../../assets/out.png";
import checkedPic from "../../assets/checked.png";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  loginOpen: boolean;
  cahOutRecord: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface CashOutRecord {
  props: IProps;
}

class CashOutRecord extends Component<IProps, PageState> {
  navRef: any = null;
  leagueId = null;
  playerId = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      loginOpen: false,
      cahOutRecord: null,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.playerId = this.getParam("playerId");
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    this.initCashInfo(userNo, this.playerId)
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
  initCashInfo = (userNo, playerId) => {
    this.setState({loading: true})
    new Request().get(api.API_CASH_RECORD, {
      playerId: playerId,
      userNo: userNo
    }).then((data: any) => {
      if (data != null) {
        this.setState({cahOutRecord: data, loading: false})
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
      this.initCashInfo(userInfo.payload.userNo, this.playerId)
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
  getRecordStatusPic = (type) => {
    switch (type) {
      case global.CASH_OUT_VERIFY_STATUS.VERIFY_FAILED:
        return inPic;
      case global.CASH_OUT_VERIFY_STATUS.VERIFY_SUCCESS:
        return checkedPic;
      case global.CASH_OUT_VERIFY_STATUS.NOT_VERIFY:
        return outPic;
    }
    return outPic;
  }
  getRecordInOut = (type) => {
    switch (type) {
      case global.CASH_OUT_VERIFY_STATUS.VERIFY_FAILED:
        return "+";
      case global.CASH_OUT_VERIFY_STATUS.VERIFY_SUCCESS:
        return "-";
      case global.CASH_OUT_VERIFY_STATUS.NOT_VERIFY:
        return "-";
    }
    return "-";
  }
  getRecordStatusString = (record) => {
    const type = record.cashOutVerifyStatus;
    switch (type) {
      case global.CASH_OUT_VERIFY_STATUS.VERIFY_FAILED:
        return "提现失败，已退回余额";
      case global.CASH_OUT_VERIFY_STATUS.VERIFY_SUCCESS:
        return record.cashOutOrderId ? `订单号：${record.cashOutOrderId}` : "提现成功";
      case global.CASH_OUT_VERIFY_STATUS.NOT_VERIFY:
        return "提现中";
    }
    return "提现中";
  }
  getRecordLeague = (league) => {
    let name = "联赛";
    if (league && league.shortName) {
      name = league.shortName
    } else if (league && league.name) {
      name = league.name
    }
    return name;
  }
  onRecordClick = (cashOutOrderId) => {
    if (cashOutOrderId != null) {
      Taro.setClipboardData({
        data: cashOutOrderId,
        success: () => {
          Taro.showToast({title: "复制订单号成功", icon: "none"});
        }
      })
    }
  }

  render() {
    const user = this.props.userInfo;
    if (this.state.loading) {
      return <View className="qz-cashout-record-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-cashout-record-content'>
        <NavBar
          background="#3bb36b"
          title='提现记录'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-cashout-record__user'>
          <View className='qz-cashout-record__user-avatar-container'>
            <Image className='qz-cashout-record__user-avatar'
                   src={user && user.avatar ? user.avatar : noperson}/>
          </View>
          <Text className='qz-cashout-record__user-name'>
            {user && user.name ? user.name : "匿名"}
          </Text>
        </View>
        <View className='qz-cashout-record__cash'>
          <AtList>
            {this.state.cahOutRecord && this.state.cahOutRecord.map((record => {
              return <AtListItem
                onClick={this.onRecordClick.bind(this, record.cashOutOrderId)}
                key={`key-${record.id}`}
                title={this.getRecordLeague(record.league)}
                note={this.getRecordStatusString(record)}
                thumb={this.getRecordStatusPic(record.cashOutVerifyStatus)}
                extraText={`${this.getRecordInOut(record.cashOutVerifyStatus)}${getYuan(record.cashOut)}`}
              />
            }))}
          </AtList>
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
export default connect(mapStateToProps)(CashOutRecord)
