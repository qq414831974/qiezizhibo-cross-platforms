import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtSearchBar, AtTabs, AtTabsPane} from "taro-ui"
import {connect} from 'react-redux'

import './match.scss'
import MatchList from "./components/match-list";
import withShare from "../../utils/withShare";
import * as global from "../../constants/global";
import * as api from "../../constants/api";
import Request from '../../utils/request'
import NavBar from "../../components/nav-bar";
// import withOfficalAccount from "../../utils/withOfficialAccount";

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

// @withOfficalAccount()
@withShare({})
class Match extends Component<IProps, PageState> {

  navRef: any = null;

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

  $setSharePath = () => `/pages/home/home?page=match`

  componentWillMount() {
  }

  componentDidMount() {
    // const query = Taro.createSelectorQuery();
    // query.select('.qz-match-tabs').boundingClientRect(rect => {
    //   this.tabsY = (rect as {
    //     left: number
    //     right: number
    //     top: number
    //     bottom: number
    //   }).top;
    // }).exec();
    this.switchTab(0);
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  onShareAppMessage() {}

  onShareTimeline() {}

  onPullDownRefresh = () => {
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
    if (global.CacheManager.getInstance().CACHE_ENABLED && status != null && status == "finish") {
      url = api.API_CACHED_MATCHES_FINISH;
    } else if (global.CacheManager.getInstance().CACHE_ENABLED && status != null && status == "unfinish") {
      url = api.API_CACHED_MATCHES_UNFINISH;
    }
    new Request().get(url, {
      status: status,
      pageNum: 1,
      pageSize: 10,
      sortOrder: orderby,
      isActivity: true,
      province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null
    }).then((data: any) => {
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
    if (this.state.matchList.current == null) {
      return;
    }
    this.setState({loadingmore: true})
    new Request().get(api.API_MATCHES, {
      status: status,
      pageNum: this.state.matchList.current + 1,
      pageSize: 10,
      sortOrder: orderby,
      isActivity: true,
      province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null
    }).then((data: any) => {
      const matchList = this.state.matchList;
      data.records = matchList.records.concat(data.records);
      this.setState({loadingmore: false, matchList: data})
      Taro.hideLoading()
    });
  }


  // 小程序上拉加载
  onReachBottom = () => {
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
        <NavBar
          title='茄子TV'
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-match-content-search' onClick={this.onSearchClick}>
          <AtSearchBar
            value={this.state.searchText}
            onChange={this.onSearchChange}
            disabled
            className='qz-match-content-search-bar'
          />
        </View>
        <View className='qz-match-content'>
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
