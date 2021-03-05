import Taro, {Component, Config} from '@tarojs/taro'
import {View, Video} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtActivityIndicator} from 'taro-ui'

import './media.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  media: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Media {
  props: IProps;
}

class Media extends Component<PageOwnProps, PageState> {

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
    const id = this.getParamId();
    this.getMediaInfo(id);
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getParamId = () => {
    let id;
    if (this.$router.params != null) {
      if (this.$router.params.id == null && this.$router.params.scene != null) {
        id = this.$router.params.scene
      } else if (this.$router.params.id != null) {
        id = this.$router.params.id
      } else {
        return null
      }
    } else {
      return null;
    }
    // return 3147;
    return id;
  }
  getMediaInfo = (id) => {
    this.setState({loading: true})
    new Request().get(api.API_MEDIA(id), null).then((data: any) => {
      this.setState({loading: false})
      if (data) {
        this.setState({media: data})
      }
    })
  }

  render() {
    if (this.state.loading) {
      return <View className="qz-media__result-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-media-container'>
        <Video
          id="videoPlayer"
          className='qz-media__video'
          src={this.state.media ? this.state.media.path : null}
          title={this.state.media ? this.state.media.title : "集锦"}
          playBtnPosition="center"
          show-casting-button
        />
        <View className='qz-media__info'>
          <View className='at-article__h2'>
            {this.state.media ? this.state.media.title : "集锦"}
          </View>
          <View className='at-article__info'>
            {this.state.media ? this.state.media.createTime : "时间未知"}
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(Media)
