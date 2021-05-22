import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View} from '@tarojs/components'

import './index.scss'

import LeagueItem from "../../../../components/league-item";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  leagueList: any;
}

type PageState = {
  orderlist: {};
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueList {
  props: IProps;
}

class LeagueList extends Component<IProps, PageState> {
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
  onLeagueItemClick = (item) => {
    Taro.navigateTo({url: `../leagueManager/leagueManager?id=${item.id}`});
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
    const {leagueList} = this.props
    return <View className='qz-league-list'>
      {leagueList && leagueList.map((item) => {
        return <View key={item.orderId}>
          <View className='qz-league-list-content'>
            <View className='qz-league-list-content__inner'>
              <LeagueItem key={item.orderId} leagueInfo={item.league} onClick={this.onItemClick.bind(this, item.orderId)}/>
            </View>
          </View>
          {this.state.orderlist[item.orderId] ? <View className='qz-league-list-order'>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-12 qz-league-list-order__item'>订单号：{item.orderId}</View>
              </View>
              <View className='item_view'>
                <View className='item' onClick={this.copyOrderId.bind(this, item.orderId)}>
                  <View className='desc'>复制订单号</View>
                </View>
                <View className='line'/>
                <View className='item' onClick={this.onLeagueItemClick.bind(this, item.league)}>
                  <View className='desc'>进入联赛</View>
                </View>
              </View>
            </View> :
            null}
        </View>
      })}
    </View>
  }
}

export default LeagueList
