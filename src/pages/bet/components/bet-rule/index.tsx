import {Component} from 'react'
import {View, Image, Button} from '@tarojs/components'
import {AtActivityIndicator, AtModal, AtModalContent, AtModalAction} from "taro-ui"
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = {
  betRule: any;
  loading: boolean;
  isOpened: boolean,
}

type PageState = {
  current: number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface BetRule {
  props: IProps;
}

class BetRule extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      current: 0,
    }
  }

  render() {
    const {isOpened = false, betRule = null, loading = true, handleCancel} = this.props

    return (
      <View>
        <AtModal className="at-modal-huge" isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-bet-rule">
              {loading ?
                <View className="qz-bet-rule-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
                :
                <View>
                  {betRule.award ? <View className='qz-bet-rule-title'>{betRule.award}</View> : null}
                  <Image
                    className='qz-bet-rule-img'
                    src={betRule.awardPic}
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

export default BetRule
