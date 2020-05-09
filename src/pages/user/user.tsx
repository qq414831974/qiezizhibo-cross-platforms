// import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Image, Button} from '@tarojs/components'
import {AtAvatar, AtIcon} from 'taro-ui'
import {connect} from '@tarojs/redux'

import './user.scss'

import {hasLogin, getStorage, clearLoginToken} from "../../utils/utils";
import account_bg from '../../assets/user/account_bg.png'
import logo from '../../assets/default-logo.png'
import withShare from "../../utils/withShare";
import userAction from '../../actions/user'
import * as global from '../../constants/global'
import LoginModal from '../../components/modal-login/index';
import PhoneModal from '../../components/modal-phone/index';
import Request from "../../utils/request";
import * as api from "../../constants/api";
import * as error from "../../constants/error";

type PageStateProps = {
  userInfo: {
    avatar: string,
    name: string,
    userNo: string,
    phone: string,
  },
  locationConfig: any,
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loginOpen: boolean,
  phoneOpen: boolean,
  isLogin: boolean | string | null,
  collectNum: number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface User {
  props: IProps;
}

@withShare({
  title: '校园足球赛事频道',
  imageUrl: logo,
  path: 'pages/home/home'
})
class User extends Component<PageOwnProps, PageState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
    this.state = {
      isLogin: false,
      loginOpen: false,
      collectNum: 0,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getUserInfo()
    this.getCollection();
  }

  componentDidHide() {
  }

  onPullDownRefresh() {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getUserInfo()
  }

  async getUserInfo() {
    if (await hasLogin()) {
      const openid = await getStorage('wechatOpenid');
      userAction.getUserInfo({openId: openid}, {
        success: () => {
          this.setState({
            isLogin: true
          })
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }, failed: () => {
          this.clearLoginState();
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      });
    } else {
      this.clearLoginState();
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    }
  }

  login = async () => {
    if (this.state.isLogin) {
      this.logout();
    } else {
      this.setState({loginOpen: true})
    }
  }
  logout = () => {
    // new Request().get(api.API_LOGIN_OUT, null).then(() => {
    this.clearLoginState();
    // });
  }
  clearLoginState = () => {
    clearLoginToken();
    userAction.clearUserInfo();
    this.setState({
      isLogin: false
    })
  }
  onAuthClose = () => {
    this.setState({loginOpen: false})
  }

  onAuthCancel = () => {
    this.setState({loginOpen: false})
  }

  onAuthError = (reason) => {
    switch (reason) {
      case  error.ERROR_WX_UPDATE_USER: {
        Taro.showToast({
          title: "更新用户信息失败",
          icon: 'none',
        });
        return;
      }
      case  error.ERROR_WX_LOGIN: {
        Taro.showToast({
          title: "微信登录失败",
          icon: 'none',
        });
        return;
      }
      case  error.ERROR_LOGIN: {
        Taro.showToast({
          title: "登录失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onAuthSuccess = () => {
    this.setState({loginOpen: false, isLogin: true})
    this.getUserInfo()
  }

  onPhoneClose = () => {
    this.setState({phoneOpen: false})
  }

  onPhoneCancel = () => {
    this.setState({phoneOpen: false})
  }

  onPhoneError = (reason) => {
    switch (reason) {
      case  error.ERROR_WX_UPDATE_USER: {
        Taro.showToast({
          title: "更新用户信息失败,请重新登录后再试",
          icon: 'none',
          complete: () => {
            this.logout();
          }
        });
        return;
      }
      case  error.ERROR_WX_LOGIN: {
        Taro.showToast({
          title: "微信登录失败",
          icon: 'none',
        });
        return;
      }
      case  error.ERROR_LOGIN: {
        Taro.showToast({
          title: "登录失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onPhoneSuccess = () => {
    this.setState({phoneOpen: false})
    this.getUserInfo()
  }
  getCollection = async () => {
    const collectMatch = await getStorage('collectMatch')
    if (collectMatch == null) {
      this.setState({
        collectNum: 0
      });
    } else {
      let collectNum = 0;
      for (const match in collectMatch) {
        if (collectMatch[match].id) {
          collectNum = collectNum + 1;
        }
      }
      this.setState({
        collectNum: collectNum
      });
    }
  }
  onCollectionClick = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.setState({loginOpen: true})
      return;
    }
    Taro.navigateTo({url: `../collection/collection`});
  }
  onVerificationClick = () => {
    const {userInfo} = this.props
    if (userInfo && userInfo.phone) {
      Taro.showToast({title: "已验证", icon: "success"});
      return;
    }
    if (this.state.isLogin) {
      this.setState({phoneOpen: true})
    } else {
      Taro.showToast({title: "请登录后再操作", icon: "none"});
      this.setState({loginOpen: true})
    }
  }

  render() {
    const {userInfo} = this.props
    const {avatar = logo, name = null} = userInfo;
    return (
      <View className='qz-user-content'>
        <Image className='qz-user-account-bg' src={account_bg}/>
        <View className='qz-user-user-info' onClick={this.login}>
          <AtAvatar className='avatar' circle image={avatar}/>
          {
            name && name.length > 0 ?
              <Text className='username'>{name}</Text>
              :
              <Text className='username'>点击登录</Text>
          }
        </View>
        <View className='qz-user-list-view' onClick={this.onCollectionClick}>
          <View className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='help' size='18' color='#333'/>
              收藏
            </View>
            <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
          </View>
        </View>
        <View className='qz-user-list-view'>
          <Button open-type="openSetting" className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='check-circle' size='18' color='#333'/>
              授权设置
            </View>
            <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
          </Button>
          <Button onClick={this.onVerificationClick} className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='iphone' size='18' color='#333'/>
              验证手机号
            </View>
            {userInfo && userInfo.phone ? <AtIcon value='check-circle' size='18' color='#13CE66'/>
              : <AtIcon value='alert-circle' size='18' color='#FFC82C'/>}
          </Button>
          <Button open-type="share" className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='share' size='18' color='#333'/>
              分享
            </View>
            <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
          </Button>
        </View>
        <View className='qz-user-list-view'>
          <Button open-type="contact" className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='help' size='18' color='#333'/>
              联系客服
            </View>
            <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
          </Button>
        </View>
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}/>
        <PhoneModal
          isOpened={this.state.phoneOpen}
          handleConfirm={this.onPhoneSuccess}
          handleCancel={this.onPhoneCancel}
          handleClose={this.onPhoneClose}
          handleError={this.onPhoneError}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    locationConfig: state.config ? state.config.locationConfig : null,
  }
}
export default connect(mapStateToProps)(User)
