import Taro from '@tarojs/taro'
import {Component} from 'react'
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

interface ModalAlbum {
  props: IProps;
}

class ModalAlbum extends Component<IProps, PageState> {
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
  handleConfirm = (value) => {
    Taro.showLoading({title: global.LOADING_TEXT})
    const {handleCancel, handleConfirm} = this.props;
    if (value && value.detail && value.detail.authSetting && value.detail.authSetting["scope.writePhotosAlbum"] === true) {
      handleConfirm();
    } else {
      handleCancel();
    }
    Taro.hideLoading();
  }

  render() {
    const {isOpened = false, handleClose, handleCancel} = this.props;

    return (
      <AtModal isOpened={isOpened} onClose={handleClose} className="qz-album-modal">
        {isOpened ? <AtModalContent>
          <View className="center">
            <AtAvatar circle image={defaultLogo}/>
          </View>
          <Text className="center gray qz-album-modal-content_text">
            请允许保存图片到相册
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="light-gray qz-album-modal-content_tip">
            • 茄子TV将保存图片到您的相册
          </Text>
        </AtModalContent> : null}
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

export default ModalAlbum
