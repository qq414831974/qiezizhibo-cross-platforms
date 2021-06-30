import Taro from '@tarojs/taro'
import {Component} from 'react'
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

class MatchList extends Component<IProps, PageState> {
  static defaultProps = {}

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
        if (item.expireTime) {
          const time_diff = Date.parse(item.expireTime) - new Date().getTime();
          if (time_diff < 0) {
            return false
          }
        }
        return true;
      }).map((item) => {
        return <View key={item.orderId}>
          <View className='qz-match-list-content'>
            <View className='qz-match-list-content__inner'>
              {item.orderType == 3 ? <View className="qz-match-list-content__charge">
                请大家围观
              </View> : null}
              <MatchItem
                matchInfo={item.match}
                showCharge={false}
                onClick={this.onItemClick.bind(this, item.orderId)}/>
            </View>
          </View>
          {this.state.orderlist[item.orderId] ? <View className='qz-match-list-order'>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-8 qz-match-list-order__item'>订单号：{item.orderId}</View>
                <View className='at-col at-col-4 qz-match-list-order__item'>
                  价格：{getYuan(item.orderPrice)}元
                </View>
              </View>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-8 qz-match-list-order__item'>创建时间：{item.createTime}</View>
                {item.expireTime ?
                  <View className='at-col at-col-4 qz-match-list-order__item'>
                    过期时间：{this.getExpireDays(item.expireTime)}
                  </View>
                  : null}
              </View>
              <View className='item_view'>
                <View className='item' onClick={this.copyOrderId.bind(this, item.orderId)}>
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
