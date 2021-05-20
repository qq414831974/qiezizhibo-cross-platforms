import Taro, {Component, Config} from '@tarojs/taro'
import {View, Image,ScrollView} from '@tarojs/components'
import {AtActivityIndicator} from 'taro-ui'

import './index.scss'
import logo from "../../../../assets/default-logo.png";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  leagueMatch: any;
  teamGroup: any;
  loading: boolean;
  visible: boolean;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueTeamTable {
  props: IProps | any;
}

class LeagueTeamTable extends Component<PageOwnProps | any, PageState> {
  static defaultProps = {}
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

  getTeamGroupList = (teamGroups) => {
    let list: Array<any> = [];
    const groups: Array<any> = Object.keys(teamGroups).sort();
    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];
      if (group !== '无分组') {
        list.push({group: group, team: teamGroups[group], index: i})
      }
    }
    return list;
  }

  render() {
    const {loading = false, visible = false, teamGroup = {}} = this.props
    const teamGroupList = this.getTeamGroupList(teamGroup);
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-league-team-table__result-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <ScrollView scrollY className='qz-league-team-table__result' style={this.props.tabScrollStyle}>
        <View className='qz-league-team-table__result-header'>
          <View>积分</View>
          <View>进/失</View>
          <View>负</View>
          <View>平</View>
          <View>胜</View>
          <View>赛</View>
        </View>
        <View className='qz-league-team-table__result-content'>
          {teamGroupList.map((group => {
            return (
              <View className='qz-league-team-table__container' key={`group-${group.index}`}>
                <View
                  className={teamGroup["default"] ? "qz-league-team-table__header-none" : "qz-league-team-table__header"}>
                  {group.group}
                </View>
                <View className='qz-league-team-table__list'>
                  {group.team.map((teamInfo => {
                    return (
                      <View className='qz-league-team-table__list-item' key={`item-${teamInfo.teamId}`}>
                        <View className='qz-league-team-table__list-item__no'>
                          {`${group.team.indexOf(teamInfo) + 1}.`}
                        </View>
                        <View className='qz-league-team-table__list-item__team'>
                          <Image className='qz-league-team-table__list-item__team-img'
                                 src={teamInfo.team ? teamInfo.team.headImg : logo}/>
                          <View className='qz-league-team-table__list-item__team-name'>
                            {teamInfo.team ? teamInfo.team.name : "队伍"}
                          </View>
                        </View>
                        <View className='qz-league-team-table__list-item__point'>{teamInfo.matchTotal}</View>
                        <View className='qz-league-team-table__list-item__point'>{teamInfo.matchWin}</View>
                        <View className='qz-league-team-table__list-item__point'>{teamInfo.matchDraw}</View>
                        <View className='qz-league-team-table__list-item__point'>{teamInfo.matchLost}</View>
                        <View className='qz-league-team-table__list-item__point'>
                          {`${teamInfo.totalGoal}/${teamInfo.totalGoalLost}`}
                        </View>
                        <View className='qz-league-team-table__list-item__point'>{teamInfo.ranks}</View>
                      </View>
                    )
                  }))}
                </View>
              </View>
            )
          }))}
        </View>
      </ScrollView>
    )
  }
}

export default LeagueTeamTable
