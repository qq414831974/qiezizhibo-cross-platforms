import Taro, {Component, Config} from '@tarojs/taro'
import {AtLoadMore, AtActivityIndicator} from "taro-ui"
import {View, Text} from '@tarojs/components'
import MatchItem from '../../../../components/match-item'
import {formatDate} from '../../../../utils/utils'
import Dictionary from '../../../../utils/dictionary'

import './index.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  matchList: any;
  loading: boolean;
  visible: boolean;
  loadingmore: boolean;
  nextPage: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MatchList {
  props: IProps;
}

class MatchList extends Component<PageOwnProps, PageState> {
  static defaultProps = {}
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '比赛',
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

  onMatchItemClick = (item) => {
    Taro.navigateTo({url: `../live/live?id=${item.id}`});
  }
  onMatchItemBetClick = (item) => {
    Taro.navigateTo({url: `../bet/bet?id=${item.id}`});
  }
  getMatchTimeList = (matchList) => {
    let matchTimeList: Dictionary = new Dictionary([]);
    let list: Array<string> = [];
    if (matchList && matchList.total > 0) {
      matchList.records.map((item) => {
        const startTime = formatDate(new Date(item.startTime));
        if (matchTimeList.containsKey(startTime)) {
          matchTimeList[startTime].push(item)
        } else {
          list = [];
          list.push(item);
          matchTimeList.add(startTime, list)
        }
      })
    }
    return matchTimeList;
  }

  render() {
    const {matchList, loading = false, visible = false, loadingmore = false, nextPage} = this.props
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-match-list-loading">
        <AtActivityIndicator mode="center" content="加载中..."/>
      </View>
    }
    if (matchList && (matchList.total <= 0 || matchList.total == null)) {
      return <AtLoadMore status="noMore" noMoreText={loading ? "加载中..." : "暂无比赛"} onClick={nextPage}/>
    }
    let loadingmoreStatus: any = "more";
    if (loadingmore) {
      loadingmoreStatus = "loading";
    } else if (matchList.records && (matchList.total <= matchList.records.length)) {
      loadingmoreStatus = "noMore"
    }
    const matchTimeList = this.getMatchTimeList(matchList);
    return <View className='qz-match-list'>
      {matchTimeList.keys().map((key) => (
        <View key={key} className='qz-match-list-content'>
          <View className='qz-match-list-content__inner'>
            <Text className="qz-match-list-time">{key}</Text>
            {matchTimeList[key].map((item) => (
              <MatchItem key={item.id}
                         matchInfo={item}
                         onlytime
                         onBetClick={this.onMatchItemBetClick.bind(this, item)}
                         onClick={this.onMatchItemClick.bind(this, item)}/>
            ))}
          </View>
        </View>))}
      <AtLoadMore status={loadingmoreStatus} loadingText="加载中..." onClick={nextPage}/>
    </View>
  }
}

export default MatchList
