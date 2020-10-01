import Taro, {Component, Config} from '@tarojs/taro'
import {View, ScrollView} from '@tarojs/components'
import {AtSearchBar, AtTabs, AtTabsPane} from "taro-ui"
import {connect} from '@tarojs/redux'
import matchAction from "../../actions/match";

import './match.scss'
import MatchList from "./components/match-list";
import withShare from "../../utils/withShare";
import * as global from "../../constants/global";
import * as api from "../../constants/api";
import Request from "../../utils/request";

type PageStateProps = {
  locationConfig: { city: string, province: string }
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  searchText: string;
  currentTab: number;
  loadingmore: boolean;
  loading: boolean;
  tabsClass: string;
  matchList: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@withShare({})
class Match extends Component<PageOwnProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '校园足球赛事频道',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
    this.state = {
      loadingmore: false,
      loading: false,
      searchText: '',
      currentTab: 0,
      tabsClass: '',
      matchList: {},
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    new Request().get(api.API_CACHED_CONTROLLER, null).then((data: any) => {
      if (data.available) {
        global.CacheManager.getInstance().CACHE_ENABLED = true;
      } else {
        global.CacheManager.getInstance().CACHE_ENABLED = false;
      }
      matchAction.getMatchList_clear();
      this.switchTab(0);
    })
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  onPullDownRefresh() {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getMatchList();
    Taro.stopPullDownRefresh();
  }

  onSearchChange = (value) => {
    this.setState({
      searchText: value
    })
  }

  onSearchClick = () => {
    Taro.navigateTo({url: "../search/search"});
  }
  switchTab = (tab) => {
    const getMatchList = this.getMatchList;
    matchAction.getMatchList_clear()
    this.setState({
      currentTab: tab
    }, () => {
      getMatchList();
    })
  }
  getMatchList = () => {
    let status = "unfinish"
    let orderby = "desc"
    switch (this.state.currentTab) {
      case 0:
        status = "unfinish";
        orderby = "asc";
        break;
      case 1:
        status = "finish"
        orderby = "desc";
        break;
    }
    this.setState({loading: true})
    let url = api.API_MATCHES;
    let param: any = {
      status: status,
      pageNum: 1,
      pageSize: 10,
      sortOrder: orderby,
      isActivity: true,
      areatype: 2,
    }
    if (global.CacheManager.getInstance().CACHE_ENABLED && status != null && status == "finish") {
      url = api.API_CACHED_MATCHES_FINISH;
      param = null;
    } else if (global.CacheManager.getInstance().CACHE_ENABLED && status != null && status == "unfinish") {
      url = api.API_CACHED_MATCHES_UNFINISH;
      param = null;
    }
    new Request().get(url, param).then((data: any) => {
      this.setState({loading: false, matchList: data})
      Taro.hideLoading()
    });
  }
  nextPage = (tab) => {
    if (global.CacheManager.getInstance().CACHE_ENABLED) {
      return;
    }
    if (typeof (tab) != 'number') {
      tab = this.state.currentTab
    }
    let status = "unfinish"
    let orderby = "desc"
    switch (tab) {
      case 0:
        status = "unfinish";
        orderby = "asc";
        break;
      case 1:
        status = "finish"
        orderby = "desc";
        break;
    }
    this.setState({loadingmore: true})
    let url = api.API_MATCHES;
    let param: any = {
      status: status,
      pageNum: 1,
      pageSize: 10,
      sortOrder: orderby,
      isActivity: true,
      areatype: 2,
    }
    if (global.CacheManager.getInstance().CACHE_ENABLED && status != null && status == "finish") {
      url = api.API_CACHED_MATCHES_FINISH;
      param = null;
    } else if (global.CacheManager.getInstance().CACHE_ENABLED && status != null && status == "unfinish") {
      url = api.API_CACHED_MATCHES_UNFINISH;
      param = null;
    }
    new Request().get(url, param).then((data: any) => {
      const matchList = this.state.matchList;
      data.records = matchList.records.concat(data.records);
      this.setState({loadingmore: false, matchList: data})
      Taro.hideLoading()
    });
  }


  // 小程序上拉加载
  onReachBottom() {
    this.nextPage(this.state.currentTab);
  }

  // onScroll = (e) => {
  //   if (this.scrollTop - e.detail.scrollTop <= 0) {
  //     if (this.tabsY - e.detail.scrollTop < 0) {
  //       this.setState({tabsClass: "qz-match__top-tabs__content--fixed"});
  //     }
  //   } else {
  //     if (this.tabsY - e.detail.scrollTop >= 0) {
  //       this.setState({tabsClass: ""});
  //     }
  //   }
  //   this.scrollTop = e.detail.scrollTop;
  // }

  render() {
    const {matchList} = this.state
    let tabList = [{title: '比赛中'}, {title: '完赛'}]

    return (
      <View className='qz-match-scroll-content'>
        <View className='qz-match-content'>
          <View className='qz-match-content-search' onClick={this.onSearchClick}>
            <AtSearchBar
              value={this.state.searchText}
              onChange={this.onSearchChange}
              disabled
              className='qz-match-content-search-bar'
            />
          </View>
          <View className='qz-match-tabs'>
            <AtTabs current={this.state.currentTab}
                    className="qz-match__top-tabs__content qz-custom-tabs qz-match__top-tabs__content--fixed"
                    tabList={tabList}
                    onClick={this.switchTab.bind(this)}>
              <AtTabsPane current={this.state.currentTab} index={0}>
                <MatchList
                  matchList={matchList}
                  loading={this.state.loading}
                  loadingmore={this.state.loadingmore}
                  visible={this.state.currentTab == 0}
                  nextPage={this.nextPage}/>
              </AtTabsPane>
              <AtTabsPane current={this.state.currentTab} index={1}>
                <MatchList
                  matchList={matchList}
                  loading={this.state.loading}
                  loadingmore={this.state.loadingmore}
                  visible={this.state.currentTab == 1}
                  nextPage={this.nextPage}/>
              </AtTabsPane>
            </AtTabs>
          </View>
        </View>
      </View>
    )
  }
}

interface Match {
  props: IProps;
}

const mapStateToProps = (state) => {
  return {
    locationConfig: state.config.locationConfig,
  }
}
export default connect(mapStateToProps)(Match)
