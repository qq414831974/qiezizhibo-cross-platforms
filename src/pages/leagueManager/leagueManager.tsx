import Taro, {Component, Config} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {AtActivityIndicator, AtTabs, AtTabsPane} from "taro-ui"
import {connect} from '@tarojs/redux'
import defaultLogo from '../../assets/default-logo.png'

import './leagueManager.scss'
import leagueAction from "../../actions/league";
import LeagueManagerMatches from "./components/league-manager-matches"
import LeagueTeamTable from "./components/league-team-table"
import LeaguePlayerTable from "./components/league-player-table";
import LeagueRegulations from "./components/league-regulations";
import withShare from "../../utils/withShare";
import * as global from "../../constants/global";
import { random_weight} from "../../utils/utils";

type PageStateProps = {
  leagueTeams: any;
  leaguePlayers: any;
  league: any;
  locationConfig: { city: string, province: string }
  shareSentence: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loadingmore: boolean;
  loading: boolean;
  tabloading: boolean;
  currentTab: number;
  tabsClass: string;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueManager {
  props: IProps;
}

@withShare({})
class LeagueManager extends Component<PageOwnProps, PageState> {
  tabsY: number;
  scrollTop: number;
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '茄子体育',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  constructor(props) {
    super(props)
    this.state = {
      loadingmore: false,
      loading: false,
      tabloading: false,
      currentTab: 1,
      tabsClass: '',
    }
  }

  $setSharePath = () => `/pages/home/home?id=${this.props.league.id}&page=leagueManager`

  $setShareTitle = () => {
    const shareSentence = random_weight(this.props.shareSentence.filter(value => value.type == global.SHARE_SENTENCE_TYPE.league).map(value => {
      return {...value, weight: value.weight + "%"}
    }));
    if (shareSentence == null) {
      return this.props.league.name
    }
    return shareSentence.sentence;
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getParamId() && this.getLeagueList(this.getParamId());
    const query = Taro.createSelectorQuery();
    query.select('.qz-league-manager-tabs').boundingClientRect(rect => {
      this.tabsY = (rect as {
        left: number
        right: number
        top: number
        bottom: number
      }).top;
    }).exec();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getParamId = () =>{
    let id;
    if(this.$router.params){
      if(this.$router.params.id == null){
        id = this.$router.params.scene
      }else{
        id = this.$router.params.id
      }
    }else{
      return null;
    }
    return id;
  }
  getLeagueList = (id) => {
    this.setState({loading: true})
    Taro.showLoading({title: global.LOADING_TEXT})
    Promise.all([
      leagueAction.getLeagueInfo({id: id, detailRound: true}),
      leagueAction.getLeagueTeam({leagueId: id}),
      leagueAction.getLeaguePlayer({leagueId: id, goal: true}),
      leagueAction.getLeagueReport(id),
    ]).then(() => {
      this.setState({loading: false})
      Taro.hideLoading();
    });
  }
  switchTab = (tab) => {
    // const onSearch = this.onSearch;
    this.setState({
      currentTab: tab
    }, () => {
      // onSearch();
    })
    // this.setState({
    //   currentTab: tab
    // });
  }

  render() {
    const {leaguePlayers, leagueTeams, league} = this.props
    let tabList = [{title: '规程'}, {title: '赛程'}]
    let tabIndex = 1;
    const tabs: Array<any> = [];
    if (league.showleagueteam) {
      tabList.push({title: '积分榜'})
      tabIndex = tabIndex + 1;
      tabs[3] = tabIndex;
    }
    if (league.showleagueplayer) {
      tabList.push({title: '射手榜'})
      tabIndex = tabIndex + 1;
      tabs[4] = tabIndex;
    }
    if (this.state.loading) {
      return <View className="qz-league-manager-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }

    return (
      <View className='qz-league-manager-content'>
        <View className='qz-league-manager-header'>
          {league &&
          <View className='qz-league-manager-header-container'>
            <Image className="img"
                   src={league.headImg ? league.headImg : defaultLogo}/>
            <View className='text'>{league.shortname ? league.shortname : league.name}</View>
          </View>
          }
        </View>

        <View className='qz-league-manager-tabs'>
          {league && league.round &&
          <AtTabs
            swipeable={false}
            className='qz-league-manager__top-tabs__content qz-custom-tabs'
            current={this.state.currentTab}
            tabList={tabList}
            onClick={this.switchTab}>
            <AtTabsPane current={this.state.currentTab} index={0}>
              <LeagueRegulations
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == 0}/>
            </AtTabsPane>
            <AtTabsPane current={this.state.currentTab} index={1}>
              <LeagueManagerMatches
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == 1}/>
            </AtTabsPane>
            {league.showleagueteam && <AtTabsPane current={this.state.currentTab} index={tabs[3]}>
              <LeagueTeamTable
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[3]}
                teamGroup={leagueTeams}/>
            </AtTabsPane>}
            {league.showleagueplayer && <AtTabsPane current={this.state.currentTab} index={tabs[4]}>
              <LeaguePlayerTable
                leagueMatch={league}
                loading={this.state.tabloading}
                visible={this.state.currentTab == tabs[4]}
                playerList={leaguePlayers}/>
            </AtTabsPane>}
          </AtTabs>}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    leaguePlayers: state.league.leaguePlayers,
    leagueTeams: state.league.leagueTeams,
    league: state.league.league,
    locationConfig: state.config.locationConfig,
    shareSentence: state.config ? state.config.shareSentence : [],
  }
}
export default connect(mapStateToProps)(LeagueManager)
