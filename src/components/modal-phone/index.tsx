import Taro from '@tarojs/taro'
import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import Request from '../../utils/request'
import {getStorage} from '../../utils/utils'
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

interface ModalPhone {
  props: IProps;
}

class ModalPhone extends Component<IProps, PageState> {
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
    }
  }

  handleConfirm = async (value) => {
    Taro.showLoading({title: global.LOADING_TEXT})
    const {handleCancel, handleConfirm, handleError} = this.props;
    if (value && value.detail && value.detail.errMsg === "getPhoneNumber:ok") {
      const encryptedData = value.detail.encryptedData;
      const iv = value.detail.iv;
      const openId = await getStorage('wechatOpenid')
      new Request().post(api.API_PHONENUMBER, {
        encryptedData: encryptedData,
        iv: iv,
        openId: openId
      }).then((res) => {
        if (res) {
          handleConfirm();
          Taro.hideLoading();
        } else {
          handleError(error.ERROR_WX_UPDATE_USER);
          Taro.hideLoading();
        }
      }).catch(reason => {
        console.log(reason);
        handleError(error.ERROR_WX_UPDATE_USER);
        Taro.hideLoading();
      })
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
          <Text className="center gray qz-phone-modal-content_text">
            获取手机号
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <View className="light-gray qz-phone-modal-content_tip">
            • 茄子TV将获得您的手机号
          </View>
          <View className="light-gray qz-phone-modal-content_tip">
            • 请验证手机号
          </View>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">暂不授权</Text>
          </Button>
          <Button open-type='getPhoneNumber' lang='zh_CN' onGetPhoneNumber={this.handleConfirm}>立即授权</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalPhone
