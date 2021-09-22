import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtDivider, AtAvatar} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import './index.scss'
import {warning} from "../../../../utils/assets";


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = {
  hint: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalPlayerVerifyHint {
  props: IProps;
}

class ModalPlayerVerifyHint extends Component<IProps, PageState> {
  static defaultProps = {
    handleCancel: () => {
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
      <AtModal isOpened={isOpened} closeOnClickOverlay={false} className="modal-overlay-blur">
        {isOpened ? <AtModalContent>
          <View className="center">
            <AtAvatar image={warning}/>
          </View>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="center gray qz-player-verify-confirm-modal-content_tip">
            {this.props.hint ? this.props.hint : "对不起，您不是该球员"}
          </Text>
        </AtModalContent> : null}
        <AtModalAction>
          <Button onClick={handleCancel}>
            <Text className="mini-gray">返回</Text>
          </Button>
        </AtModalAction>
      </AtModal>
    )
  }
}

export default ModalPlayerVerifyHint
