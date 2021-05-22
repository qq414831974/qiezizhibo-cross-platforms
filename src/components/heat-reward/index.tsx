import {Component} from 'react'
import {View, Image, Button} from '@tarojs/components'
import {AtActivityIndicator, AtModal, AtModalContent, AtModalAction} from "taro-ui"
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = {
  heatRule: any;
  loading: boolean;
  isOpened: boolean,
}

type PageState = {
  current: number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface HeatReward {
  props: IProps;
}

class HeatReward extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      current: 0,
    }
  }

  render() {
    const {isOpened = false, heatRule = null, loading = true, handleCancel} = this.props

    return (
      <View>
        <AtModal className="at-modal-huge" isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-heatreward">
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
            </View>
          </AtModalContent> : null}
          <AtModalAction>
            <Button className="mini-gray" onClick={handleCancel}>关闭</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default HeatReward
