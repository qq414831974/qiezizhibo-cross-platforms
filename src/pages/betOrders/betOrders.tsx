import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtLoadMore, AtTabs, AtTabsPane} from "taro-ui"
import {connect} from '@tarojs/redux'

import './betOrders.scss'
import MatchList from "./components/match-list";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import {getStorage} from "../../utils/utils";
import {BET_STATUS} from "../../constants/global";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  total: number;
  current: number;
  orderList: Array<any>;
  addressLoading: boolean;
  address: any;
  currentTab: any;
  status: Array<any>;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface BetOrders {
  props: IProps;
}

class BetOrders extends Component<PageOwnProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '我的竞猜',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getOrdersList();
    this.getUserAddress();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getUserAddress = () => {
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    this.setState({addressLoading: true})
    new Request().get(api.API_USER_ADDRESS(userNo), null).then((data: any) => {
      if (data && data.id) {
        this.setState({address: data})
      }
      this.setState({addressLoading: false})
    });
  }
  getOrdersList = async () => {
    const userNo = await getStorage('userNo')
    this.setState({loading: true})
    new Request().get(api.API_MATCH_USER_BET, {
      pageSize: 5,
      pageNum: 1,
      userNo: userNo,
      status: this.state.status ? this.state.status : null
    }).then((res: any) => {
      if (res) {
        this.setState({orderList: res.records, loading: false, total: res.total, current: res.current});
      }
    })
  }
  nextPage = async () => {
    const userNo = await getStorage('userNo')
    this.setState({loading: true})
    new Request().get(api.API_MATCH_USER_BET, {
      pageSize: 5,
      pageNum: this.state.current + 1,
      userNo: userNo,
      status: this.state.status ? this.state.status : null
    }).then((res: any) => {
      if (res) {
        this.setState({
          orderList: this.state.orderList.concat(res.records),
          loading: false,
          total: res.total,
          current: res.current
        });
      }
    })
  }

  // 小程序上拉加载
  onReachBottom() {
    this.nextPage();
  }

  switchTab = (tab) => {
    let status: Array<any> = [];
    if (tab == 0) {
      status = [];
    } else if (tab == 1) {
      status.push(BET_STATUS.BETTING);
    } else if (tab == 2) {
      status.push(BET_STATUS.BET_FAILED);
      status.push(BET_STATUS.BET_SUCCESS_NOT_SEND);
      status.push(BET_STATUS.BET_SUCCESS_ALREADY_SEND);
      status.push(BET_STATUS.BET_SUCCESS_GIVE_UP);
      status.push(BET_STATUS.BET_CANCEL);
    } else if (tab == 3) {
      status.push(BET_STATUS.BET_SUCCESS_NOT_SEND);
      status.push(BET_STATUS.BET_SUCCESS_ALREADY_SEND);
      status.push(BET_STATUS.BET_SUCCESS_GIVE_UP);
    }
    this.setState({
      currentTab: tab,
      status: status,
      orderList: [],
    }, () => {
      this.getOrdersList();
    })
  }

  render() {
    const {orderList = null, total, loading} = this.state
    let loadingmoreStatus: any = "more";
    if (loading) {
      loadingmoreStatus = "loading";
    } else if (orderList == null || orderList.length <= 0 || total <= orderList.length) {
      loadingmoreStatus = "noMore"
    }

    return (
      <View className='qz-orders-content'>
        <AtTabs current={this.state.currentTab}
                tabList={[{title: '全部'}, {title: '竞猜中'}, {title: '已结束'}, {title: '已猜中'}]}
                onClick={this.switchTab}>
          <AtTabsPane current={this.state.currentTab} index={0}>
            <View/>
          </AtTabsPane>
          <AtTabsPane current={this.state.currentTab} index={1}>
            <View/>
          </AtTabsPane>
          <AtTabsPane current={this.state.currentTab} index={2}>
            <View/>
          </AtTabsPane>
          <AtTabsPane current={this.state.currentTab} index={3}>
            <View/>
          </AtTabsPane>
        </AtTabs>
        {orderList ?
          <MatchList
            address={this.state.address}
            addressLoading={this.state.addressLoading}
            onRefreshFunc={this.getOrdersList}
            matchList={orderList}/>
         : null}
        <AtLoadMore status={loadingmoreStatus} loadingText="加载中..." noMoreText="没有更多了" onClick={this.nextPage}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(BetOrders)
