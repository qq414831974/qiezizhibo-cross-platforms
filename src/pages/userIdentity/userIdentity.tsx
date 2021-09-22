import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Text, Image} from '@tarojs/components'
import {AtActivityIndicator, AtIcon} from "taro-ui"
import {connect} from 'react-redux'

import './userIdentity.scss'
import {clearLoginToken, getStorage, hasLogin} from "../../utils/utils";
import NavBar from "../../components/nav-bar";
import * as error from "../../constants/error";
import userAction from "../../actions/user";
import LoginModal from "../../components/modal-login";
import noperson from "../../assets/no-person.png";
import Request from "../../utils/request";
import * as api from "../../constants/api";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  loginOpen: boolean;
  userIdentity: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface UserIdentity {
  props: IProps;
}

class UserIdentity extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      loginOpen: false,
      userIdentity: null,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    const userNo = this.props.userInfo && this.props.userInfo.userNo ? this.props.userInfo.userNo : null;
    if (userNo == null) {
      this.showAuth();
      return;
    }
    this.initUserIdentity(userNo)
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  initUserIdentity = (userNo) => {
    this.setState({loading: true})
    new Request().get(api.API_USER_IDENTITY, {
      userNo: userNo
    }).then((data: any) => {
      if (data != null && data.id != null) {
        this.setState({userIdentity: data, loading: false})
      }
    })
  }
  showAuth = () => {
    this.setState({loginOpen: true});
  }

  onAuthClose = () => {
    this.setState({loginOpen: false})
  }

  onAuthCancel = () => {
    this.setState({loginOpen: false})
  }

  onAuthError = (reason) => {
    switch (reason) {
      case error.ERROR_WX_UPDATE_USER: {
        Taro.showToast({
          title: "更新用户信息失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_WX_LOGIN: {
        Taro.showToast({
          title: "微信登录失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_LOGIN: {
        Taro.showToast({
          title: "登录失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onAuthSuccess = () => {
    this.setState({loginOpen: false})
    this.getUserInfo((userInfo) => {
      this.initUserIdentity(userInfo.payload.userNo)
    })
  }

  async getUserInfo(onSuccess?: Function | null) {
    if (await hasLogin()) {
      const openid = await getStorage('wechatOpenid');
      userAction.getUserInfo({openId: openid}, {
        success: (res) => {
          Taro.hideLoading()
          if (onSuccess) {
            onSuccess(res);
          }
        }, failed: () => {
          this.clearLoginState();
          Taro.hideLoading()
        }
      });
    } else {
      this.clearLoginState();
      Taro.hideLoading()
    }
  }

  clearLoginState = () => {
    clearLoginToken();
    userAction.clearUserInfo();
  }

  render() {
    const user = this.props.userInfo;
    if (this.state.loading) {
      return <View className="qz-user-identity-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-user-identity-content'>
        <NavBar
          background="#3bb36b"
          title='实名信息'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className='qz-user-identity__user'>
          <View className='qz-user-identity__user-avatar-container'>
            <Image className='qz-user-identity__user-avatar'
                   src={user && user.avatar ? user.avatar : noperson}/>
          </View>
          <Text className='qz-user-identity__user-name'>
            {user && user.name ? user.name : "匿名"}
          </Text>
        </View>
        {this.state.userIdentity ? <View className='qz-user-identity__identity'>
          <View className='qz-user-identity__identity-list-item'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='check-circle' size='18' color='#333'/>
              认证状态
            </View>
            <Text className='list_content'>
              {this.state.userIdentity ? <Text>已认证</Text> : <Text>未认证</Text>}
              {this.state.userIdentity ? <AtIcon value='check-circle' size='18' color='#13CE66'/>
                : <AtIcon value='alert-circle' size='18' color='#FFC82C'/>}
            </Text>
          </View>
          <View className='qz-user-identity__identity-list-item'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='user' size='18' color='#333'/>
              姓名
            </View>
            <Text className='list_content'>{this.state.userIdentity ? this.state.userIdentity.name : null}</Text>
          </View>
          <View className='qz-user-identity__identity-list-item'>
            <View className='list_title'>
              <AtIcon className='list-title-icon' value='credit-card' size='18' color='#333'/>
              身份证
            </View>
            <Text className='list_content'>{this.state.userIdentity ? this.state.userIdentity.idCard : null}</Text>
          </View>
        </View> : null}
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(UserIdentity)
