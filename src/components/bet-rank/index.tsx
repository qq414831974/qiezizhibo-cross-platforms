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
  betRanks: any,
  loading: any,
  isOpened: boolean,
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface BetRank {
  props: IProps;
}


class BetRank extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  getFontSize = (user) => {
    if (user && user.name && user.name.length > 7) {
      if (user && user.name && user.name.length > 9) {
        return "qz-betrank-text-mini";
      }
      return "qz-betrank-text-small";
    }
  }

  render() {
    const {isOpened = false, betRanks = [], handleCancel} = this.props

    return (
      <View>
        <AtModal className="at-modal-big" isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-betrank">
              <View className="qz-betrank-scroll-content">
                {betRanks == null || betRanks.length == 0 ?
                  <View className="qz-betrank-content-nomore">暂无</View>
                  : null}
                {betRanks && betRanks.map((item: any) => (
                  <View key={item.id} className='qz-betrank-content'>
                    <View className='qz-betrank-list'>
                      <View className='qz-betrank-list__item'>
                        <View className='qz-betrank-list__item-container'>
                          <View
                            className={`qz-betrank-list__item-rank ${item.index <= 3 ? `qz-betrank-list__item-rank-r${item.index}` : ""}`}>
                            <View className='qz-betrank-list__item-rank-text'>
                              {item.index}
                            </View>
                          </View>
                          <View className='qz-betrank-list__item-avatar'>
                            <Image mode='scaleToFill' src={item.user && item.user.avatar ? item.user.avatar : NoUser}/>
                          </View>
                          <View className='qz-betrank-list__item-content item-content'>
                            <View className='item-content__info'>
                              <View className={`item-content__info-title ${this.getFontSize(item.user)}`}>
                                {item.user && item.user.name ? item.user.name : "匿名"}
                              </View>
                              <View className='item-content__info-note'>
                                总花费{item.price ? getYuan(item.price) : 0}茄币
                              </View>
                            </View>
                          </View>
                          <View className='qz-betrank-list__item-extra item-extra'>
                            <View className='item-extra__text'>
                              竞猜成功{item.count}次
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

export default BetRank
