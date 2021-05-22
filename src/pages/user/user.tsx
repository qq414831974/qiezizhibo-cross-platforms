import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image, Button} from '@tarojs/components'
import {AtIcon} from 'taro-ui'
import {connect} from 'react-redux'
import qqmapjs from '../../sdk/qqmap-wx-jssdk.min.js';
import configAction from "../../actions/config";

import './user.scss'

import {hasLogin, getStorage, clearLoginToken, getExpInfoByExpValue} from "../../utils/utils";
import account_bg from '../../assets/user/account_bg.png'
import logo from '../../assets/default-logo.png'
import withShare from "../../utils/withShare";
import userAction from '../../actions/user'
import * as global from '../../constants/global'
import LoginModal from '../../components/modal-login/index';
import PhoneModal from '../../components/modal-phone/index';
import * as error from "../../constants/error";
import ModalLocation from "../../components/modal-location";
import LocationSelecter from "./components/location-selecter";
import areaAction from "../../actions/area";
import NavBar from "../../components/nav-bar";

type PageStateProps = {
  userInfo: {
    avatar: string,
    name: string,
    userNo: string,
    phone: string,
    userExp: any,
  },
  locationConfig: any,
  payEnabled: boolean,
  expInfo: any,
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loginOpen: boolean,
  phoneOpen: boolean,
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
  title: '茄子TV',
  imageUrl: logo,
  path: 'pages/home/home'
})
class User extends Component<IProps, PageState> {

  qqmapsdk: qqmapjs;
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      isLogin: false,
      loginOpen: false,
      phoneOpen: false,
      locationShow: false,
      locationSelecterShow: false,
      collectNum: 0,
    }
  }

  $setSharePath = () => `/pages/home/home?page=user`

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
                success: (location) => {
                  getLocation(location.latitude, location.longitude)
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

  onPullDownRefresh = () => {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getUserInfo()
    this.initLocation();
  }

  async getUserInfo(onSuccess?: Function | null) {
    if (await hasLogin()) {
      const openid = await getStorage('wechatOpenid');
      userAction.getUserInfo({openId: openid}, {
        success: (res) => {
          this.setState({
            isLogin: true
          })
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
          if (onSuccess) {
            onSuccess(res);
          }
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
    this.getUserInfo((res) => {
      const phone = res.payload.phone
      if (res.payload != null && phone == null) {
        this.setState({phoneOpen: true})
      }
    })
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
  onChargeMatchClick = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.setState({loginOpen: true})
      return;
    }
    Taro.navigateTo({url: `../orders/orders`});
  }
  onAddressClick = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.setState({loginOpen: true})
      return;
    }
    Taro.navigateTo({url: `../address/address`});
  }
  onBetClick = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.setState({loginOpen: true})
      return;
    }
    Taro.navigateTo({url: `../betOrders/betOrders`});
  }
  onDepositClick = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.setState({loginOpen: true})
      return;
    }
    Taro.navigateTo({url: `../deposit/deposit`});
  }
  onLeagueMemberClick = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      this.setState({loginOpen: true})
      return;
    }
    Taro.navigateTo({url: `../memberOrder/memberOrder`});
  }
  getUserExpProgress = (userExp) => {
    const {expInfo} = this.props
    const userExpInfo = getExpInfoByExpValue(expInfo, userExp.exp)
    const userExpValue = userExp.exp;
    const expMin = userExpInfo.minExp;
    const expMax = userExpInfo.maxExp;
    const expRange = expMax - expMin;
    const userExpOffset = userExpValue - expMin;
    return userExpOffset * 100 / expRange;
  }

  render() {
    const {userInfo, locationConfig, payEnabled, expInfo} = this.props
    const {avatar = logo, name = null, userExp = {}} = userInfo;
    const userExpInfo = getExpInfoByExpValue(expInfo, userExp.exp);

    return (
      <View className='qz-user-content'>
        <NavBar
          title=''
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <Image className='qz-user-account-bg'
               style={{top: `${this.navRef ? this.navRef.state.configStyle.navHeight : 0}px`}}
               src={account_bg}/>
        <View className='qz-user-user-info' onClick={this.login}>
          <View className='qz-user-user-info-avatar-container'>
            <Image className='qz-user-user-info-avatar' src={avatar}/>
            {userExp && userExpInfo ?
              <View className='qz-user-user-info-level'
                    style={{backgroundColor: global.LEVEL_COLOR[Math.floor(userExpInfo.level / 10)]}}>
                Lv.{userExpInfo.level}
              </View>
              : null}
          </View>
          {
            name && name.length > 0 ?
              <Text className='qz-user-user-info-username'>{name}</Text>
              :
              <Text className='qz-user-user-info-username'>点击登录</Text>
          }
        </View>
        <View className='qz_user-info-exp'>
          {userExp && userExpInfo ? <View className='exp-bar-controller'>
              {/*<View className='exp-level exp-level-pre'>*/}
              {/*  Lv.{userExp.expInfo.level}*/}
              {/*</View>*/}
              <View className='exp-bar'>
                <View className='bar' style={{width: this.getUserExpProgress(userExp) + "%"}}>
                </View>
              </View>
              {/*<View className='exp-level exp-level-next'>*/}
              {/*  Lv.{userExp.expInfo.level + 1}*/}
              {/*</View>*/}
            </View>
            : null}
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
          <Button onClick={this.onChargeMatchClick} className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='shopping-cart' size='18' color='#333'/>
              {payEnabled ? "已购比赛" : "订单查看"}
            </View>
            <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
          </Button>
          {payEnabled ? <Button onClick={this.onBetClick} className='list button-list'>
              <View className='list_title'>
                <AtIcon className='list-title-icon' value='shopping-bag' size='18' color='#333'/>
                我的竞猜
              </View>
              <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
            </Button>
            : null}
          {payEnabled ? <Button onClick={this.onDepositClick} className='list button-list'>
              <View className='list_title'>
                <AtIcon className='list-title-icon' value='money' size='18' color='#333'/>
                我的茄币
              </View>
              <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
            </Button>
            : null}
          <Button onClick={this.onLeagueMemberClick} className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='sketch' size='18' color='#333'/>
              我的联赛会员
            </View>
            <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
          </Button>
        </View>
        <View className='qz-user-list-view'>
          <Button onClick={this.onAddressClick} className='list button-list'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='map-pin' size='18' color='#333'/>
              我的地址
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
    expInfo: state.config ? state.config.expInfo : null,
    locationConfig: state.config ? state.config.locationConfig : null,
    payEnabled: state.config ? state.config.payEnabled : null,
  }
}
export default connect(mapStateToProps)(User)
