import Taro, {Component, Config} from '@tarojs/taro'
import {View,ScrollView} from '@tarojs/components'
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
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeaguePlayerTable {
  props: IProps | any;
}

class LeaguePlayerTable extends Component<PageOwnProps | any, PageState> {
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
      <ScrollView scrollY className='qz-league-player-table__result'>
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
