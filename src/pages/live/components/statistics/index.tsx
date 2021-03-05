import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import './index.scss'
import StatBar from '../stat-bar';

const statisticsType = [

  //hidden==true 不显示， require==false不一定显示， method 显示的方法， text 描述， key 字段名
  {
    key: 'shoot_bar',
    text: '射在门框',
    hidden: true
  }, //射在门框
  {
    key: 'shoot_blocked',
    text: '射门被拦截',
    hidden: true
  }, //射门被拦截
  {
    key: 'shoot_outside',
    text: '射偏',
    hidden: true
  }, //射偏

  {
    method: '%',
    key: 'pass',
    text: '传球率',
    require: false
  }, //传球率
  {
    method: '%',
    key: 'possession',
    text: '控球率',
    require: false
  }, //控球率
  {
    key: 'shoot',
    text: '射门',
    require: true
  }, //射门
  {
    method: '/',
    key: ['shoot_ontarget', 'shoot'],
    text: '射正率',
    require: false
  }, //射正
  {
    key: 'offside',
    text: '越位',
    require: true
  }, //越位
  {
    key: 'tackle',
    text: '抢断',
    require: false
  }, //抢断
  {
    method: '/',
    key: ['tackle_success', 'tackle'],
    text: '抢断成功率',
    require: false
  }, //抢断成功率
  {
    key: 'free_kick',
    text: '任意球',
    require: true
  }, //任意球
  {
    key: 'foul',
    text: '犯规',
    require: true
  }, //犯规
  {
    key: 'save',
    text: '扑救',
    require: false
  }, //扑救
  {
    key: 'corner',
    text: '角球',
    require: true
  }, //角球
  {
    key: 'cross',
    text: '传中',
    require: false
  }, //传中
  {
    method: '/',
    key: ['cross_success', 'cross'],
    text: '传中成功率',
    require: false
  }, //传中成功率
  {
    key: 'long_pass',
    text: '长传',
    require: false
  }, //长传
  {
    key: 'clearance',
    text: '解围',
    require: false
  }, //解围
  {
    key: 'yellow',
    text: '黄牌',
    require: true
  }, //黄牌
  {
    key: 'red',
    text: '红牌',
    require: false
  }, //红牌
  {
    key: 'goal',
    text: '进球',
    require: true
  }, //进球
  {
    key: 'penalty_kick',
    text: '点球',
    require: true
  }, //点球
]

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  statistics: [];
  matchInfo: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Statistics {
  props: IProps;
}

class Statistics extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  getStatisticsValue = (item, statistics, matchInfo): any => {
    const key = item.key;
    const require = item.require;
    const method = item.method;
    let hostvalue = 0;
    let guestvalue = 0;
    let hostStatistics = statistics[matchInfo.hostTeam.id];
    let guestStatistics = statistics[matchInfo.guestTeam.id];
    if (method == '/') {
      if (!require && hostStatistics[key[0]] == null && guestStatistics[key[0]] == null) {
        return null
      }
      if (hostStatistics[key[0]] == 0 || hostStatistics[key[0]] == null ||
        hostStatistics[key[1]] == 0 || hostStatistics[key[1]] == null) {
        hostvalue = 0;
      } else {
        hostvalue = hostStatistics[key[0]] / hostStatistics[key[1]];
      }
      if (guestStatistics[key[0]] == 0 || guestStatistics[key[0]] == null ||
        guestStatistics[key[1]] == 0 || guestStatistics[key[1]] == null) {
        guestvalue = 0;
      } else {
        guestvalue = guestStatistics[key[0]] / guestStatistics[key[1]];
      }
    } else {
      hostvalue = hostStatistics ? (hostStatistics[key] == null ? 0 : hostStatistics[key]) : 0;
      guestvalue = guestStatistics ? (guestStatistics[key] == null ? 0 : guestStatistics[key]) : 0;
    }
    let host = 0;
    let guest = 0;
    if (method == '%') {
      host = hostvalue;
      guest = guestvalue;
    } else if (hostvalue == 0 && guestvalue == 0) {
      host = 0;
      guest = 0;
    } else if (hostvalue == 0 && guestvalue != 0) {
      host = 0;
      guest = 100;
    } else if (hostvalue != 0 && guestvalue == 0) {
      host = 100;
      guest = 0;
    } else {
      host = hostvalue / (hostvalue + guestvalue) * 100;
      guest = guestvalue / (hostvalue + guestvalue) * 100;
    }
    return {hostvalue, guestvalue, host, guest}
  }
  getStatisticsList = (statistics, matchInfo) => {
    if (matchInfo.hostTeamId == null || matchInfo.guestTeamId == null) {
      return
    }
    let list: Array<any> = [];
    statisticsType.map((item: any) => {
      if ((statistics[matchInfo.hostTeamId] && statistics[matchInfo.hostTeamId][item.key])
        || (statistics[matchInfo.guestTeamId] && statistics[matchInfo.guestTeamId][item.key])) {
        if (!item.hidden) {
          const temp = this.getStatisticsValue(item, statistics, matchInfo)
          temp && list.push({...item,...temp});
        }
      }
    })
    return list;
  }

  render() {
    const {statistics = [], matchInfo = {}} = this.props
    const list = this.getStatisticsList(statistics, matchInfo);
    return (
      <View>
        {list && list.map((item: any, index) => {
          const {hostvalue = 0, guestvalue = 0, host = 0} = item;
          return (
            <View key={index} className="qz-statistics-item">
              <View className="qz-statistics-item-text">
                <Text className="qz-statistics-item-text-title">{item.text}</Text>
                <Text className="qz-statistics-item-text-host">{hostvalue}</Text>
                <Text className="qz-statistics-item-text-guest">{guestvalue}</Text>
              </View>
              <View className="qz-statistics-item-stat">
                <StatBar percent={host}/>
              </View>
            </View>
          )
        })}
      </View>
    )
  }
}

export default Statistics
