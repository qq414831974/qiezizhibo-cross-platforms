import Taro, {Component, Config} from '@tarojs/taro'
import {View, ScrollView} from '@tarojs/components'
import {AtSearchBar, AtTabs, AtTabsPane} from "taro-ui"
import {connect} from '@tarojs/redux'
import matchAction from "../../actions/match";

import './match.scss'
import MatchList from "./components/match-list";
import withShare from "../../utils/withShare";
import * as global from "../../constants/global";

type Bulletin = {
  id: number,
  content: string,
  type: string,
  url: string
}

type PageStateProps = {
  matchList: any;
  locationConfig: { city: string, province: string }
  bulletinConfig: Array<Bulletin>,
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  searchText: string;
  currentTab: number;
  loadingmore: boolean;
  loading: boolean;
  tabsClass: string;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Match {
  props: IProps;
}

@withShare({})
class Match extends Component<PageOwnProps, PageState> {

  scrollTop: number;
  tabsY: number;
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
  }

  componentWillMount() {
  }

  componentDidMount() {
    const query = Taro.createSelectorQuery();
    query.select('.qz-match-tabs').boundingClientRect(rect => {
      this.tabsY = (rect as {
        left: number
        right: number
        top: number
        bottom: number
      }).top;
    }).exec();
    this.switchTab(0);
  }

  componentWillUnmount() {
  }

  componentDidShow() {
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
    const {bulletinConfig} = this.props
    const weihu = bulletinConfig && bulletinConfig.length > 0 && bulletinConfig[0].content === "升级维护中";
    switch (this.state.currentTab) {
      case 0:
        status = weihu ? "finish" : "unfinish";
        orderby = "asc";
        break;
      case 1:
        status = "finish"
        orderby = "desc";
        break;
    }
    this.setState({loading: true})
    matchAction.getMatchList({
      status: status,
      pageNum: 1,
      pageSize: 10,
      sortOrder: orderby,
      isActivity: true,
      areatype: 2,
    }).then(() => {
      this.setState({loading: false})
    });
  }
  nextPage = (tab) => {
    if (global.CacheManager.getInstance().CACHE_ENABLED) {
      return;
    }
    if (typeof(tab) != 'number') {
      tab = this.state.currentTab
    }
    let status = "unfinish"
    let orderby = "desc"
    const {bulletinConfig} = this.props
    const weihu = bulletinConfig && bulletinConfig.length > 0 && bulletinConfig[0].content === "升级维护中";
    switch (tab) {
      case 0:
        status = weihu ? "finish" : "unfinish";
        orderby = "asc";
        break;
      case 1:
        status = "finish"
        orderby = "desc";
        break;
    }
    this.setState({loadingmore: true})
    matchAction.getMatchList_add({
      status: status,
      pageNum: this.props.matchList.current + 1,
      pageSize: 10,
      sortOrder: orderby,
      isActivity: true,
      areatype: 2,
    }).then(() => {
      this.setState({loadingmore: false})
    })
  }

  // 小程序上拉加载
  onReachBottom() {
    this.nextPage(this.state.currentTab);
  }

  onScroll = (e) => {
    if (this.scrollTop - e.detail.scrollTop <= 0) {
      if (this.tabsY - e.detail.scrollTop < 0) {
        this.setState({tabsClass: "qz-match__top-tabs__content--fixed"});
      }
    } else {
      if (this.tabsY - e.detail.scrollTop >= 0) {
        this.setState({tabsClass: ""});
      }
    }
    this.scrollTop = e.detail.scrollTop;
  }

  render() {
    const {matchList, bulletinConfig} = this.props
    let tabList = [{title: '比赛中'}, {title: '完赛'}]
    const weihu = bulletinConfig && bulletinConfig.length > 0 && bulletinConfig[0].content === "升级维护中";
    if (weihu) {
      tabList = [{title: '完赛'}]
    }
    return (
      <ScrollView scrollY onScroll={this.onScroll} onScrollToLower={this.onReachBottom}
                  className='qz-match-scroll-content'>
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
                    className={`qz-match__top-tabs__content qz-custom-tabs ${this.state.tabsClass}`}
                    tabList={tabList}
                    onClick={this.switchTab.bind(this)}>
              {!weihu && <AtTabsPane current={this.state.currentTab} index={0}>
                <MatchList
                  matchList={matchList}
                  loading={this.state.loading}
                  loadingmore={this.state.loadingmore}
                  visible={this.state.currentTab == 0}
                  nextPage={this.nextPage}/>
              </AtTabsPane>}
              <AtTabsPane current={this.state.currentTab} index={weihu ? 0 : 1}>
                <MatchList
                  matchList={matchList}
                  loading={this.state.loading}
                  loadingmore={this.state.loadingmore}
                  visible={this.state.currentTab == (weihu ? 0 : 1)}
                  nextPage={this.nextPage}/>
              </AtTabsPane>
            </AtTabs>
          </View>
        </View>
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    matchList: state.match.matchList,
    locationConfig: state.config.locationConfig,
    bulletinConfig: state.config ? state.config.bulletinConfig : null,
  }
}
export default connect(mapStateToProps)(Match)
