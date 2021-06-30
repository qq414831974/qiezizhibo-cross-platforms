import {Component} from 'react'
import {View, Image, Button} from '@tarojs/components'
import {AtActivityIndicator, AtModal, AtModalContent, AtModalAction} from "taro-ui"
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = {
  registrationRule: any;
  loading: boolean;
  isOpened: boolean,
}

type PageState = {
  current: number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ContractModal {
  props: IProps;
}

class ContractModal extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      current: 0,
    }
  }

  render() {
    const {isOpened = false, registrationRule = null, loading = true, handleCancel} = this.props

    return (
      <View>
        <AtModal className="at-modal-huge" isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-contract">
              {loading ?
                <View className="qz-contract-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
                :
                <View>
                  <Image
                    className='qz-contract-img'
                    src={registrationRule.contractPic}
                    mode="widthFix"/>
                </View>
              }
            </View>
          </AtModalContent> : null}
          <AtModalAction>
            <Button className="mini-gray" onClick={handleCancel}>关闭</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default ContractModal
