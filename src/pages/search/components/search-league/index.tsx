import Taro from '@tarojs/taro'
import {Component} from 'react'
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

class SearchLeague extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
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
