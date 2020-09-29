import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button, Input} from '@tarojs/components'
import Request from '../../utils/request'
import {getStorage, toLogin} from '../../utils/utils'
import * as api from '../../constants/api'
import * as error from '../../constants/error'
import defaultLogo from '../../assets/default-logo.png'
import './index.scss'
import * as global from "../../constants/global";

type GiftInfo = {
  price: number | null,
  realPrice: number | null,
  heatValue: number | null,
  expValue: number | null,
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
  handleError: (event?: any) => any
}

type PageOwnProps = {
  gift: any,
  num: number,
  giftInfo: GiftInfo,
  matchId: any,
  externalId: any,
  heatType: any,
}

type PageState = {
  isPaying: boolean;
  captcha: any;
  captchaInput: any;
  enabledFreeGift: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalGift {
  props: IProps;
}

class ModalGift extends Component<PageOwnProps, PageState> {
  static defaultProps = {
    handleCancel: () => {
    },
    handleConfirm: () => {
    },
    handleError: () => {
    },
  }

  constructor(props) {
    super(props)
    this.state = {
      isPaying: false,
      captcha: null,
      captchaInput: null,
      enabledFreeGift: true,
    }
  }

  componentDidMount() {
    this.changeCaptcha();
  }

  handleConfirm = async () => {
    const {gift, giftInfo} = this.props;
    if (giftInfo && gift && gift.type == global.GIFT_TYPE.FREE) {
      if (this.state.captchaInput && this.state.captcha && this.state.captchaInput.toLowerCase() != this.state.captcha.toLowerCase()) {
        Taro.showToast({title: "验证码错误", icon: "none"});
        return;
      } else {
        this.changeCaptcha();
        this.setState({captchaInput: ""})
      }
    }
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
    if (gift.type == global.GIFT_TYPE.CHARGE) {
      this.sendChargeGift(openId, userNo);
    } else if (gift.type == global.GIFT_TYPE.FREE) {
      this.sendFreeGift(userNo);
    }
  }
  sendChargeGift = (openId, userNo) => {
    const {handleConfirm, handleError, gift, num = 0} = this.props;
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    this.setState({isPaying: true})
    new Request().post(api.API_ORDER_CREATE, {
      openId: openId,
      userNo: userNo,
      type: global.ORDER_TYPE.gift,
      description: `茄子体育-礼物-${gift.id}-${num}-${this.props.matchId}-${this.props.heatType}-${this.props.externalId}`,
      products: [{productId: gift.productId, number: num, isSecond: false}],
      attach: JSON.stringify({
        matchId: this.props.matchId,
        type: global.GIFT_TYPE.CHARGE,
        giftId: gift.id,
        externalId: this.props.externalId,
        targetType: this.props.heatType,
        num: num
      })
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
  sendFreeGift = (userNo) => {
    if (!this.state.enabledFreeGift) {
      Taro.showToast({title: "一分钟只能送出一次免费礼物", icon: "none"})
      return;
    }
    const {handleConfirm, handleError, gift, num = 0} = this.props;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const contxt = this;
    Taro.showLoading({title: global.LOADING_TEXT})
    if (this.state.isPaying) {
      return;
    }
    this.setState({isPaying: true})
    new Request().get(api.API_GIFT_SEND_FREE_LIMIT, {userNo: userNo, giftId: gift.id}).then((limit: any) => {
      if (limit + num > gift.limited) {
        Taro.hideLoading();
        Taro.showToast({title: "今日免费礼物次数已用完", icon: "none"})
        this.setState({isPaying: false})
      } else {
        new Request().post(api.API_GIFT_SEND_FREE, {
          userNo: userNo,
          giftId: gift.id,
          matchId: this.props.matchId,
          targetType: this.props.heatType,
          externalId: this.props.externalId,
        }).then((res: any) => {
          Taro.hideLoading();
          this.setState({isPaying: false})
          if (res) {
            handleConfirm(global.GIFT_TYPE.FREE);
            setTimeout(() => {
              contxt.setState({enabledFreeGift: true});
            }, 61000);
          } else {
            handleError(error.ERROR_SEND_GIFT_ERROR);
          }
        });
      }
    })
  }
  changeCaptcha = () => {
    let code = '';
    const codeLength = 4;
    let random: Array<any> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (let i = 0; i < codeLength; i++) {
      //设置随机数范围,这设置为0 ~ 36
      let index = Math.floor(Math.random() * 36);
      //字符串拼接 将每次随机的字符 进行拼接
      code += random[index];
    }
    this.setState({captcha: code});
  }
  onCaptchaInputChange = (e) => {
    this.setState({captchaInput: e.detail.value});
    return e.detail.value
  }

  render() {
    const {isOpened = false, handleCancel, gift, num = 0, giftInfo = null} = this.props;
    if (!isOpened) {
      return <View/>
    }
    return (
      <View>
        <AtModal isOpened={isOpened} onClose={handleCancel}>
          <AtModalContent>
            <View className="center">
              <AtAvatar circle size="small" image={gift && gift.pic ? gift.pic : defaultLogo}/>
            </View>
            <Text className="center gray qz-gift-modal-content_text">
              {gift && gift.name ? `${gift.name}(${num}个)` : "礼物"}
            </Text>
            <AtDivider height={36} lineColor="#E5E5E5"/>
            {giftInfo && giftInfo.price ?
              <View className="black qz-gift-modal-content_tip">
                • {giftInfo.price}元{giftInfo && giftInfo.realPrice ? `(原价${giftInfo.realPrice}元)` : ""}
              </View>
              : null}
            {giftInfo && giftInfo.heatValue ?
              <View className="light-gray qz-gift-modal-content_tip">
                • +{giftInfo.heatValue}热度
              </View>
              : null}
            {giftInfo && giftInfo.expValue ?
              <View className="light-gray qz-gift-modal-content_tip">
                • +{giftInfo.expValue}经验
              </View>
              : null}
            {giftInfo && gift && gift.type == global.GIFT_TYPE.FREE ?
              <View>
                <AtDivider height={36} lineColor="#E5E5E5"/>
                <View className="qz-gift-modal-content_captcha-container">
                  <Input className="qz-gift-modal-content_captcha-input"
                         placeholder={isOpened ? "请输入验证码" : undefined}
                         value={this.state.captchaInput}
                         onInput={this.onCaptchaInputChange}/>
                  <View className="qz-gift-modal-content_captcha"
                        onClick={this.changeCaptcha}>
                    {this.state.captcha}
                  </View>
                </View>
              </View>
              : null}
          </AtModalContent>
          <AtModalAction>
            <Button className="mini-gray" onClick={handleCancel}>取消</Button>
            <Button className="black" onClick={this.handleConfirm}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default ModalGift
