import {Component} from 'react'
import {AtModal, AtModalContent, AtModalAction, AtDivider} from "taro-ui"
import {Text, Button} from '@tarojs/components'
import './index.scss'


type PageStateProps = {
  isOpened: boolean,
}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = { percent: any }

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalCashTotalHint {
  props: IProps;
}

class ModalCashTotalHint extends Component<IProps, PageState> {
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
    const {isOpened = false, handleCancel, percent} = this.props;
    return (
      <AtModal isOpened={isOpened} className="at-modal-small">
        {isOpened ? <AtModalContent>
          <Text className="center gray qz-cash-total-hint-modal-content_tip">
            联赛收益总金额
          </Text>
          <AtDivider height={48} lineColor="#E5E5E5"/>
          <Text className="gray qz-cash-total-hint-modal-content_tip">
            球员参与的球星夸夸榜活动中，
          </Text>
          {percent != null ? <Text className="highlight qz-cash-total-hint-modal-content_tip">
            可预提现{percent}%
          </Text> : null}
          {percent != null ? <Text className="gray qz-cash-total-hint-modal-content_tip">
            ，剩余提现金额将在
          </Text> : <Text className="gray qz-cash-total-hint-modal-content_tip">
            提现金额将在
          </Text>}
          <Text className="highlight qz-cash-total-hint-modal-content_tip">
            球星夸夸榜结束后3个工作日
          </Text>
          <Text className="gray qz-cash-total-hint-modal-content_tip">
            内系统根据球员排名，审核并结算剩余提现金额，
          </Text>
          <Text className="highlight qz-cash-total-hint-modal-content_tip">
            具体金额以系统结算后为准
          </Text>
          <Text className="gray qz-cash-total-hint-modal-content_tip">
            。
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

export default ModalCashTotalHint
