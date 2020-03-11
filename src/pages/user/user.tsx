// import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Image, Button} from '@tarojs/components'
import {AtAvatar, AtIcon} from 'taro-ui'
import {connect} from '@tarojs/redux'
import qqmapjs from '../../sdk/qqmap-wx-jssdk.min.js';
import configAction from "../../actions/config";

import './user.scss'

import {hasLogin, getStorage, clearLoginToken} from "../../utils/utils";
import account_bg from '../../assets/user/account_bg.png'
import logo from '../../assets/default-logo.png'
import withShare from "../../utils/withShare";
import userAction from '../../actions/user'
import * as global from '../../constants/global'
import LoginModal from '../../components/modal-login/index';
import Request from "../../utils/request";
import * as api from "../../constants/api";
import * as error from "../../constants/error";
import ModalLocation from "../../components/modal-location";
import LocationSelecter from "./components/location-selecter";
import areaAction from "../../actions/area";

type PageStateProps = {
  userInfo: {
    avatar: string,
    name: string,
    userNo: string,
  },
  locationConfig: any,
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loginOpen: boolean,
  isLogin: boolean | string | null,
  locationShow: boolean,
  locationSelecterShow: boolean,
  collectNum: number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface User {
  props: IProps;
}

@withShare({
  title: '茄子体育',
  imageUrl: logo,
  path: 'pages/home/home'
})
class User extends Component<PageOwnProps, PageState> {

  qqmapsdk: qqmapjs;
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
      locationShow: false,
      locationSelecterShow: false,
      collectNum: 0,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.qqmapsdk = new qqmapjs({key: "ROVBZ-JKXH6-BJUS4-MY6WU-QXI7T-QRBPL"});
    this.getAreas();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getUserInfo()
    this.getCollection();
    const getLocation = this.getLocation;
    const initLocation = this.initLocation;
    configAction.getLocationConfig().then(() => {
      if (this.props.locationConfig && this.props.locationConfig.province) {
        initLocation();
      } else {
        Taro.getSetting({
          success(res) {
            const userLocation = res && res.authSetting ? res.authSetting["scope.userLocation"] : null;
            if (userLocation == null || (userLocation != null && userLocation == true)) {
              Taro.getLocation({
                success: (res) => {
                  getLocation(res.latitude, res.longitude)
                }, fail: () => {
                  Taro.showToast({title: "获取位置信息失败", icon: "none"});
                }
              })
            } else {
              initLocation();
            }
          }
        })
      }
    })
  }

  componentDidHide() {
  }

  onPullDownRefresh() {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getUserInfo()
    this.initLocation();
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
  getAreas = () => {
    areaAction.getAreas();
  }
  initLocation = async () => {
    configAction.getLocationConfig().then(data => {
      if (data.province) {
        this.setState({locationShow: false})
      }
    })
  }
  getLocation = (latitude, longitude, callbackFunc: any = null) => {
    this.qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: (res) => {
        if (res && res.result) {
          const city = res.result.address_component.city;
          const province = res.result.address_component.province;
          configAction.setLocationConfig({city: city, province: province}).then(() => {
            this.initLocation();
            callbackFunc && callbackFunc();
          })
        }
      },
      fail: (reason) => {
        console.log(reason);
        Taro.showToast({title: "获取位置信息失败,请手动选择", icon: "none"});
        callbackFunc && callbackFunc();
      }
    })
  }
  onProvinceSelect = (province) => {
    configAction.setLocationConfig({province: province.name}).then(() => {
      this.hideLocationSelect();
      this.initLocation();
    })
  }
  onLocationClose = () => {
    this.setState({locationShow: false})
  }

  onLocationCancel = () => {
    this.setState({locationShow: false})
  }

  onLocationSuccess = () => {
    this.setState({locationShow: false})
    Taro.getLocation({
      success: (res) => {
        this.getLocation(res.latitude, res.longitude)
      }, fail: () => {
        Taro.showToast({title: "获取位置信息失败", icon: "none"});
      }
    })
  }
  showLocationSelect = () => {
    this.setState({locationSelecterShow: true})
  }
  hideLocationSelect = () => {
    this.setState({locationSelecterShow: false})
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
  render() {
    const {userInfo, locationConfig} = this.props
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
        <View className='qz-user-info-view'>
          {/*<View className='bio'>111</View>*/}
          <View className='item_view'>
            <View className='item' onClick={this.showLocationSelect}>
              <View className='title'>{locationConfig ? locationConfig.province : "未定位"}</View>
              <View className='desc'>地区</View>
            </View>
            <View className='line'/>
            <View className='item' onClick={this.onCollectionClick}>
              <View className='title_number'>{this.state.collectNum}</View>
              <View className='desc'>收藏</View>
            </View>
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
        <LoginModal isOpened={this.state.loginOpen}
                    handleConfirm={this.onAuthSuccess}
                    handleCancel={this.onAuthCancel}
                    handleClose={this.onAuthClose}
                    handleError={this.onAuthError}/>
        <ModalLocation
          isOpened={this.state.locationShow}
          handleConfirm={this.onLocationSuccess}
          handleCancel={this.onLocationCancel}
          handleClose={this.onLocationClose}/>
        <LocationSelecter
          show={this.state.locationSelecterShow}
          onCancel={this.hideLocationSelect}
          onClose={this.hideLocationSelect}
          location={locationConfig}
          onProvinceSelect={this.onProvinceSelect}
          getLocation={this.getLocation}/>
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
