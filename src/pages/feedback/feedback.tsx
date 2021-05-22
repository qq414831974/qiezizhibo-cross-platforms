import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtIcon} from "taro-ui"
import { connect } from 'react-redux'

import './feedback.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Feedback {
  props: IProps;
}

class Feedback extends Component<IProps, PageState> {
  constructor(props) {
    super(props)
    this.state = {
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

  onFeedbackClick = (type) => {
    Taro.navigateTo({
      url: `/pages/feedbackDetail/feedbackDetail?type=${type}`,
    })
  }

  render() {
    return (
      <View className='qz-feedback'>
        <View className='qz-feedback__title'>
          请选择反馈类型
        </View>
        <View className='qz-feedback__option'>
          <View className='qz-feedback__option-hint'>
            <View className='qz-feedback__option-hint__title'>
              向开发者反馈
            </View>
          </View>
          <View className='qz-feedback__option-cell' onClick={this.onFeedbackClick.bind(this, 1)}>
            <View className='qz-feedback__option-cell-container'>
              <View className='qz-feedback__option-cell__title'>
                功能异常
              </View>
              <View className='qz-feedback__option-cell__hint'>
                请向开发者反馈小程序功能异常问题。
              </View>
              <View className='qz-feedback__option-cell__arrow'>
                <AtIcon value='chevron-right' size='15' color='#B2B2B2'/>
              </View>
            </View>
          </View>
          <View className='qz-feedback__option-cell' onClick={this.onFeedbackClick.bind(this, 2)}>
            <View className='qz-feedback__option-cell-container'>
              <View className='qz-feedback__option-cell__title'>
                支付问题
              </View>
              <View className='qz-feedback__option-cell__hint'>
                可向开发者反馈你在支付过程中遇到多问题。
              </View>
              <View className='qz-feedback__option-cell__arrow'>
                <AtIcon value='chevron-right' size='15' color='#B2B2B2'/>
              </View>
            </View>
          </View>
          <View className='qz-feedback__option-cell' onClick={this.onFeedbackClick.bind(this, 3)}>
            <View className='qz-feedback__option-cell-container'>
              <View className='qz-feedback__option-cell__title'>
                产品建议
              </View>
              <View className='qz-feedback__option-cell__hint'>
                请向开发者反馈你在对产品的相关建议。
              </View>
              <View className='qz-feedback__option-cell__arrow'>
                <AtIcon value='chevron-right' size='15' color='#B2B2B2'/>
              </View>
            </View>
          </View>
          <View className='qz-feedback__option-hint' style={{marginTop: "30px"}}>
            <View className='qz-feedback__option-hint__title'>
              向微信平台投诉
            </View>
          </View>
          <View className='qz-feedback__option-cell' onClick={this.onFeedbackClick.bind(this, 4)}>
            <View className='qz-feedback__option-cell-container'>
              <View className='qz-feedback__option-cell__title'>
                违规举报
              </View>
              <View className='qz-feedback__option-cell__hint'>
                若遇色情、诱导、骚扰、欺诈、恶意营销、违法犯罪等情况，可向微信举报。
              </View>
              <View className='qz-feedback__option-cell__arrow'>
                <AtIcon value='chevron-right' size='15' color='#B2B2B2'/>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(Feedback)
