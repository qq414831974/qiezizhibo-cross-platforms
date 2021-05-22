import {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Video} from '@tarojs/components'
import {connect} from 'react-redux'
import {AtActivityIndicator} from 'taro-ui'

import './media.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import NavBar from "../../components/nav-bar";

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

class Media extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      media: null,
    }
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
    const router = getCurrentInstance().router;
    if (router && router.params != null) {
      if (router.params.id == null && router.params.scene != null) {
        id = router.params.scene
      } else if (router.params.id != null) {
        id = router.params.id
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
        <NavBar
          title='茄子TV'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
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
