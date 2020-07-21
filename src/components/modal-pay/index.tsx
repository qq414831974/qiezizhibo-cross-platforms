import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import Request from '../../utils/request'
import {getStorage, getYuan} from '../../utils/utils'
import * as api from '../../constants/api'
import * as error from '../../constants/error'
import defaultLogo from '../../assets/default-logo.png'
import './index.scss'
import * as global from "../../constants/global";


type MatchCharge = {
  price: number,
  secondPrice: number,
  productId: number,
  type: number,
  matchId: number,
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
  charge: MatchCharge | any,
}

type PageOwnProps = {}

type PageState = {}

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
  handleConfirm = async (isMonth: boolean) => {
    Taro.showLoading({title: global.LOADING_TEXT})
    const {handleConfirm, handleError, charge} = this.props;

    const openId = await getStorage('wechatOpenid')
    const userNo = await getStorage('userNo')
    new Request().post(api.API_ORDER_CREATE, {
      openId: openId,
      userNo: userNo,
      type: charge.type,
      description: `茄子体育-${charge.type == global.ORDER_TYPE.live ? "直播" : "录播"}-${charge.matchId}`,
      products: [{productId: charge.productId, isSecond: isMonth}],
      attach: JSON.stringify({matchId: charge.matchId, type: charge.type})
    }).then((unifiedResult: UnifiedJSAPIOrderResult) => {
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
      console.log(reason);
      handleError(error.ERROR_PAY_ERROR);
      Taro.hideLoading();
    })
  }

  render() {
    const {isOpened = false, handleCancel, charge} = this.props;
    return (
      <AtModal isOpened={isOpened} onClose={handleCancel}>
        <AtModalContent>
          <View className="center">
            <AtAvatar circle image={defaultLogo}/>
          </View>
          <Text className="center gray qz-pay-modal-content_text">
            付费观看
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <View className="gray qz-pay-modal-content_tip">
            • 本场比赛需要付费观看
          </View>
          <View className="gray qz-pay-modal-content_tip">
            • 本场比赛限时观看一个月 价格{charge ? getYuan(charge.secondPrice) : 0}（元）
          </View>
          <View className="gray qz-pay-modal-content_tip">
            • 本场比赛永久观看 价格{charge ? getYuan(charge.price) : 0}（元）
          </View>
          <View className="light-gray qz-pay-modal-content_tip">
            • 购买永久后，本场比赛可无限次数观看，并可联系客服获取录像下载地址
          </View>
        </AtModalContent>
        <AtModalAction>
          <Button className="black" onClick={this.handleConfirm.bind(this, true)}>购买一个月(本场)</Button>
          <Button className="black" onClick={this.handleConfirm.bind(this, false)}>购买永久(本场)</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}
export default ModalPay
