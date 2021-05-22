import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtLoadMore} from "taro-ui"
import {connect} from 'react-redux'

import './memberOrder.scss'
import LeagueList from "./components/league-list";
import Request from "../../utils/request";
import * as api from "../../constants/api";
import {getStorage} from "../../utils/utils";
import NavBar from "../../components/nav-bar";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  total: number;
  current: number;
  orderList: Array<any>;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MemberOrder {
  props: IProps;
}

class MemberOrder extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      total: 0,
      current: 0,
      orderList: [],
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getMemberOrderList();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getMemberOrderList = async () => {
    const userNo = await getStorage('userNo')
    this.setState({loading: true})
    new Request().get(api.API_USER_LEAGUE_MEMBER, {
      pageSize: 5,
      pageNum: 1,
      userNo: userNo,
    }).then((res: any) => {
      if (res) {
        this.setState({orderList: res.records, loading: false, total: res.total, current: res.current});
      }
    })
  }
  nextPage = async () => {
    const userNo = await getStorage('userNo')
    this.setState({loading: true})
    new Request().get(api.API_USER_LEAGUE_MEMBER, {
      pageSize: 5,
      pageNum: this.state.current + 1,
      userNo: userNo,
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
  onReachBottom = () => {
    this.nextPage();
  }

  render() {
    const {orderList, total, loading} = this.state
    let loadingmoreStatus: any = "more";
    if (loading) {
      loadingmoreStatus = "loading";
    } else if (orderList == null || orderList.length <= 0 || total <= orderList.length) {
      loadingmoreStatus = "noMore"
    }

    return (
      <View className='qz-member-orders-content'>
        <NavBar
          title='我的联赛会员'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        {orderList && orderList.length > 0 ? (
          <LeagueList
            leagueList={orderList}/>
        ) : null}
        <AtLoadMore status={loadingmoreStatus} loadingText="加载中..." noMoreText="没有更多了" onClick={this.nextPage}/>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(MemberOrder)
