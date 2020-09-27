import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
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

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalLogin {
  props: IProps;
}

class ModalLogin extends Component<PageOwnProps, PageState> {
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
  handleConfirm = (value) => {
    Taro.showLoading({title: global.LOADING_TEXT})
    const {handleCancel, handleConfirm, handleError} = this.props;
    if (value && value.detail && value.detail.errMsg === "getUserInfo:ok") {
      const userInfo = value.detail.userInfo;
      let userVo: any = {};
      userVo.avatar = userInfo.avatarUrl;
      userVo.province = userInfo.province;
      userVo.city = userInfo.city;
      userVo.country = userInfo.country;
      userVo.name = userInfo.nickName;
      Taro.login().then(loginValue => {
        if (loginValue && loginValue.errMsg === "login:ok") {
          new Request().post(`${api.API_LOGIN}?code=${loginValue.code}&type=1`, {}).then((res: any) => {
            if (res.accessToken) {
              new Request().post(api.API_AUTH_USER, {}).then(async (user: any) => {
                if (user.user && user.user.openId) {
                  userVo.wechatOpenid = user.user.openId;
                  userVo.wechatType = 1;
                  await updateStorage({wechatOpenid: user.user.openId});
                  await updateStorage({userNo: user.user.userNo});
                  new Request().put(api.API_USER, userVo).then(() => {
                    handleConfirm();
                  });
                }
              }).catch(reason => {
                console.log(reason);
                handleError(error.ERROR_WX_UPDATE_USER);
              })
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
    } else {
      handleCancel();
      Taro.hideLoading();
    }
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
            • 茄子体育将获得您的公开信息（昵称、头像等）
          </Text>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">暂不登录</Text>
          </Button>
          <Button open-type='getUserInfo' lang='zh_CN' onGetUserInfo={this.handleConfirm}>立即登录</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalLogin
