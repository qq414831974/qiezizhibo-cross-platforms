import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import defaultLogo from '../../assets/default-logo.png'
import './index.scss'


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleConfirm: () => any,
}

type PageOwnProps = {
  level: number;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalLevelUp {
  props: IProps;
}

class ModalLevelUp extends Component<IProps, PageState> {
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
    const {isOpened = false, level} = this.props;
    return (
      <AtModal isOpened={isOpened} onClose={this.props.handleConfirm}>
        {isOpened ? <AtModalContent>
          <View className="center">
            <AtAvatar circle image={defaultLogo}/>
          </View>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="center gray qz-login-modal-content_text">
            恭喜您升到{level}级
          </Text>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={this.props.handleConfirm}>确定</Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalLevelUp
