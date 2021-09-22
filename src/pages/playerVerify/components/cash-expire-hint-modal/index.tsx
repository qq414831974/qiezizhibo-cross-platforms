import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction} from "taro-ui"
import {Text, Button} from '@tarojs/components'
import './index.scss'


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = {
  dateString: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalCashExpireHint {
  props: IProps;
}

class ModalCashExpireHint extends Component<IProps, PageState> {
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
    const {isOpened = false, handleCancel} = this.props;
    return (
      <AtModal isOpened={isOpened} className="at-modal-small">
        {isOpened ? <AtModalContent>
          <Text className="gray qz-cash-expire-hint-modal-content_tip">
            您未在
          </Text>
          <Text className="highlight qz-cash-expire-hint-modal-content_tip">
            {this.props.dateString}之前
          </Text>
          <Text className="gray qz-cash-expire-hint-modal-content_tip">
            进行球员实名认证，提现金额已失效。
          </Text>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">关闭</Text>
          </Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalCashExpireHint
