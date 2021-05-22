import {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, WebView} from '@tarojs/components'
import {connect} from 'react-redux'

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

class Webview extends Component<IProps, PageState> {


  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
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
    const router = getCurrentInstance().router;

    return (
      <View className='qz-webview-container'>
        {router && router.params && router.params.url ?
          <WebView src={decodeURIComponent(router.params.url)}/> : null}
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(Webview)
