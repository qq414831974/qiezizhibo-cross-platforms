import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtLoadMore, AtActivityIndicator} from 'taro-ui'
import LeagueItem from '../../../../components/league-item'

import './index.scss'

type PageStateProps = {
  league: any;
  searchKey: string;
  isBeenSearch: boolean;
  loading: boolean;
  loadingmore: boolean;
  switchTab: (tab: number) => any;
  visible: boolean;
  nextPage: (tab: number) => any;
  currentTab: number;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface SearchLeague {
  props: IProps;
}

class SearchLeague extends Component<PageOwnProps, PageState> {
  static defaultProps = {}
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '搜索',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  constructor(props) {
    super(props)
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

  onLeagueItemClick = (item) => {
    if (item.isParent) {
      Taro.navigateTo({url: `../series/series?id=${item.id}`});
    } else {
      Taro.navigateTo({url: `../leagueManager/leagueManager?id=${item.id}`});
    }
  }

  render() {
    const {league, isBeenSearch = false, loading = false, visible = false, loadingmore = false} = this.props
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-search__result-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }
    if (league && (league.total <= 0 || league.total == null)) {
      return <AtLoadMore status="noMore" noMoreText={isBeenSearch ? "什么都没找到..." : (loading ? "加载中..." : "搜一下")}/>
    }
    let loadingmoreStatus: any = "more";
    if (loadingmore) {
      loadingmoreStatus = "loading";
    } else if (league.records && (league.total <= league.records.length)) {
      loadingmoreStatus = "noMore"
    }

    return (
      <View className='qz-search__result'>
        {league && league.total > 0 ? (
          <View className='qz-search__result-content'>
            <View className='qz-search__result-content__inner'>
              {league.records.map((item) => (
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

export default SearchLeague
