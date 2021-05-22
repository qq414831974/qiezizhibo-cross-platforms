import Taro from '@tarojs/taro'
import {Component} from 'react'
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

class MatchList extends Component<IProps, PageState> {
  static defaultProps = {}

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
