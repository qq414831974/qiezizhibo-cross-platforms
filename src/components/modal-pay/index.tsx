import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider, AtActionSheet, AtActionSheetItem} from "taro-ui"
import {View, Text, Button, Image} from '@tarojs/components'
import Request from '../../utils/request'
import {getJiao, getStorage, getYuan, toLogin} from '../../utils/utils'
import * as api from '../../constants/api'
import * as error from '../../constants/error'
import defaultLogo from '../../assets/default-logo.png'
import './index.scss'
import * as global from "../../constants/global";
import flame from "../../assets/live/left-support.png"


type MatchCharge = {
  price: number,
  secondPrice: number,
  productId: number,
  type: number,
  matchId: number,
  isMonopolyCharge: boolean,
  monopolyPrice: number,
  monopolyProductId: number,
  monopolyOnly: boolean,
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
  isOpened: boolean,
}

type PageDispatchProps = {
  handleConfirm: (data?: any) => any,
  handleCancel: () => any,
  handleClose: (event?: any) => any,
  handleError: (event?: any) => any
}

type PageOwnProps = {
  charge: MatchCharge | any,
  payEnabled: boolean,
  giftDiscount: boolean,
  giftDiscountPrice: number,
}

type PageState = {
  isChargeOpen: boolean,
  isMonopolyOpen: boolean,
  isPaying: boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalPay {
  props: IProps;
}

class ModalPay extends Component<PageOwnProps, PageState> {
  static defaultProps = {
    handleClose: () => {
    },
    handleCancel: () => {
    },
    handleConfirm: () => {
    },
    handleError: () => {
    },
  }
  handleConfirm = async ({isMonth, isMonopoly, anonymous}) => {
    const {handleConfirm, handleError, charge} = this.props;

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
    let desc;
    let products = [{productId: charge.productId, isSecond: isMonth}];
    let type = charge.type;
    let attach = JSON.stringify({matchId: charge.matchId, type: charge.type});
    if (charge.type == global.ORDER_TYPE.live) {
      desc = `茄子体育-直播-${charge.matchId}`;
    } else if (charge.type == global.ORDER_TYPE.record) {
      desc = `茄子体育-录播-${charge.matchId}`;
    }
    if (isMonopoly) {
      desc = `茄子体育-买断-${charge.matchId}`;
      products = [{productId: charge.monopolyProductId, isSecond: false}];
      type = global.ORDER_TYPE.monopoly;
      attach = JSON.stringify({
        matchId: charge.matchId,
        type: global.ORDER_TYPE.monopoly,
        anonymous: anonymous
      });
    }
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    this.setState({isMonopolyOpen: false, isChargeOpen: false, isPaying: true})
    new Request().post(api.API_ORDER_CREATE, {
      openId: openId,
      userNo: userNo,
      type: type,
      description: desc,
      products: products,
      attach: attach
    }).then((unifiedResult: UnifiedJSAPIOrderResult) => {
      this.setState({isPaying: false})
      if (unifiedResult) {
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
        Taro.hideLoading();
      } else {
        handleError(error.ERROR_PAY_ERROR);
        Taro.hideLoading();
      }
    }).catch(reason => {
      this.setState({isPaying: false})
      console.log(reason);
      handleError(error.ERROR_PAY_ERROR);
      Taro.hideLoading();
    })
  }
  handleChargeOpen = () => {
    this.setState({isChargeOpen: true})
  }
  handleChargeClose = () => {
    this.setState({isChargeOpen: false})
  }
  handleMonopolyOpen = () => {
    this.setState({isMonopolyOpen: true})
  }
  handleMonopolyClose = () => {
    this.setState({isMonopolyOpen: false})
  }
  getGiftDiscount = () => {
    const {charge, giftDiscountPrice} = this.props;
    if (charge == null) {
      return 10;
    }
    return Number((getJiao(giftDiscountPrice) / getJiao(charge.secondPrice)).toFixed(2)) * 10;
  }

  render() {
    const {isOpened = false, handleCancel, charge, payEnabled, giftDiscount} = this.props;
    const {isChargeOpen = false, isMonopolyOpen = false} = this.state;

    if (!payEnabled) {
      return (<AtModal isOpened={isOpened} onClose={handleCancel}>
        <AtModalContent>
          <View className="center">
            <AtAvatar circle image={defaultLogo}/>
          </View>
          <Text className="center gray qz-pay-modal-content_text">
            iOS端暂不提供观看
          </Text>
        </AtModalContent>
        <AtModalAction>
          <Button className="black" onClick={handleCancel}>取消</Button>
        </AtModalAction>
      </AtModal>)
    }
    return (
      <View>
        <AtModal isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-pay-modal-content_content">
              <View className="center">
                <AtAvatar circle image={defaultLogo}/>
              </View>
              <Text className="center gray qz-pay-modal-content_text">
                付费观看
              </Text>
              <AtDivider height={48} lineColor="#E5E5E5"/>
              {/*<View className="gray qz-pay-modal-content_tip">*/}
              {/*  • 本场比赛需要付费观看*/}
              {/*</View>*/}
              {charge && charge.monopolyOnly ? null : <View>
                <View className="gray qz-pay-modal-content_tip">
                  • 本场比赛限时观看一个月 价格{charge ? getYuan(charge.secondPrice) : 0}（元）
                </View>
                <View className="gray qz-pay-modal-content_tip">
                  • 本场比赛永久观看 价格{charge ? getYuan(charge.price) : 0}（元）
                </View>
              </View>}
              {charge && charge.isMonopolyCharge ? <View className="gray qz-pay-modal-content_tip">
                • 本场比赛请大家围观 价格{charge ? getYuan(charge.monopolyPrice) : 0}（元）
              </View> : null}
              {(charge && charge.monopolyOnly) || !giftDiscount ? null : <View>
                <View className="gray qz-pay-modal-content_tip-highlight">
                  • <View className="highlight">投票观看，{this.getGiftDiscount()}折优惠（推荐）</View>
                </View>
              </View>}
              {charge && charge.monopolyOnly ? null : <View className="light-gray qz-pay-modal-content_tip">
                • 购买永久后，本场比赛可无限次数观看
              </View>}
              {(charge && charge.isMonopolyCharge) && (!giftDiscount || charge.monopolyOnly) ?
                <View className="light-gray qz-pay-modal-content_tip">
                  • 购买<Text className="bold">“请大家围观”</Text>后，您的<Text className="bold">头像及昵称</Text>会在直播间<Text
                  className="bold">永久展示</Text>，且所有观众都可免费观看本场比赛，同时可联系客服获取录像下载地址。
                </View> : null}
              {charge && charge.isMonopolyCharge && !charge.monopolyOnly && giftDiscount ?
                <View className="light-gray qz-pay-modal-content_tip">
                  • 购买<Text className="bold">“请大家围观”</Text>后，可永久观看，联系客服可下载录像。
                </View> : null}
              {(charge && charge.monopolyOnly) || !giftDiscount ? null :
                <View className="light-gray bold qz-pay-modal-content_tip">
                  • 在本直播间内投票超过{getJiao(this.props.giftDiscountPrice)}茄币（{getYuan(this.props.giftDiscountPrice)}元）即可观看比赛录像
                </View>}
            </View>
          </AtModalContent> : null}
          {charge && charge.monopolyOnly && charge.isMonopolyCharge ? <AtModalAction>
              <Button className="black" onClick={this.handleMonopolyOpen}>请大家围观(本场)</Button>
            </AtModalAction>
            :
            (!giftDiscount ?
                (charge && charge.isMonopolyCharge ? <AtModalAction>
                    <Button className="black" onClick={this.handleChargeOpen}>购买(本场)</Button>
                    <Button className="black" onClick={this.handleMonopolyOpen}>请大家围观(本场)</Button>
                  </AtModalAction>
                  :
                  <AtModalAction>
                    <Button className="black" onClick={this.handleConfirm.bind(this, {
                      isMonth: true,
                      isMonopoly: false,
                      anonymous: false
                    })}>购买一个月(本场)</Button>
                    <Button className="black" onClick={this.handleConfirm.bind(this, {
                      isMonth: false,
                      isMonopoly: false,
                      anonymous: false
                    })}>购买永久(本场)</Button>
                  </AtModalAction>)
                :
                (<AtModalAction>
                  <Button className="black" onClick={this.handleChargeOpen}>购买(本场)</Button>
                  <Button className="black qz-pay-modal-support" onClick={handleCancel}>
                    <Image className="qz-pay-modal-support-image" src={flame}/>
                    <View className="qz-pay-modal-support-text">去投票</View>
                  </Button>
                </AtModalAction>)
            )
          }
        </AtModal>
        <AtActionSheet
          title={`本场比赛需要付费观看\n本场比赛限时观看一个月 价格${charge ? getYuan(charge.secondPrice) : 0}（元）\n本场比赛永久观看 价格${charge ? getYuan(charge.price) : 0}（元）\n购买永久后，本场比赛可无限次数观看`}
          cancelText='取消'
          isOpened={isChargeOpen}
          onCancel={this.handleChargeClose}
          onClose={this.handleChargeClose}>
          <AtActionSheetItem
            onClick={this.handleConfirm.bind(this, {isMonth: true, isMonopoly: false, anonymous: false})}>
            购买一个月(本场)
          </AtActionSheetItem>
          <AtActionSheetItem
            onClick={this.handleConfirm.bind(this, {isMonth: false, isMonopoly: false, anonymous: false})}>
            购买永久(本场)
          </AtActionSheetItem>
          {giftDiscount && charge && charge.isMonopolyCharge ? <AtActionSheetItem
            onClick={this.handleConfirm.bind(this, {isMonth: false, isMonopoly: true, anonymous: false})}>
            请大家围观(本场)
          </AtActionSheetItem> : null}
        </AtActionSheet>
        <AtActionSheet
          title="购买“请大家围观”后，您的头像及昵称会在直播间永久展示，且所有观众都可免费观看本场比赛，同时可联系客服获取录像下载地址。"
          cancelText='取消'
          isOpened={isMonopolyOpen}
          onCancel={this.handleMonopolyClose}
          onClose={this.handleMonopolyClose}>
          {/*<AtActionSheetItem*/}
          {/*  onClick={this.handleConfirm.bind(this, {isMonth: false, isMonopoly: true, anonymous: true})}>*/}
          {/*  匿名请大家围观(本场)*/}
          {/*</AtActionSheetItem>*/}
          <AtActionSheetItem
            onClick={this.handleConfirm.bind(this, {isMonth: false, isMonopoly: true, anonymous: false})}>
            确定购买
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}

export default ModalPay
