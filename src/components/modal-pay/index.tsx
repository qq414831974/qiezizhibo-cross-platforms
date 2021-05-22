import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtModal, AtModalContent, AtAvatar, AtDivider} from "taro-ui"
import { connect } from 'react-redux'

import './index.scss'
import {getYuan} from "../../utils/utils";
import wechat from "../../assets/wechat.png";
import eggplantcoin from "../../assets/eggplantcoin.png";
// import Request from "../../utils/request";
// import * as api from "../../constants/api";
import depositAction from "../../actions/deposit";


type PageStateProps = {
  payEnabled: boolean;
  userInfo: any;
  deposit: number;
}

type PageDispatchProps = {
  onWechatPay: () => any,
  onDepositPay: () => any,
  onCancel: () => any,
}

type PageOwnProps = {
  isOpened: boolean,
  price: number,
}

type PageState = {
  loading: boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalPay {
  props: IProps ;
}


class ModalPay extends Component<IProps , PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  componentDidShow() {
    this.getUserDeposit();
  }

  componentWillUpdate(newProps) {
    if (this.props.isOpened == false && newProps.isOpened == true) {
      this.getUserDeposit();
    }
  }

  getUserDeposit = () => {
    const openId = this.props.userInfo ? this.props.userInfo.wechatOpenid : null
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    if (userNo == null || openId == null) {
      // Taro.showToast({
      //   title: "登录失效，请重新登录",
      //   icon: 'none',
      //   complete: () => {
      //     toLogin();
      //   }
      // })
      return;
    }
    this.setState({loading: true});
    // new Request().get(api.API_DEPOSIT, {userNo: userNo}).then((deposit: any) => {
    //   if (deposit) {
    //     this.setState({deposit: deposit.deposit, loading: false})
    //   }
    // })
    depositAction.getDeposit(userNo).then(() => {
      this.setState({loading: false});
    });
  }

  onWechatPay = () => {
    this.props.onWechatPay && this.props.onWechatPay();
  }
  onDepositPay = () => {
    if (this.state.loading) {
      return;
    }
    if (!this.state.loading && (this.props.deposit == null || this.props.deposit == 0 || this.props.deposit < this.props.price)) {
      Taro.showToast({
        title: "茄币不足，请选择其他方式支付",
        icon: 'none',
      })
      return;
    }
    this.props.onDepositPay && this.props.onDepositPay();
  }

  render() {
    const {isOpened, onCancel, payEnabled} = this.props

    return (
      <View>
        <AtModal isOpened={isOpened} onClose={onCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-payment-modal">
              <View className="qz-payment-modal-title">
                请选择支付方式
              </View>
              <AtDivider height={48} lineColor="#E5E5E5B3"/>
              <View className="at-row">
                <View className="at-col at-col-6 center" onClick={this.onWechatPay}>
                  <View className="qz-payment-modal-choice-container">
                    <View className="qz-payment-modal-choice-img">
                      <AtAvatar
                        className="white"
                        size='large'
                        image={wechat}/>
                    </View>
                    <View className="qz-payment-modal-choice-text">
                      微信支付
                    </View>
                    {payEnabled ? null : <View className="qz-payment-modal-choice-hint">
                      暂无法使用
                    </View>}
                  </View>
                </View>
                <View className="at-col at-col-6 center" onClick={this.onDepositPay}>
                  <View className="qz-payment-modal-choice-container">
                    <View className="qz-payment-modal-choice-img">
                      <AtAvatar
                        className="white"
                        size='large'
                        image={eggplantcoin}/>
                    </View>
                    <View className="qz-payment-modal-choice-text">
                      茄币余额:{this.state.loading ? "获取中" : getYuan(this.props.deposit)}
                    </View>
                    {!this.state.loading && (this.props.deposit == 0 || this.props.deposit < this.props.price) ?
                      <View className="qz-payment-modal-choice-hint">
                        茄币不足
                      </View> : null}
                  </View>
                </View>
              </View>
            </View>
          </AtModalContent> : null}
        </AtModal>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    deposit: state.deposit.depositInfo ? state.deposit.depositInfo.deposit : 0,
    userInfo: state.user.userInfo,
    payEnabled: state.config ? state.config.payEnabled : null,
  }
}
export default connect(mapStateToProps)(ModalPay)
