import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtModal, AtModalContent, AtModalAction, AtDivider, AtInput} from "taro-ui"
import {Text, Button} from '@tarojs/components'
import './index.scss'


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleConfirm: (password) => any,
}

type PageOwnProps = {}

type PageState = {
  password: string,
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
  handlePasswordChange = (value) => {
    this.setState({password: value})
  }

  render() {
    const {isOpened = false, handleConfirm} = this.props;
    return (
      <AtModal isOpened={isOpened} closeOnClickOverlay={false} className="modal-overlay-blur">
        <AtModalContent>
          <Text className="center gray qz-encryption-modal-content_text">
            请输入密码
          </Text>
          <AtInput name="passwordInput"
                   type="password"
                   value={this.state.password}
                   onChange={this.handlePasswordChange}/>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={handleConfirm.bind(this, this.state.password)}>确定</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalEncryption
