import Taro, {Component} from '@tarojs/taro'
import {ScrollView, View, Image} from '@tarojs/components'
import './index.scss'
import NoUser from '../../assets/no-user.png'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  giftRanks: any,
  loading: any,
  hidden: any,
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
    const {giftRanks = [], hidden = false} = this.props
    if (hidden) {
      return <View/>
    }
    return (
      <View className="qz-giftrank">
        <ScrollView scrollY className="qz-giftrank-scroll-content">
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
                        {item.charge ? item.charge : 0}茄币
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))
          }
        </ScrollView>
      </View>
    )
  }
}

export default GiftRank
