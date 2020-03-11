import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
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

interface ModalLocation {
  props: IProps;
}

class ModalLocation extends Component<PageOwnProps, PageState> {
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
    const {handleCancel, handleConfirm} = this.props;
    if (value && value.detail && value.detail.authSetting && value.detail.authSetting["scope.userLocation"] === true) {
      handleConfirm();
    } else {
      handleCancel();
    }
    Taro.hideLoading();
  }

  render() {
    const {isOpened = false, handleClose, handleCancel} = this.props;
    return (
      <AtModal isOpened={isOpened} onClose={handleClose} className="qz-location-modal">
        <AtModalContent>
          <View className="center">
            <AtAvatar circle image={defaultLogo}/>
          </View>
          <Text className="center gray qz-location-modal-content_text">
            请允许我们获取您的位置信息以获取最佳体验
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="light-gray qz-location-modal-content_tip">
            • 茄子体育将获得您的位置信息
          </Text>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">暂不授权</Text>
          </Button>
          <Button open-type='openSetting' onOpenSetting={this.handleConfirm}>前往授权</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalLocation
