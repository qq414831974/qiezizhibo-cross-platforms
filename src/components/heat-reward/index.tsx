import Taro, {Component} from '@tarojs/taro'
import {View, ScrollView, Image} from '@tarojs/components'
import {AtActivityIndicator} from 'taro-ui'
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  heatRule: any;
  loading: boolean;
  hidden: boolean;
}

type PageState = {
  current: number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface HeatReward {
  props: IProps;
}

class HeatReward extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      current: 0
    }
  }

  render() {
    const {heatRule = null, loading = true, hidden = false} = this.props
    if (hidden) {
      return <View/>
    }

    return (
      <ScrollView scrollY className="qz-heatreward">
        {loading ?
          <View className="qz-heatreward-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
          :
          <View>
            {heatRule.award ? <View className='qz-heatreward-title'>{heatRule.award}</View> : null}
            <Image
              className='qz-heatreward-img'
              src={heatRule.awardPic}
              mode="widthFix"/>
          </View>
        }
      </ScrollView>
    )
  }
}

export default HeatReward
