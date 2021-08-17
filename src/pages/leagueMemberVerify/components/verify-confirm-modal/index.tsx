import Taro from '@tarojs/taro'
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

interface ModalVerifyConfirm {
  props: IProps;
}

class ModalVerifyConfirm extends Component<IProps, PageState> {
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


  handleConfirm = () => {

  }


  render() {
    const {isOpened = false, handleConfirm, handleCancel, currentPlayer = {}} = this.props;
    return (
      <AtModal isOpened={isOpened} onClose={handleCancel}>
        {isOpened ? <AtModalContent>
          <View className="center">
            <AtAvatar circle image={currentPlayer && currentPlayer.headImg ? currentPlayer.headImg : defaultLogo}/>
          </View>
          {/*<Text className="center gray qz-verify-confirm-modal-content_text">*/}
          {/*  {currentPlayer && currentPlayer.name ? currentPlayer.name : "球员"}*/}
          {/*</Text>*/}
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="gray qz-verify-confirm-modal-content_tip">
            您将要验证的是
          </Text>
          <Text className="highlight qz-verify-confirm-modal-content_tip">
            {currentPlayer && currentPlayer.name ? currentPlayer.name : "球员"}
          </Text>
          <Text className="gray qz-verify-confirm-modal-content_tip">
            ，是否确认前往认证？
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

export default ModalVerifyConfirm
