import {Component} from 'react'
import {View, Image} from '@tarojs/components'
import './index.scss'
import NoUser from '../../assets/no-user.png'
import defaultLogo from '../../assets/default-logo.png'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  detail: any,
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

class GiftNotify extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  getFontSize = (name) => {
    if (name && name.length > 7) {
      if (name && name.length > 9) {
        return "qz-giftnotify-content-text-mini";
      }
      return "qz-giftnotify-content-text-small";
    }
  }

  render() {
    const {detail = {}, position = "left", row = 1, active = false} = this.props

    return (
      <View
        className={`qz-giftnotify ${position == "left" ? "qz-giftnotify-left" : "qz-giftnotify-right"} ${active ? "qz-giftnotify-active" : ""}`}
        style={{bottom: rowData[row]}}>
        <View className="qz-giftnotify-content">
          <View className={`qz-giftnotify-content-user-name ${this.getFontSize(detail.senderName)}`}>
            <View className="qz-giftnotify-content-user-name-text">
              {detail.senderName ? detail.senderName : "用户"}
            </View>
          </View>
          <Image src={detail.senderHeadImg ? detail.senderHeadImg : NoUser}
                 className="qz-giftnotify-content-user-avatar"/>
          <View className="qz-giftnotify-content-gift-name">
            <View className="qz-giftnotify-content-gift-name-text">
              送出 {detail.giftName ? detail.giftName : "礼物"}
            </View>
          </View>
          <Image src={detail.giftHeadImg ? detail.giftHeadImg : defaultLogo}
                 className="qz-giftnotify-content-gift-img"/>
          <View
            className="qz-giftnotify-content-gift-num">{position == "left" ? `${detail.giftNumber} x` : `x ${detail.giftNumber}`}</View>
        </View>
      </View>
    )
  }
}

export default GiftNotify
