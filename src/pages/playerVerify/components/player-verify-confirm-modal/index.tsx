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

interface ModalPlayerVerifyConfirm {
  props: IProps;
}

class ModalPlayerVerifyConfirm extends Component<IProps, PageState> {
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
          <Text className="center gray qz-player-verify-confirm-modal-content_text">
            {currentPlayer && currentPlayer.name ? currentPlayer.name : "球员"}
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="gray qz-player-verify-confirm-modal-content_tip">
            实名认证
          </Text>
          <Text className="highlight qz-player-verify-confirm-modal-content_tip">
            通过后
          </Text>
          <Text className="gray qz-player-verify-confirm-modal-content_tip">
            才可进行后续操作，必须
          </Text>
          <Text className="highlight qz-player-verify-confirm-modal-content_tip">
            {currentPlayer && currentPlayer.name ? currentPlayer.name : "球员"}
          </Text>
          <Text className="gray qz-player-verify-confirm-modal-content_tip">
            本人操作，是否前往认证？
          </Text>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">取消</Text>
          </Button>
          <Button onClick={handleConfirm}>前往验证</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalPlayerVerifyConfirm
