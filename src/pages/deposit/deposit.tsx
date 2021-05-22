import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtList, AtListItem, AtLoadMore, AtButton} from "taro-ui"

import {connect} from 'react-redux'

import './deposit.scss'
import inPic from "../../assets/in.png";
import outPic from "../../assets/out.png";
import * as global from "../../constants/global";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import {getStorage, getYuan, toLogin} from "../../utils/utils";
import * as error from "../../constants/error";
import DepositModal from "./components/modal-deposit";
import NavBar from "../../components/nav-bar";

type UnifiedJSAPIOrderResult = {
  appId: string,
  timeStamp: string,
  nonceStr: string,
  packageValue: string,
  signType: keyof SignType,
  paySign: string,
  orderId: string,
}

interface SignType {
  /** MD5 */
  MD5
  /** HMAC-SHA256 */
  'HMAC-SHA256'
}

type PageStateProps = {
  userInfo: any;
  payEnabled: boolean;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  listLoading: boolean;
  total: any;
  current: any;
  deopsitLogs: Array<any>;
  deposit: any;
  isPayOpen: boolean;
  isPaying: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Deposit {
  props: IProps;
}

class Deposit extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      listLoading: false,
      total: 0,
      current: 0,
      deopsitLogs: [],
      deposit: null,
      isPayOpen: false,
      isPaying: false,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  fetch = () => {
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
    this.getLogList(userNo);
    this.getDeposit(userNo);
  }
  refresh = () => {
    this.fetch();
  }
  getDepositLogPic = (type) => {
    switch (type) {
      case global.DEPOSIT_LOG_TYPE.BET_AWARD:
        return inPic;
      case global.DEPOSIT_LOG_TYPE.CHARGE:
        return inPic;
      case global.DEPOSIT_LOG_TYPE.REFUND:
        return inPic;
      case global.DEPOSIT_LOG_TYPE.PAY:
        return outPic;
    }
    return outPic;
  }
  getDepositLogText = (type) => {
    let text = "支付";
    switch (type) {
      case global.DEPOSIT_LOG_TYPE.BET_AWARD:
        text = "竞猜奖励";
        break;
      case global.DEPOSIT_LOG_TYPE.CHARGE:
        text = "充值";
        break;
      case global.DEPOSIT_LOG_TYPE.REFUND:
        text = "退款";
        break;
      case global.DEPOSIT_LOG_TYPE.PAY:
        text = "支付";
        break;
    }
    return text;
  }
  getDeposit = (userNo) => {
    this.setState({loading: true});
    new Request().get(api.API_DEPOSIT, {userNo: userNo}).then((deposit: any) => {
      if (deposit) {
        this.setState({deposit: deposit.deposit, loading: false})
      }
    })
  }
  getLogList = (userNo) => {
    this.setState({listLoading: true})
    new Request().get(api.API_DEPOSIT_LOGS, {
      pageSize: 10,
      pageNum: 1,
      userNo: userNo,
    }).then((res: any) => {
      if (res) {
        this.setState({deopsitLogs: res.records, listLoading: false, total: res.total, current: res.current});
      }
    })
  }
  nextPage = async () => {
    const userNo = await getStorage('userNo')
    this.setState({listLoading: true})
    new Request().get(api.API_DEPOSIT_LOGS, {
      pageSize: 5,
      pageNum: this.state.current + 1,
      userNo: userNo,
    }).then((res: any) => {
      if (res) {
        this.setState({
          deopsitLogs: this.state.deopsitLogs.concat(res.records),
          listLoading: false,
          total: res.total,
          current: res.current
        });
      }
    })
  }

  // 小程序上拉加载
  onReachBottom = () => {
    this.nextPage();
  }

  depositCharge = (price) => {
    if (price == null || !Number.isInteger(price)) {
      Taro.showToast({
        title: "请输入正确的数字",
        icon: 'none',
      });
      return;
    }
    const openId = this.props.userInfo ? this.props.userInfo.wechatOpenid : null
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    this.setState({isPaying: true})
    new Request().post(api.API_ORDER_CREATE, {
      openId: openId,
      userNo: userNo,
      type: global.ORDER_TYPE.deposit,
      description: `茄子TV-茄币-` + price * 100,
      attach: JSON.stringify({
        price: price * 100
      })
    }).then((unifiedResult: UnifiedJSAPIOrderResult) => {
      this.setState({isPaying: false, isPayOpen: false})
      if (unifiedResult) {
        Taro.requestPayment(
          {
            timeStamp: unifiedResult.timeStamp,
            nonceStr: unifiedResult.nonceStr,
            package: unifiedResult.packageValue,
            signType: unifiedResult.signType,
            paySign: unifiedResult.paySign,
            success: (res) => {
              if (res.errMsg == "requestPayment:ok") {
                this.onPaySuccess(unifiedResult.orderId);
              }
            },
            fail: (res) => {
              if (res.errMsg == "requestPayment:fail cancel") {
                this.onPayError(error.ERROR_PAY_CANCEL);
              } else {
                this.onPayError(error.ERROR_PAY_ERROR);
              }
            },
          })
        Taro.hideLoading();
      } else {
        this.onPayError(error.ERROR_PAY_ERROR);
        Taro.hideLoading();
      }
    }).catch(reason => {
      this.setState({isPaying: false, isPayOpen: false})
      console.log(reason);
      this.onPayError(error.ERROR_PAY_ERROR);
      Taro.hideLoading();
    })
  }
  onPayError = (reason) => {
    this.setState({isPayOpen: false})
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

  onPaySuccess = (orderId: string) => {
    this.setState({isPayOpen: false})
    this.getOrderStatus(orderId)
  }
  getOrderStatus = async (orderId: string) => {
    new Request().get(api.API_ORDER_QUERY, {orderId: orderId}).then((res) => {
      if (res == global.ORDER_STAUTS.paid) {
        Taro.showToast({
          title: "支付成功",
          icon: 'none',
        });
        this.refresh();
      }
    });
  }
  onDepositCancel = () => {
    this.setState({isPayOpen: false});
  }
  onDepositChargeClick = () => {
    this.setState({isPayOpen: true});
  }

  render() {
    const {loading = false, listLoading = false, deopsitLogs = [], total, deposit = 0} = this.state
    let loadingmoreStatus: any = "more";
    if (listLoading) {
      loadingmoreStatus = "loading";
    } else if (deopsitLogs == null || deopsitLogs.length <= 0 || total <= deopsitLogs.length) {
      loadingmoreStatus = "noMore"
    }
    return (
      <View className='qz-deposit-container'>
        <NavBar
          title='我的茄币'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-deposit-header'>
          <View className='qz-deposit-header__title'>
            {loading ? "-" : getYuan(deposit)}
          </View>
          <View className='qz-deposit-header__title-hint'>
            茄币
          </View>
          {this.props.payEnabled ?
            <AtButton
              className='qz-deposit-header__button'
              type="secondary"
              size="small"
              onClick={this.onDepositChargeClick}>
              充值
            </AtButton> : null}
        </View>
        <View className='qz-deposit-body'>
          <View className='qz-deposit-body-panel'>
            <View className='qz-deposit-body-panel__title'>
              明细
            </View>
          </View>
          <AtList>
            {deopsitLogs && deopsitLogs.map((depositLog => {
              return <AtListItem
                key={`key-${depositLog.id}`}
                title={this.getDepositLogText(depositLog.type)}
                note={depositLog.updateTime}
                thumb={this.getDepositLogPic(depositLog.type)}
                extraText={`${getYuan(depositLog.amount)}`}
              />
            }))}
          </AtList>
        </View>
        <AtLoadMore status={loadingmoreStatus} loadingText="加载中..." noMoreText="没有更多了" onClick={this.nextPage}/>
        <DepositModal
          isOpened={this.state.isPayOpen}
          handleConfirm={this.depositCharge}
          handleCancel={this.onDepositCancel}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    payEnabled: state.config ? state.config.payEnabled : null,
  }
}
export default connect(mapStateToProps)(Deposit)
