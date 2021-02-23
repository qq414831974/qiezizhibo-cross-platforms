import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import MatchItem from '../../../../components/match-item'
import {getYuan, getTimeDifference} from '../../../../utils/utils'

import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  matchList: any;
}

type PageState = {
  orderlist: {};
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MatchList {
  props: IProps;
}

class MatchList extends Component<PageOwnProps, PageState> {
  static defaultProps = {}
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */

  config: Config = {
    navigationBarTitleText: '比赛',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  constructor(props) {
    super(props)
    this.state = {
      orderlist: {},
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  onItemClick = (id) => {
    let orderList = this.state.orderlist;
    if (orderList[id]) {
      orderList[id] = false
    } else {
      orderList[id] = true;
    }
    this.setState({orderlist: orderList})
  }
  onMatchItemClick = (item) => {
    Taro.navigateTo({url: `../live/live?id=${item.id}`});
  }
  getExpireDays = (time) => {
    if (time == null) {
      return "无";
    }
    let timeString;
    const diff = getTimeDifference(time);
    if (diff == null) {
      return "已过期";
    }
    const {diffDay = null, diffTime = null} = diff;
    if (diffDay) {
      timeString = diffDay
    } else if (diffTime) {
      timeString = diffTime
    }
    return timeString
  }
  copyOrderId = (data) => {
    Taro.setClipboardData({
      data: data,
      success: () => {
        Taro.showToast({title: "复制成功", icon: "success"});
      },
      fail: () => {
        Taro.showToast({title: "复制失败", icon: "none"});
      }
    })
  }

  render() {
    const {matchList} = this.props
    return <View className='qz-match-list'>
      {matchList && matchList.filter(item => {
        if (item.mpo.expireTime) {
          const time_diff = Date.parse(item.mpo.expireTime) - new Date().getTime();
          if (time_diff < 0) {
            return false
          }
        }
        return true;
      }).map((item) => {
        return <View key={item.id}>
          <View className='qz-match-list-content'>
            <View className='qz-match-list-content__inner'>
              {item.mpo && item.mpo.type == 3 ? <View className="qz-match-list-content__charge">
                请大家围观
              </View> : null}
              <MatchItem
                matchInfo={item.match}
                showCharge={false}
                onClick={this.onItemClick.bind(this, item.id)}/>
            </View>
          </View>
          {item.mpo && this.state.orderlist[item.id] ? <View className='qz-match-list-order'>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-8 qz-match-list-order__item'>订单号：{item.mpo.orderId}</View>
                <View className='at-col at-col-4 qz-match-list-order__item'>
                  价格：{item.mpo.isSecond ? getYuan(item.mpo.secondPrice) : getYuan(item.mpo.price)}元
                </View>
              </View>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-8 qz-match-list-order__item'>创建时间：{item.mpo.createTime}</View>
                {item.mpo.expireTime ?
                  <View className='at-col at-col-4 qz-match-list-order__item'>
                    过期时间：{this.getExpireDays(item.mpo.expireTime)}
                  </View>
                  : null}
              </View>
              <View className='item_view'>
                <View className='item' onClick={this.copyOrderId.bind(this, item.mpo.orderId)}>
                  <View className='desc'>复制订单号</View>
                </View>
                <View className='line'/>
                <View className='item' onClick={this.onMatchItemClick.bind(this, item.match)}>
                  <View className='desc'>观看比赛</View>
                </View>
              </View>
            </View> :
            null}
        </View>
      })}
    </View>
  }
}

export default MatchList
