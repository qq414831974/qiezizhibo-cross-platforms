import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtInput} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import './index.scss'


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleConfirm: (idcard) => any,
  handleCancel: () => any,
}

type PageOwnProps = {
  name: string,
}

type PageState = {
  idcard: any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalIdcardVerify {
  props: IProps;
}

class ModalIdcardVerify extends Component<PageOwnProps, PageState> {
  static defaultProps = {
    handleConfirm: () => {
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      idcard: null,
    }
  }

  handlePasswordChange = (value) => {
    this.setState({idcard: value})
  }

  render() {
    const {isOpened = false, handleConfirm, handleCancel, name} = this.props;
    return (
      <AtModal isOpened={isOpened} closeOnClickOverlay={false} className="modal-overlay-blur">
        <AtModalContent>
          <View className="w-full center">
            <Text className="gray qz-idcard-verify-modal-content_text">
              请输入
            </Text>
            <Text className="highlight qz-idcard-verify-modal-content_text">
              {name}
            </Text>
            <Text className="gray qz-idcard-verify-modal-content_text">
              的身份证
            </Text>
          </View>
          <AtInput
            className="at-input-top-border qz-idcard-verify-modal-content_input"
            name="idcardInput"
            value={this.state.idcard}
            onChange={this.handlePasswordChange}/>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={handleCancel}>取消</Button>
          <Button onClick={handleConfirm.bind(this, this.state.idcard)}>确定</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalIdcardVerify
