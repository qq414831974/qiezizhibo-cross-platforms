import Taro, {Component} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import './index.scss'
import NoUser from '../../assets/no-user.png'
import defaultLogo from '../../assets/default-logo.png'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  gift: any,
  user: any,
  num: any,
  position: any,
  row: any,
  active: any,
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface GiftNotify {
  props: IProps;
}

const rowData = {
  0: "50%",
  1: "40%",
  2: "30%",
  3: "20%",
  4: "10%",
}

class GiftNotify extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  getFontSize = (user) => {
    if (user && user.name && user.name.length > 7) {
      if (user && user.name && user.name.length > 9) {
        return "qz-giftnotify-content-text-mini";
      }
      return "qz-giftnotify-content-text-small";
    }
  }

  render() {
    const {gift, user, num, position = "left", row = 1, active = false} = this.props

    return (
      <View
        className={`qz-giftnotify ${position == "left" ? "qz-giftnotify-left" : "qz-giftnotify-right"} ${active ? "qz-giftnotify-active" : ""}`}
        style={{bottom: rowData[row]}}>
        <View className="qz-giftnotify-content">
          <View className={`qz-giftnotify-content-user-name ${this.getFontSize(user)}`}>
            <View className="qz-giftnotify-content-user-name-text">
              {user && user.name ? user.name : "用户"}
            </View>
          </View>
          <Image src={user && user.avatar ? user.avatar : NoUser} className="qz-giftnotify-content-user-avatar"/>
          <View className="qz-giftnotify-content-gift-name">
            <View className="qz-giftnotify-content-gift-name-text">
              送出 {gift && gift.name ? gift.name : "礼物"}
            </View>
          </View>
          <Image src={gift && gift.pic ? gift.pic : defaultLogo} className="qz-giftnotify-content-gift-img"/>
          <View className="qz-giftnotify-content-gift-num">{position == "left" ? `${num} x` : `x ${num}`}</View>
        </View>
      </View>
    )
  }
}

export default GiftNotify
