import Taro, {Component, Config} from '@tarojs/taro'
import {AtActivityIndicator} from "taro-ui"
import {View} from '@tarojs/components'
import MatchItem from '../../../../components/match-item'

import './index.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  matchList: any;
  loading: boolean;
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

  render() {
    const {matchList = [], loading = false} = this.props
    if (loading) {
      return <View className="qz-match-list-loading">
        <AtActivityIndicator mode="center" content="加载中..."/>
      </View>
    }
    return <View className='qz-match-list'>
      {matchList.map((item) => (
        <View key={item.id} className='qz-match-list-content'>
          <View className='qz-match-list-content__inner'>
            <MatchItem key={item.id} matchInfo={item} onClick={this.onMatchItemClick.bind(this, item)}/>
          </View>
        </View>))}
    </View>
  }
}

export default MatchList
