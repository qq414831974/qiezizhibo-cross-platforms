import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtLoadMore, AtActivityIndicator} from 'taro-ui'
import MatchItem from '../../../../components/match-item'

import './index.scss'

type PageStateProps = {
  match: any;
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

interface SearchMatch {
  props: IProps;
}

class SearchMatch extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state={}
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

  onMatchItemClick = (item) => {
    Taro.navigateTo({url: `../live/live?id=${item.id}`});
  }
  onMatchItemBetClick = (item) => {
    Taro.navigateTo({url: `../bet/bet?id=${item.id}`});
  }

  render() {
    const {match, isBeenSearch = false, loading = false, visible = false, loadingmore = false} = this.props
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-search__result-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }
    if (match && (match.total <= 0 || match.total == null)) {
      return <AtLoadMore status="noMore" noMoreText={isBeenSearch ? "什么都没找到..." : (loading ? "加载中..." : "搜一下")}/>
    }
    let loadingmoreStatus: any = "more";
    if (loadingmore) {
      loadingmoreStatus = "loading";
    } else if (match.records && (match.total <= match.records.length)) {
      loadingmoreStatus = "noMore"
    }
    return (
      <View className='qz-search__result'>
        {match && match.total > 0 ? (
          <View className='qz-search__result-content'>
            <View className='qz-search__result-content__inner'>
              {match.records.map((item) => (
                <MatchItem key={item.id}
                           matchInfo={item}
                           onBetClick={this.onMatchItemBetClick.bind(this, item)}
                           onClick={this.onMatchItemClick.bind(this, item)}/>
              ))}
            </View>
          </View>
        ) : null}
        <AtLoadMore status={loadingmoreStatus} loadingText="加载中..."/>
      </View>
    )
  }
}

export default SearchMatch
