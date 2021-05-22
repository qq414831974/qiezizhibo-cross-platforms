import {Component} from 'react'
import {View, ScrollView} from '@tarojs/components'
import {AtActivityIndicator, AtList, AtListItem} from 'taro-ui'

import './index.scss'
import logo from "../../../../assets/no-person.png";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  leagueMatch: any;
  playerList: any;
  loading: boolean;
  visible: boolean;
  tabScrollStyle: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeaguePlayerTable {
  props: IProps;
}

class LeaguePlayerTable extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      leagueMatch: null,
      playerList: null,
      loading: false,
      visible: false,
    }
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

  render() {
    const {loading = false, visible = false, playerList = []} = this.props
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-league-player-table__result-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <ScrollView scrollY className='qz-league-player-table__result' style={this.props.tabScrollStyle}>
        <View className='qz-league-player-table__result-header'>
          <View>球员</View>
          <View>进球</View>
        </View>
        <AtList>
          {playerList.map((player => {
            return <AtListItem
              key={`player-${player.playerId}`}
              title={player.player ? player.player.name : "无名"}
              note={player.team ? player.team.name : null}
              thumb={player.player && player.player.headImg ? player.player.headImg : logo}
              extraText={`${player.goal ? player.goal : 0}`}
            />
          }))}
        </AtList>
      </ScrollView>
    )
  }
}

export default LeaguePlayerTable
