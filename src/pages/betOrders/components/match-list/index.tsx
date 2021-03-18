import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtActionSheet, AtActionSheetItem} from "taro-ui"
import MatchItem from '../../../../components/match-item'
import {getYuan, getTimeDifference} from '../../../../utils/utils'

import './index.scss'
import Request from "../../../../utils/request";
import * as api from "../../../../constants/api";
import * as global from "../../../../constants/global";

const eventType: { [key: number]: { text: string, success: boolean }; } = {}
eventType[-1] = {text: "未出赛果", success: false};
eventType[0] = {text: "竞猜失败", success: false};
eventType[1] = {text: "竞猜成功，未发奖", success: true};
eventType[2] = {text: "竞猜成功，已发奖", success: true};
eventType[3] = {text: "放弃领奖（未填写地址）", success: true};
eventType[4] = {text: "竞猜取消", success: false};

const DEFAULT_ADDRESS = 1;
const SELECT_ADDRESS = 2;
type PageStateProps = {}

type PageDispatchProps = {
  onRefreshFunc: any;
}

type PageOwnProps = {
  matchList: any;
  addressLoading: boolean;
  address: any;
}

type PageState = {
  orderlist: {};
  isAddressOpen: boolean;
  currentOrder: any;
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
      isAddressOpen: false,
      currentOrder: null,
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
    const diff = getTimeDifference(time);
    if (diff == null) {
      return null;
    }
    let timeString;
    const {diffDay = null, diffTime = null} = diff;
    if (diffDay) {
      timeString = diffDay
    } else if (diffTime) {
      timeString = diffTime
    }
    return timeString
  }
  copyItem = (data) => {
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
  onAddressClick = (item) => {
    this.setState({isAddressOpen: true, currentOrder: item})
  }
  handleAddressClose = () => {
    this.setState({isAddressOpen: false})
  }
  handleAddressConfirm = (type) => {
    if (this.state.currentOrder == null) {
      return;
    }
    switch (type) {
      case DEFAULT_ADDRESS:
        this.cashBet(this.props.address);
        break;
      case SELECT_ADDRESS:
        this.onAddressSelect();
        break;
    }
  }
  onAddressSelect = () => {
    Taro.chooseAddress().then((data: any) => {
      if (data.errMsg == "chooseAddress:ok") {
        this.cashBet(this.props.address);
      }
    }).catch((error: any) => {
      Taro.showToast({title: "未选择地址", icon: "none"});
    })
  }
  cashBet = (address) => {
    const currentOrder = this.state.currentOrder
    if (this.state.currentOrder == null) {
      return;
    }
    new Request().post(api.API_MATCH_USER_BET_CASH, {
      address: address,
      id: currentOrder.id
    }).then((res: any) => {
      if (res) {
        Taro.showToast({title: "修改地址成功", icon: "success"});
      } else {
        Taro.showToast({title: "修改地址失败", icon: "none"});
      }
      this.props.onRefreshFunc && this.props.onRefreshFunc();
    }).catch(() => {
      Taro.showToast({title: "修改地址失败", icon: "none"});
    });
  }
  getScore = (score) => {
    let scoreString = score;
    if (score == "win") {
      scoreString = "主胜其他"
    } else if (score == "draw") {
      scoreString = "平其他"
    } else if (score == "lost") {
      scoreString = "客胜其他"
    }
    return scoreString;
  }

  render() {
    const {matchList, addressLoading} = this.props
    const {isAddressOpen} = this.state
    return <View className='qz-match-list'>
      {matchList && matchList.map((item) => {
        return <View key={item.id}>
          <View className='qz-match-list-content'>
            <View className='qz-match-list-content__inner'>
              {item.status != null ? <View className="qz-match-list-content__charge">
                {item.status != null ? eventType[item.status].text : null}
              </View> : null}
              <MatchItem
                forceClick
                showBet={false}
                matchInfo={item.match}
                showCharge={false}
                onClick={this.onItemClick.bind(this, item.id)}/>
            </View>
          </View>
          {this.state.orderlist[item.id] ? <View className='qz-match-list-order'>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-6 qz-match-list-order__item-highlight'>
                  竞猜比分：{this.getScore(item.score)}
                </View>
                <View className='at-col at-col-6 qz-match-list-order__item-highlight'>
                  档次：{item.gradeInfo ? getYuan(item.gradeInfo.price) : getYuan(item.gradeInfo.price)}元档
                </View>
              </View>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-6 qz-match-list-order__item-highlight'>
                  赛果：{item.match ? item.match.score : null}
                </View>
                <View className='at-col at-col-6 qz-match-list-order__item-highlight'>
                  竞猜状态：{item.status != null ? eventType[item.status].text : null}
                </View>
              </View>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-8 qz-match-list-order__item'>订单号：{item.orderId}</View>
                <View className='at-col at-col-4 qz-match-list-order__item'>
                  {item.type == global.BET_TYPE.CHARGE && item.gradeInfo ? `价格：${getYuan(item.gradeInfo.price)}元` : ""}
                  {item.type == global.BET_TYPE.FREE && item.gradeInfo ? `价格：免费次数${item.gradeInfo.freeTime}次` : ""}
                </View>
              </View>
              <View className="at-row at-row--no-wrap">
                <View className='at-col at-col-12 qz-match-list-order__item'>
                  下单时间：{item.betTime}
                </View>
              </View>
              {item.settleExpireTime && item.address == null ?
                <View className="at-row at-row--no-wrap">
                  <View className='at-col at-col-12 qz-match-list-order__item'>
                    兑奖过期倒计时：{this.getExpireDays(item.settleExpireTime)}
                  </View>
                </View>
                : null}
              {item.status != null && eventType[item.status].success ?
                <View className="at-row at-row--no-wrap">
                  <View className='at-col at-col-12 qz-match-list-order__item-wrap'>
                    {item.gradeInfo && item.gradeInfo.award ? `奖品：${item.gradeInfo.award}` : ""}
                    {item.gradeInfo && item.gradeInfo.awardDeposit ? `奖品：${getYuan(item.gradeInfo.awardDeposit)}茄币` : ""}
                  </View>
                </View>
                : null}
              {item.address ?
                <View className="at-row">
                  <View className='at-col at-col-12 qz-match-list-order__item-wrap'>
                    邮寄地址：{item.address}
                  </View>
                </View>
                : (item.status == 1 && item.type == global.BET_TYPE.CHARGE ? <View className='item_view'>
                  <View className='item item-highlight' onClick={this.onAddressClick.bind(this, item)}>
                    <View className='desc desc-highlight'>点击填写地址兑奖</View>
                  </View>
                </View> : null)}
              {item.expressNo ?
                <View className="at-row at-row--no-wrap">
                  <View className='at-col at-col-12 qz-match-list-order__item'>
                    快递单号：{item.expressNo}
                  </View>
                </View>
                : null}
              <View className='item_view'>
                <View className='item' onClick={this.copyItem.bind(this, item.orderId)}>
                  <View className='desc'>复制订单号</View>
                </View>
                <View className='line'/>
                {item.expressNo ?
                  <View className='item' onClick={this.copyItem.bind(this, item.expressNo)}>
                    <View className='desc'>复制快递单号</View>
                  </View>
                  : <View className='item'/>}
              </View>
            </View> :
            null}
        </View>
      })}
      <AtActionSheet
        title="选择收货地址"
        cancelText='取消'
        isOpened={isAddressOpen}
        onCancel={this.handleAddressClose}
        onClose={this.handleAddressClose}>
        {addressLoading ? null : <AtActionSheetItem
          onClick={this.handleAddressConfirm.bind(this, DEFAULT_ADDRESS)}>
          使用我的默认地址
        </AtActionSheetItem>}
        <AtActionSheetItem
          onClick={this.handleAddressConfirm.bind(this, SELECT_ADDRESS)}>
          选择地址
        </AtActionSheetItem>
      </AtActionSheet>
    </View>
  }
}

export default MatchList
