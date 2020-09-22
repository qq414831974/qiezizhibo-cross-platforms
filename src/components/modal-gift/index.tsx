import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider, AtActionSheet, AtActionSheetItem} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import Request from '../../utils/request'
import {getStorage, getYuan, toLogin} from '../../utils/utils'
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
  handleClose: (event?: any) => any,
  handleError: (event?: any) => any
}

type PageOwnProps = {
  gift: any,
  num: number,
  giftInfo: GiftInfo,
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalGift {
  props: IProps;
}

class ModalGift extends Component<PageOwnProps, PageState> {
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
  handleConfirm = () => {
  }
  handleCancel = () => {

  }

  render() {
    const {isOpened = false, handleCancel, gift, num = 0, giftInfo = null} = this.props;
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
