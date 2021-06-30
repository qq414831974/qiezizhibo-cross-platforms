import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtInput} from "taro-ui"
import {Text, Button} from '@tarojs/components'
import './index.scss'


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleConfirm: (password) => any,
  handleCancel: () => any,
}

type PageOwnProps = {}

type PageState = {
  password: any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalEncryption {
  props: IProps;
}

class ModalEncryption extends Component<PageOwnProps, PageState> {
  static defaultProps = {
    handleConfirm: () => {
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      password: null,
    }
  }

  handlePasswordChange = (value) => {
    this.setState({password: value})
  }

  render() {
    const {isOpened = false, handleConfirm, handleCancel} = this.props;
    return (
      <AtModal isOpened={isOpened} closeOnClickOverlay={false} className="modal-overlay-blur">
        <AtModalContent>
          <Text className="center gray qz-encryption-modal-content_text">
            请输入密码
          </Text>
          <AtInput
            className="at-input-top-border qz-encryption-modal-content_input"
            name="passwordInput"
            type="password"
            value={this.state.password}
            onChange={this.handlePasswordChange}/>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={handleCancel}>取消</Button>
          <Button onClick={handleConfirm.bind(this, this.state.password)}>确定</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalEncryption
