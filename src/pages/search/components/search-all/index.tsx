import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Text} from '@tarojs/components'
import {AtAvatar, AtLoadMore, AtActivityIndicator} from 'taro-ui'
import MatchItem from '../../../../components/match-item'

import './index.scss'

const eventType: { [key: number]: { text: string, color: string }; } = {}
eventType[-1] = {text: "未开始", color: "unopen"};
eventType[0] = {text: "比赛中", color: "live"};
eventType[11] = {text: "加时", color: "live"};
eventType[12] = {text: "点球大战", color: "live"};
eventType[13] = {text: "伤停", color: "live"};
eventType[14] = {text: "中场", color: "live"};
eventType[15] = {text: "下半场", color: "live"};
eventType[16] = {text: "暂停", color: "live"};
eventType[21] = {text: "比赛结束", color: "finish"};

type PageStateProps = {
  league: any;
  match: any;
  player: any;
  searchKey: string;
  isBeenSearch: boolean;
  loading: boolean;
  switchTab: (tab: number) => any;
  visible: boolean;
  currentTab: number;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface SearchAll {
  props: IProps;
}

class SearchAll extends Component<IProps, PageState> {
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

  onLeagueMoreClick = () => {
    this.props.switchTab(1);
  }

  onMatchMoreClick = () => {
    this.props.switchTab(2);
  }

  onLeagueItemClick = (item) => {
    if (item.isParent) {
      Taro.navigateTo({url: `../series/series?id=${item.id}`});
    } else {
      Taro.navigateTo({url: `../leagueManager/leagueManager?id=${item.id}`});
    }
  }

  onMatchItemClick = (item) => {
    Taro.navigateTo({url: `../live/live?id=${item.id}`});
  }
  onMatchItemBetClick = (item) => {
    Taro.navigateTo({url: `../bet/bet?id=${item.id}`});
  }

  render() {
    const {league, match, player, isBeenSearch = false, loading = false, visible = false} = this.props
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-search__result-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }
    if ((league && (league.total <= 0 || league.total == null)) && (match && (match.total <= 0 || match.total == null))) {
      return <AtLoadMore status="noMore" noMoreText={isBeenSearch ? "什么都没找到..." : (loading ? "加载中..." : "搜一下")}/>
    }
    return (
      <View className='qz-search__result'>
        {league && league.total > 0 ? (
            <View className='qz-search__result-league'>
              <View className='qz-search__result-league-title' onClick={this.onLeagueMoreClick}>
                <Text className='qz-search__result-league-title-desc'>联赛</Text>
                <Text className='qz-search__result-league-title-count'>{league.total}</Text>
                <Text className='qz-search__result-league-title-more'>{`更多>`}</Text>
              </View>
              <View className='qz-search__result-league-content'>
                <View className='qz-search__result-league-content__inner'>
                  {league.records.map((item, index) => {
                    if (index >= 5) {
                      return
                    }
                    return <View key={item.id} className="qz-search__result-league-item"
                                 onClick={this.onLeagueItemClick.bind(this, item)}>
                      <View className="qz-search__result-league-item-avatar">
                        <AtAvatar circle
                                  size="large"
                                  image={item.headImg}/>
                      </View>
                      <Text
                        className="qz-search__result-league-item-name">{item.shortName ? item.shortName : item.name}
                      </Text>
                    </View>
                  })}
                </View>
              </View>
            </View>)
          : null
        }
        {match && match.total > 0 ? (
            <View className='qz-search__result-match'>
              <View className='qz-search__result-match-title' onClick={this.onMatchMoreClick}>
                <Text className='qz-search__result-match-title-desc'>比赛</Text>
                <Text className='qz-search__result-match-title-count'>{match.total}</Text>
                <Text className='qz-search__result-match-title-more'>{`更多>`}</Text>
              </View>
              <View className='qz-search__result-match-content'>
                <View className='qz-search__result-match-content__inner'>
                  {match.records.map((item, index) => {
                    if (index >= 5) {
                      return
                    }
                    return <MatchItem key={item.id}
                                      matchInfo={item}
                                      onBetClick={this.onMatchItemBetClick.bind(this, item)}
                                      onClick={this.onMatchItemClick.bind(this, item)}/>
                  })}
                </View>
              </View>
            </View>)
          : null
        }
        {player && player.total > 0 ? (
            <View className='qz-search__result-match'>
              <View className='qz-search__result-match-title'>
                <Text>球员</Text>
              </View>
              <View className='qz-search__result-match-content'>
                <View className='qz-search__result-match-content__inner'>
                </View>
              </View>
            </View>)
          : null
        }
      </View>
    )
  }
}

export default SearchAll
