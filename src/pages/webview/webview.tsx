import Taro, {Component, Config} from '@tarojs/taro'
import {View, WebView} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import './webview.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Webview {
  props: IProps;
}

class Webview extends Component<PageOwnProps, PageState> {

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

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  render() {
    return (
      <View className='qz-webview-container'>
        {this.$router.params && this.$router.params.url ?
          <WebView src={decodeURIComponent(this.$router.params.url)}/> : null}
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(Webview)
