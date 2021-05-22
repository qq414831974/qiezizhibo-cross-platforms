import Taro from '@tarojs/taro'
import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import Request from '../../utils/request'
import {updateStorage} from '../../utils/utils'
import * as api from '../../constants/api'
import * as error from '../../constants/error'
import defaultLogo from '../../assets/default-logo.png'
import './index.scss'
import * as global from "../../constants/global";


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleConfirm: () => any,
  handleCancel: () => any,
  handleClose: (event?: any) => any,
  handleError: (event?: any) => any
}

type PageOwnProps = {}

type PageState = {
  canIUseGetUserProfile: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalLogin {
  props: IProps;
}

class ModalLogin extends Component<IProps, PageState> {
  static defaultProps = {
    handleClose: () => {
    },
    handleCancel: () => {
    },
    handleConfirm: () => {
    },
    handleError: () => {
    },
  }

  constructor(props) {
    super(props)
    this.state = {
      canIUseGetUserProfile: false,
    }
  }

  componentDidMount() {
    if (wx.getUserProfile) {
      this.setState({
        canIUseGetUserProfile: true
      })
    }
  }

  handleGetUserInfoConfirm = (value) => {
    Taro.showLoading({title: global.LOADING_TEXT})
    const {handleCancel} = this.props;
    const userLogin = this.userLogin;
    if (value && value.detail && value.detail.errMsg === "getUserInfo:ok") {
      const userInfo = value.detail.userInfo;
      userLogin(userInfo);
    } else {
      handleCancel();
      Taro.hideLoading();
    }
  }

  handleConfirm = () => {
    Taro.showLoading({title: global.LOADING_TEXT})
    const {handleCancel} = this.props;
    const userLogin = this.userLogin;
    console.log("getUserProfile")
    wx.getUserProfile({
      desc: '请先登录再进行操作',
      lang: 'zh_CN',
      success: (value) => {
        const userInfo = value.userInfo;
        userLogin(userInfo);
      },
      fail: () => {
        handleCancel();
        Taro.hideLoading();
      }
    })
  }
  userLogin = (userInfo) => {
    const {handleConfirm, handleError} = this.props;
    let param: any = {};
    param.avatar = userInfo.avatarUrl;
    param.province = userInfo.province;
    param.city = userInfo.city;
    param.country = userInfo.country;
    param.name = userInfo.nickName;
    param.wechatType = 1;
    Taro.login().then(loginValue => {
      if (loginValue && loginValue.errMsg === "login:ok") {
        new Request().post(`${api.API_LOGIN}?code=${loginValue.code}&wechatType=0`, param).then(async (res: any) => {
          if (res.accessToken) {
            if (res.userNo && res.openId) {
              await updateStorage({wechatOpenid: res.openId});
              await updateStorage({userNo: res.userNo});
              handleConfirm();
            }
          } else {
            handleError(error.ERROR_LOGIN);
          }
          Taro.hideLoading();
        }).catch(reason => {
          console.log(reason);
          handleError(error.ERROR_LOGIN);
        })
      }
      Taro.hideLoading();
    }).catch(reason => {
      console.log(reason);
      handleError(error.ERROR_WX_LOGIN);
      Taro.hideLoading();
    });
  }

  render() {
    const {isOpened = false, handleClose, handleCancel} = this.props;
    return (
      <AtModal isOpened={isOpened} onClose={handleClose}>
        {isOpened ? <AtModalContent>
          <View className="center">
            <AtAvatar circle image={defaultLogo}/>
          </View>
          <Text className="center gray qz-login-modal-content_text">
            请先登录再进行操作
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="light-gray qz-login-modal-content_tip">
            • 茄子TV将获得您的公开信息（昵称、头像等）
          </Text>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">暂不登录</Text>
          </Button>
          {this.state.canIUseGetUserProfile ?
            <Button onClick={this.handleConfirm}>立即登录</Button>
            :
            <Button open-type='getUserInfo' lang='zh_CN' onGetUserInfo={this.handleGetUserInfoConfirm}>立即登录</Button>
          }
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalLogin
