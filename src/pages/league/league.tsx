import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtSearchBar, AtLoadMore} from "taro-ui"
import {connect} from '@tarojs/redux'

import './league.scss'
import LeagueItem from "../../components/league-item";
import leagueAction from "../../actions/league";
import * as global from "../../constants/global";
import withShare from "../../utils/withShare";

type PageStateProps = {
  leagueList: any;
  locationConfig: { city: string, province: string }
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  searchText: string;
  loadingmore: boolean;
  loading: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface League {
  props: IProps;
}
@withShare({})
class League extends Component<PageOwnProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '茄子TV',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  }
  $setSharePath = () => `/pages/home/home?page=league`

  componentWillMount() {
  }

  componentDidMount() {

  }

  componentWillUnmount() {
  }

  componentDidShow() {
    this.getLeagueList();
  }

  componentDidHide() {
  }

  onSearchChange = (value) => {
    this.setState({
      searchText: value
    })
  }

  onSearchClick = () => {
    Taro.navigateTo({url: "../search/search"});
  }
  onLeagueItemClick = (item) => {
    if (item.isParent) {
      Taro.navigateTo({url: `../series/series?id=${item.id}`});
    } else {
      Taro.navigateTo({url: `../leagueManager/leagueManager?id=${item.id}`});
    }
  }
  getLeagueList = () => {
    this.setState({loading: true})
    Taro.showLoading({title: global.LOADING_TEXT})
    leagueAction.getLeagueSeriesList({
      pageNum: 1,
      pageSize: 10,
      province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null,
      sortField: "sortIndex",
      sortOrder: "desc",
      leagueType: 3,
    }).then(() => {
      this.setState({loading: false})
      Taro.hideLoading();
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({title: "获取联赛信息失败", icon: "none"});
    });
  }
  nextPage = () => {
    this.setState({loadingmore: true})
    leagueAction.getLeagueSeriesList_add({
      pageNum: this.props.leagueList.current + 1,
      pageSize: 10,
      province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null,
      sortField: "sortIndex",
      sortOrder: "desc",
      leagueType: 3,
    }).then(() => {
      this.setState({loadingmore: false})
    })
  }

  // 小程序上拉加载
  onReachBottom() {
    this.nextPage();
  }
  onPullDownRefresh() {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getLeagueList();
    Taro.stopPullDownRefresh();
  }
  render() {
    const {leagueList} = this.props

    if (leagueList && (leagueList.total <= 0 || leagueList.total == null)) {
      return <AtLoadMore status="noMore" noMoreText={this.state.loading ? "加载中..." : "搜一下"}/>
    }
    let loadingmoreStatus: any = "more";
    if (this.state.loadingmore||this.state.loading) {
      loadingmoreStatus = "loading";
    } else if (leagueList.records && (leagueList.total <= leagueList.records.length)) {
      loadingmoreStatus = "noMore"
    }

    return (
      <View className='qz-league-content'>
        <View className='qz-league-content-search' onClick={this.onSearchClick}>
          <AtSearchBar
            value={this.state.searchText}
            onChange={this.onSearchChange}
            disabled
            className='qz-league-content-search-bar'
          />
        </View>
        {leagueList && leagueList.total > 0 ? (
          <View className='qz-league__result-content'>
            <View className='qz-league__result-content__inner'>
              {leagueList.records.map((item) => (
                <LeagueItem key={item.id} leagueInfo={item} onClick={this.onLeagueItemClick.bind(this, item)}/>
              ))}
            </View>
          </View>
        ) : null}
        <AtLoadMore status={loadingmoreStatus} loadingText="加载中..."/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    leagueList: state.league.leagueSeriesList,
    locationConfig: state.config.locationConfig
  }
}
export default connect(mapStateToProps)(League)
