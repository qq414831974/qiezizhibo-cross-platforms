import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon, AtButton} from 'taro-ui'

import './feedbackSuccess.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  value: any;
  phone: any;
  files: any;
  title: any;
  hint: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface FeedbackSuccess {
  props: IProps;
}

class FeedbackSuccess extends Component<PageOwnProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  }

  constructor(props) {
    super(props)
    this.state = {
      title: "",
      hint: "",
      value: "",
      phone: "",
      files: [],
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (this.$router.params && this.$router.params.type != null) {
      const type = Number(this.$router.params.type);
      let title = "反馈已提交"
      let hint = "已将你的反馈内容提交给开发者"
      if (type == 4) {
        title = "投诉成功"
        hint = "感谢你的参与，我们坚决反对色情、暴力、欺诈等违规信息，我们会认真处理你的投诉，维护绿色、健康的网络环境。"
      }
      this.setState({title: title, hint: hint})
    }
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  onConfirm = () => {
    Taro.navigateBack({
      delta: 3
    })
  }

  render() {
    return (
      <View className='qz-feedback-success'>
        <View className='qz-feedback-success-icon-container'>
          <View className='qz-feedback-success-icon'>
            <AtIcon value='check' size='30' color='#ffffff'/>
          </View>
        </View>
        <View className='qz-feedback-success__title'>
          {this.state.title}
        </View>
        <View className='qz-feedback-success__text'>
          {this.state.hint}
        </View>
        <AtButton
          onClick={this.onConfirm}
          type='secondary'
          className="qz-feedback-success-confirm"
          size='small'>
          确定
        </AtButton>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(FeedbackSuccess)
