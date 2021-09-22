import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import defaultLogo from '../../../../assets/no-person.png'
import './index.scss'


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleConfirm: () => any,
  handleCancel: () => any,
  currentPlayer: any,
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalPlayerVerifyInherit {
  props: IProps;
}

class ModalPlayerVerifyInherit extends Component<IProps, PageState> {
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
    this.state = {}
  }

  componentDidMount() {
  }



  render() {
    const {isOpened = false, handleConfirm, handleCancel, currentPlayer = {}} = this.props;
    return (
      <AtModal isOpened={isOpened} closeOnClickOverlay={false} className="modal-overlay-blur">
        {isOpened ? <AtModalContent>
          <View className="center">
            <AtAvatar circle image={currentPlayer && currentPlayer.headImg ? currentPlayer.headImg : defaultLogo}/>
          </View>
          <Text className="center gray qz-player-verify-inherit-modal-content_text">
            {currentPlayer && currentPlayer.name ? currentPlayer.name : "球员"}
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="gray qz-player-verify-inherit-modal-content_tip">
            您的实名认证与该球员一致，是否确认绑定？
          </Text>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">取消</Text>
          </Button>
          <Button onClick={handleConfirm}>确认绑定</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalPlayerVerifyInherit
