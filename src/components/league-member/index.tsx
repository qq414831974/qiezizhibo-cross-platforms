import classNames from 'classnames'
import Taro, {Component} from '@tarojs/taro'
import {AtIcon} from "taro-ui"
import {View, Text, Image, Button} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import './index.scss'
import * as global from "../../constants/global";
import {getStorage, getYuan, toLogin} from "../../utils/utils";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import * as error from "../../constants/error";

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
  payEnabled: boolean;
  giftEnabled: boolean;
  userInfo: any;
  deposit: number;
}

type PageDispatchProps = {
  onClose?: any,
  onHandlePaySuccess?: (data?: any) => any,
  onHandlePayError?: (event?: any) => any,
  onPayConfirm?: any,
  onPayClose?: any,
}

type PageOwnProps = {
  isOpened: boolean,
  leagueMemberRule: boolean,
  league: any,
}

type PageState = {
  _isOpened: any;
  isPaying: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueMember {
  props: IProps | any;
}

class LeagueMember extends Component<PageOwnProps | any, PageState> {

  constructor(props) {
    super(props)
    this.state = {
      _isOpened: false,
      isPaying: false,
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps: any): void {
    const {isOpened} = nextProps
    if (isOpened !== this.state._isOpened) {
      this.setState({
        _isOpened: isOpened
      })
    }
  }

  handleClose = () => {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose()
    }
  }
  close = (): void => {
    this.setState(
      {
        _isOpened: false
      },
      this.handleClose
    )
  }
  handleTouchMove = (e): void => {
    e.stopPropagation()
  }
  onMemberSignUp = async () => {
    const openId = await getStorage('wechatOpenid')
    const userNo = await getStorage('userNo')
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
    if (this.props.leagueMemberRule == null || this.props.leagueMemberRule.available == null || !this.props.leagueMemberRule.available) {
      return;
    }
    if (this.props.deposit == null || this.props.deposit == 0) {
      this.signUp(global.PAY_TYPE.ONLINE);
      return;
    }
    this.props.onPayConfirm && this.props.onPayConfirm(this.signUp, this.props.leagueMemberRule.price)
  }

  signUpCharge = async () => {
    const openId = await getStorage('wechatOpenid')
    const userNo = await getStorage('userNo')
    const {onHandlePaySuccess, onHandlePayError} = this.props;
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    this.setState({isPaying: true})
    new Request().post(api.API_ORDER_CREATE, {
      openId: openId,
      userNo: userNo,
      type: global.ORDER_TYPE.leagueMember,
      description: `茄子TV-联赛会员-${this.props.league.id}`,
      attach: JSON.stringify({
        leagueId: this.props.league.id,
      })
    }).then((unifiedResult: UnifiedJSAPIOrderResult) => {
      this.setState({isPaying: false})
      this.props.onPayClose && this.props.onPayClose();
      if (unifiedResult) {
        Taro.hideLoading();
        Taro.requestPayment(
          {
            timeStamp: unifiedResult.timeStamp,
            nonceStr: unifiedResult.nonceStr,
            package: unifiedResult.packageValue,
            signType: unifiedResult.signType,
            paySign: unifiedResult.paySign,
            success: (res) => {
              if (res.errMsg == "requestPayment:ok") {
                onHandlePaySuccess(unifiedResult.orderId);
              }
            },
            fail: (res) => {
              if (res.errMsg == "requestPayment:fail cancel") {
                onHandlePayError(error.ERROR_PAY_CANCEL);
              } else {
                onHandlePayError(error.ERROR_PAY_ERROR);
              }
            },
          })
      } else {
        Taro.hideLoading();
        onHandlePayError(error.ERROR_PAY_ERROR);
      }
    }).catch(reason => {
      Taro.hideLoading();
      this.setState({isPaying: false})
      this.props.onPayClose && this.props.onPayClose();
      console.log(reason);
      onHandlePayError(error.ERROR_PAY_ERROR);
    })

  }
  signUpDeposit = async () => {
    const openId = await getStorage('wechatOpenid')
    const userNo = await getStorage('userNo')
    const {onHandlePaySuccess, onHandlePayError} = this.props;
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    new Request().post(api.API_DEPOSIT, {
      openId: openId,
      userNo: userNo,
      type: global.ORDER_TYPE.leagueMember,
      description: `茄子TV-联赛会员-${this.props.league.id}`,
      attach: JSON.stringify({
        leagueId: this.props.league.id,
      })
    }).then((orderResult: any) => {
      this.setState({isPaying: false})
      Taro.hideLoading();
      this.props.onPayClose && this.props.onPayClose();
      if (orderResult) {
        onHandlePaySuccess(orderResult.orderId);
      } else {
        onHandlePayError(error.ERROR_PAY_ERROR);
      }
    }).catch(reason => {
      this.setState({isPaying: false})
      Taro.hideLoading();
      this.props.onPayClose && this.props.onPayClose();
      console.log(reason);
      onHandlePayError(error.ERROR_PAY_ERROR);
    });
  }
  signUp = (type) => {
    if (type == global.PAY_TYPE.ONLINE) {
      this.signUpCharge();
    } else if (type == global.PAY_TYPE.DEPOSIT) {
      this.signUpDeposit();
    }
  }
  getLeagueName = (league) => {
    if (league && league.shortName) {
      return league.shortName
    } else if (league && league.name) {
      return league.shortName
    } else {
      return "联赛";
    }
  }

  render() {
    const {_isOpened} = this.state

    const rootClass = classNames(
      'qz-league-member',
      {
        'qz-league-member--active': _isOpened
      },
    )
    return (
      <View className={rootClass} onTouchMove={this.handleTouchMove}>
        <View onClick={this.close} className='qz-league-member__overlay'/>
        <View className='qz-league-member__container layout'>
          <View className='layout-header'>
            <View className='layout-header__btn-close' onClick={this.close}/>
            <View className="layout-header__title">
              <Image src="https://qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/images/202009/crown.png"/>
              <Text>联赛会员</Text>
            </View>
          </View>
          <View className='layout-body'>
            <View className="qz-league-member__league">
              <Image
                src={this.props.league && this.props.league.headImg ? this.props.league.headImg : "https://qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/images/202009/crown.png"}/>
              <Text>{this.getLeagueName(this.props.league)}</Text>
            </View>
            <View className="qz-league-member__card">
              <View className="qz-league-member__card-item qz-league-member__card-item-hover">
                <View>
                  <Text className="qz-league-member__card-item-price">
                    ¥{this.props.leagueMemberRule && this.props.leagueMemberRule.price ? getYuan(this.props.leagueMemberRule.price) : 999}
                  </Text>
                </View>
                <View><Text className="qz-league-member__card-item-time">永久</Text></View>
              </View>
            </View>
            <View className="qz-league-member__title">
              联赛会员特权
            </View>
            <View className="qz-league-member__desc">
              <AtIcon value='play' size='12' color='#7F7F7F'/>
              可永久免费观看此联赛的所有比赛录像
            </View>
            <Button className="qz-league-member__button" onClick={this.onMemberSignUp}>开通</Button>
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    deposit: state.deposit.depositInfo ? state.deposit.depositInfo.deposit : 0,
    userInfo: state.user.userInfo,
    payEnabled: state.config ? state.config.payEnabled : null,
    giftEnabled: state.config ? state.config.giftEnabled : null,
  }
}
export default connect(mapStateToProps)(LeagueMember)
