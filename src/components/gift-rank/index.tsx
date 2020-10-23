import Taro, {Component} from '@tarojs/taro'
import {View, Image, Button} from '@tarojs/components'
import {AtModal, AtModalContent, AtModalAction} from "taro-ui"
import './index.scss'
import NoUser from '../../assets/no-user.png'
import {getYuan} from "../../utils/utils";


type PageStateProps = {}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = {
  giftRanks: any,
  loading: any,
  isOpened: boolean,
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface GiftRank {
  props: IProps;
}


class GiftRank extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  getFontSize = (user) => {
    if (user && user.name && user.name.length > 7) {
      if (user && user.name && user.name.length > 9) {
        return "qz-giftrank-text-mini";
      }
      return "qz-giftrank-text-small";
    }
  }

  render() {
    const {isOpened = false, giftRanks = [], handleCancel} = this.props

    return (
      <View>
        <AtModal className="at-modal-big" isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-giftrank">
              <View className="qz-giftrank-scroll-content">
                {giftRanks == null || giftRanks.length == 0 ?
                  <View className="qz-giftrank-content-nomore">暂无</View>
                  : null}
                {giftRanks && giftRanks.map((item: any) => (
                  <View key={item.id} className='qz-giftrank-content'>
                    <View className='qz-giftrank-list'>
                      <View className='qz-giftrank-list__item'>
                        <View className='qz-giftrank-list__item-container'>
                          <View
                            className={`qz-giftrank-list__item-rank ${item.index <= 3 ? `qz-giftrank-list__item-rank-r${item.index}` : ""}`}>
                            <View className='qz-giftrank-list__item-rank-text'>
                              {item.index}
                            </View>
                          </View>
                          <View className='qz-giftrank-list__item-avatar'>
                            <Image mode='scaleToFill' src={item.user && item.user.avatar ? item.user.avatar : NoUser}/>
                          </View>
                          <View className='qz-giftrank-list__item-content item-content'>
                            <View className='item-content__info'>
                              <View className={`item-content__info-title ${this.getFontSize(item.user)}`}>
                                {item.user && item.user.name ? item.user.name : "匿名"}
                              </View>
                            </View>
                          </View>
                          <View className='qz-giftrank-list__item-extra item-extra'>
                            <View className='item-extra__text'>
                              {item.charge ? getYuan(item.charge) : 0}茄币
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
                }
              </View>
            </View>
          </AtModalContent> : null}
          <AtModalAction>
            <Button className="mini-gray" onClick={handleCancel}>关闭</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default GiftRank
