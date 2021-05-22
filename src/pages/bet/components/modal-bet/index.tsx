import "taro-ui/dist/style/components/article.scss";
import Taro from '@tarojs/taro'
import {Component} from 'react'
import {AtModal, AtModalHeader, AtModalContent, AtModalAction, AtDivider} from "taro-ui"
import {connect} from 'react-redux'
import {View, Button} from '@tarojs/components'
import Request from '../../../../utils/request'
import PayModal from '../../../../components/modal-pay'
import {toLogin, getYuan} from '../../../../utils/utils'
import * as api from '../../../../constants/api'
import * as error from '../../../../constants/error'
import './index.scss'
import * as global from "../../../../constants/global";

const BET_TYPE = {
  FREE: 0,
  CHARGE: 1
}
const STATUS = {
  unknow: -1,
  unopen: 0,
  open: 1,
  finish: 2,
}
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
  payEnabled: any;
  deposit: number;
}

type PageDispatchProps = {
  handleConfirm: (data?: any) => any,
  handleCancel: () => any,
  handleError: (event?: any) => any
}

type PageOwnProps = {
  isOpened: boolean,
  betInfo: any,
  match: any,
  matchId: any
  score: string,
  betStatus: string,
}

type PageState = {
  isPaying: boolean;
  isPayOpen: boolean;
  currentBet: any;
  freeBetLoading: boolean;
  freeBetTimes: number;
  isSubscribe: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalBet {
  props: IProps | any;
}

class ModalBet extends Component<IProps, PageState> {

  constructor(props) {
    super(props)
    this.state = {
      isPaying: false,
      isPayOpen: false,
      currentBet: {},
      freeBetLoading: false,
      freeBetTimes: 0,
      isSubscribe: false,
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillUpdate(newProps) {
    if (this.props.isOpened == false && newProps.isOpened == true) {
      this.refresh();
    }
  }

  refresh = () => {
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
    const {betInfo} = this.props;
    if (betInfo && betInfo.gradeInfo) {
      this.setState({currentBet: betInfo.gradeInfo[0]});
    }
    this.getFreeBetTime(userNo);
  }
  getFreeBetTime = (userNo) => {
    this.setState({freeBetLoading: true});
    new Request().get(api.API_BET_FREE, {userNo: userNo}).then((freeBet: any) => {
      if (freeBet) {
        this.setState({freeBetTimes: freeBet.freeTime, freeBetLoading: false})
      }
    })
  }
  handleWechatConfirm = async () => {
    const {betInfo = {}, match} = this.props;
    if (betInfo.available != true || this.props.betStatus != STATUS.open) {
      Taro.showToast({
        'title': "不在竞猜时间段内",
        'icon': 'none',
      })
      return;
    }
    if (match.status > global.FootballEventType.UNOPEN) {
      Taro.showToast({
        'title': "不在竞猜时间段内",
        'icon': 'none',
      })
      return;
    }
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
    this.sendChargeBetOrder();
  }
  handleDepositConfirm = () => {
    const {betInfo = {}, match} = this.props;
    if (betInfo.available != true || this.props.betStatus != STATUS.open) {
      Taro.showToast({
        'title': "不在竞猜时间段内",
        'icon': 'none',
      })
      return;
    }
    if (match.status > global.FootballEventType.UNOPEN) {
      Taro.showToast({
        'title': "不在竞猜时间段内",
        'icon': 'none',
      })
      return;
    }
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
    this.sendDepositBetOrder();
  }
  sendChargeBetOrder = () => {
    const {handleConfirm, handleError} = this.props;
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
      type: global.ORDER_TYPE.bet,
      description: `茄子TV-竞猜-${this.props.matchId}-${this.state.currentBet.grade}-${this.props.score}`,
      attach: JSON.stringify({
        matchId: this.props.matchId,
        grade: this.state.currentBet.grade,
        score: this.props.score,
        isSubscribe: this.state.isSubscribe,
      })
    }).then((unifiedResult: UnifiedJSAPIOrderResult) => {
      this.setState({isPaying: false, isPayOpen: false})
      if (unifiedResult) {
        Taro.hideLoading();
        Taro.requestPayment(
          {
            timeStamp: unifiedResult.timeStamp,
            nonceStr: unifiedResult.nonceStr,
            package: unifiedResult.packageValue,
            signType: unifiedResult.signType,
            paySign: unifiedResult.paySign,
            success: function (res) {
              if (res.errMsg == "requestPayment:ok") {
                handleConfirm(unifiedResult.orderId);
              }
            },
            fail: function (res) {
              if (res.errMsg == "requestPayment:fail cancel") {
                handleError(error.ERROR_PAY_CANCEL);
              } else {
                handleError(error.ERROR_PAY_ERROR);
              }
            },
          })
      } else {
        Taro.hideLoading();
        handleError(error.ERROR_PAY_ERROR);
      }
    }).catch(reason => {
      this.setState({isPaying: false, isPayOpen: false})
      Taro.hideLoading();
      console.log(reason);
      handleError(error.ERROR_PAY_ERROR);
    })
  }
  sendDepositBetOrder = () => {
    const {handleConfirm, handleError} = this.props;
    const openId = this.props.userInfo ? this.props.userInfo.wechatOpenid : null
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    this.setState({isPaying: true})
    new Request().post(api.API_DEPOSIT, {
      openId: openId,
      userNo: userNo,
      type: global.ORDER_TYPE.bet,
      description: `茄子TV-竞猜-${this.props.matchId}-${this.state.currentBet.grade}-${this.props.score}`,
      attach: JSON.stringify({
        matchId: this.props.matchId,
        grade: this.state.currentBet.grade,
        score: this.props.score,
        isSubscribe: this.state.isSubscribe,
      })
    }).then((orderResult: any) => {
      this.setState({isPaying: false, isPayOpen: false})
      Taro.hideLoading();
      if (orderResult) {
        handleConfirm(orderResult.orderId);
      } else {
        handleError(error.ERROR_PAY_ERROR);
      }
    }).catch(reason => {
      this.setState({isPaying: false, isPayOpen: false})
      Taro.hideLoading();
      console.log(reason);
      handleError(error.ERROR_PAY_ERROR);
    });
  }
  sendFreeBetOrder = () => {
    const {handleConfirm, handleError} = this.props;
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    if (this.state.freeBetTimes == null || this.state.currentBet.freeTime == null || this.state.freeBetTimes < this.state.currentBet.freeTime) {
      Taro.showToast({
        'title': "免费竞猜次数不足，赠送礼物可获得免费竞猜次数",
        'icon': 'none',
      })
      return;
    }
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    this.setState({isPaying: true})
    new Request().post(api.API_BET_FREE, {
      userNo: userNo,
      matchId: this.props.matchId,
      grade: this.state.currentBet.grade,
      score: this.props.score,
      isSubscribe: this.state.isSubscribe,
    }).then((freeBet: any) => {
      this.setState({isPaying: false, isPayOpen: false})
      Taro.hideLoading();
      if (freeBet) {
        handleConfirm();
      } else {
        handleError(error.ERROR_PAY_ERROR);
      }
    }).catch(reason => {
      this.setState({isPaying: false, isPayOpen: false})
      Taro.hideLoading();
      console.log(reason);
      handleError(error.ERROR_PAY_ERROR);
    })
  }
  handleBetItemClick = (data) => {
    this.setState({currentBet: data});
  }
  handleConfirm = (type) => {
    let tmplIds: any = [];
    tmplIds.push(global.SUBSCRIBE_TEMPLATES.BET_SUCCESS);
    Taro.requestSubscribeMessage({tmplIds: tmplIds}).then((res: any) => {
      if (res.errMsg == "requestSubscribeMessage:ok") {
        this.setState({isSubscribe: true}, () => {
          this.sendBetOrder(type);
        });
      } else {
        this.setState({isSubscribe: false}, () => {
          this.sendBetOrder(type);
        });
      }
    }).catch(() => {
      this.setState({isSubscribe: false}, () => {
        this.sendBetOrder(type);
      });
    })
  }
  sendBetOrder = (type) => {
    const {betInfo = {}, match} = this.props;
    if (betInfo.available != true || this.props.betStatus != STATUS.open) {
      Taro.showToast({
        'title': "不在竞猜时间段内",
        'icon': 'none',
      })
      return;
    }
    if (match.status > global.FootballEventType.UNOPEN) {
      Taro.showToast({
        'title': "不在竞猜时间段内",
        'icon': 'none',
      })
      return;
    }
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
    if (type == BET_TYPE.FREE) {
      this.sendFreeBetOrder()
    } else if (type == BET_TYPE.CHARGE) {
      if (this.props.deposit == null || this.props.deposit == 0) {
        this.handleWechatConfirm();
        return;
      }
      this.setState({isPayOpen: true})
    }
  }
  getScore = (score) => {
    let scoreString = score;
    if (score == "win") {
      scoreString = "主胜其他"
    } else if (score == "draw") {
      scoreString = "平其他"
    } else if (score == "lost") {
      scoreString = "客胜其他"
    }
    return scoreString;
  }
  handlePayCancel = () => {
    this.setState({isPayOpen: false})
  }

  render() {
    const {isOpened = false, handleCancel, betInfo = {}, score} = this.props;
    const {currentBet, freeBetTimes} = this.state;
    return (
      <View>
        <AtModal isOpened={isOpened} onClose={handleCancel}>
          <AtModalHeader>选择竞猜档次</AtModalHeader>
          {isOpened ? <AtModalContent>
            <View className="qz-bet-modal__grid">
              {betInfo && betInfo.gradeInfo && betInfo.gradeInfo.map((data: any) =>
                <View
                  className={`qz-bet-modal__grid-item ${data.grade == currentBet.grade ? "qz-bet-modal__grid-item-active" : ""}`}
                  key={data.grade}
                  onClick={this.handleBetItemClick.bind(this, data)}>
                  <View className="qz-bet-modal__grid-item-text">{getYuan(data.price)}茄币</View>
                </View>
              )}
            </View>
            <AtDivider height={48} lineColor="#E5E5E5"/>
            {currentBet && <View className="qz-bet-modal__grid-content">
              <View className="qz-bet-modal__grid-content-score">• 竞猜比分：{this.getScore(score)}</View>
              <View className="qz-bet-modal__grid-content-price">•
                免费竞猜次数剩余：{freeBetTimes != null ? freeBetTimes : 0}</View>
              <View
                className="qz-bet-modal__grid-content-price">{`• 价格：${getYuan(currentBet.price)}茄币 或 免费竞猜次数${currentBet.freeTime}次`}</View>
              {currentBet.award ?
                <View className="qz-bet-modal__grid-content-award">• 奖品：{currentBet.award}</View> : null}
              {currentBet.awardDeposit ?
                <View className="qz-bet-modal__grid-content-award">•
                  奖品：{getYuan(currentBet.awardDeposit)}茄币</View> : null}
            </View>}
          </AtModalContent> : null}
          <AtModalAction>
            <Button className="mini-gray" onClick={this.handleConfirm.bind(this, BET_TYPE.FREE)}>免费竞猜</Button>
            <Button className="black" onClick={this.handleConfirm.bind(this, BET_TYPE.CHARGE)}>支付</Button>
          </AtModalAction>
        </AtModal>
        <PayModal
          isOpened={this.state.isPayOpen}
          price={this.state.currentBet.price}
          onCancel={this.handlePayCancel}
          onWechatPay={this.handleWechatConfirm}
          onDepositPay={this.handleDepositConfirm}
        />
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
export default connect(mapStateToProps)(ModalBet)
