import {Component} from 'react'
import {View, ScrollView} from '@tarojs/components'
import {connect} from 'react-redux'
import {AtActivityIndicator, AtTabs, AtTabsPane} from 'taro-ui'
import MatchList from '../match-list'

import './index.scss'
import matchAction from "../../../../actions/match";
import * as global from "../../../../constants/global";

type PageStateProps = {
  matchList?: any;
}

type PageDispatchProps = {}

type PageOwnProps = {
  leagueMatch: any;
  loading: boolean;
  visible: boolean;
  tabScrollStyle: any;
  tabContainerStyle: any;
}

type PageState = {
  currentTab: number;
  matchLoading: boolean;
  matchLoadingMore: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueManagerMatches {
  props: IProps;
}

class LeagueManagerMatches extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      currentTab: 0,
      matchLoading: false,
      matchLoadingMore: false,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    // this.switchTab(0);
    let {leagueMatch = {}} = this.props
    let tabList = leagueMatch.round && leagueMatch.round.rounds ? leagueMatch.round.rounds : []
    if (leagueMatch.currentRound) {
      let index = tabList.indexOf(leagueMatch.currentRound);
      if (index < 0) {
        index = 0;
      }
      this.switchTab(index);
    } else {
      this.switchTab(0);
    }
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
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

  // 小程序上拉加载
  onReachBottom = () => {
    this.nextPage(this.state.currentTab);
  }

  getTabList = (list: []) => {
    let res: Array<any> = [];
    for (let i = 0; i < list.length; i++) {
      res.push({title: list[i], index: i})
    }
    return res;
  }
  nextPage = (tab) => {
    if (global.CacheManager.getInstance().CACHE_ENABLED) {
      return;
    }
    if (this.state.matchLoadingMore) {
      return;
    }
    if (typeof (tab) != 'number') {
      tab = this.state.currentTab
    }
    let orderby = "asc"
    let {leagueMatch = {round: {rounds: []}}} = this.props
    let tabList = this.getTabList(leagueMatch.round ? leagueMatch.round.rounds : [])
    if (this.props.matchList.current == null) {
      return;
    }
    this.setState({matchLoadingMore: true})
    matchAction.getMatchList_add({
      pageNum: this.props.matchList.current + 1,
      pageSize: 5,
      sortOrder: orderby,
      leagueId: leagueMatch.id,
      round: tabList[tab].title
    }).then(() => {
      this.setState({matchLoadingMore: false})
    })
  }
  getMatchList = () => {
    let orderby = "asc"
    let {leagueMatch = {round: {rounds: []}}} = this.props
    let tabList = this.getTabList(leagueMatch.round ? leagueMatch.round.rounds : [])
    this.setState({matchLoading: true})
    matchAction.getMatchList({
      pageNum: 1,
      pageSize: 5,
      sortOrder: orderby,
      leagueId: leagueMatch.id,
      round: tabList[this.state.currentTab].title
    }).then(() => {
      this.setState({matchLoading: false})
    });
  }

  render() {
    const {loading = false, visible = false, leagueMatch = {round: {rounds: []}}, matchList = []} = this.props
    let tabList = this.getTabList(leagueMatch.round ? leagueMatch.round.rounds : [])
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-league-manager-matches__result-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-league-manager-matches__result' style={this.props.tabContainerStyle}>
        <AtTabs
          scroll
          swipeable
          current={this.state.currentTab}
          tabList={tabList}
          className="qz-bottom-tabs"
          onClick={this.switchTab}>
          {tabList.map((item: any) => {
            return <AtTabsPane current={this.state.currentTab} index={item.index} key={`pane-${item.index}`}>
              <ScrollView scrollY style={this.props.tabScrollStyle} onScrollToLower={this.onReachBottom}>
                <MatchList
                  showRound={item.title === "决赛"}
                  loading={this.state.matchLoading}
                  visible={this.state.currentTab == item.index}
                  loadingmore={this.state.matchLoadingMore}
                  nextPage={this.nextPage}
                  matchList={matchList}
                />
              </ScrollView>
            </AtTabsPane>
          })}
        </AtTabs>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    matchList: state.match.matchList,
  }
}
export default connect(mapStateToProps)(LeagueManagerMatches)
