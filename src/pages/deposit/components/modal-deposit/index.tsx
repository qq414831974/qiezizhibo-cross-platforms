import Taro from '@tarojs/taro'
import {Component} from 'react'
import {AtModal, AtModalHeader, AtModalContent, AtModalAction, AtInput} from "taro-ui"
import {connect} from 'react-redux'
import {View, Button} from '@tarojs/components'
import {toLogin} from '../../../../utils/utils'
import './index.scss'

const deposit_price = [
  10,
  50,
  100,
  200,
  500,
  1000
]

type PageStateProps = {
  userInfo: any;
  payEnabled: any;
}

type PageDispatchProps = {
  handleConfirm: (data?: any) => any,
  handleCancel: () => any,
}

type PageOwnProps = {
  isOpened: boolean,
}

type PageState = {
  currentDeposit: any;
  inputValue: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalDeposit {
  props: IProps;
}

class ModalDeposit extends Component<IProps, PageState> {

  constructor(props) {
    super(props)
    this.state = {
      currentDeposit: null,
      inputValue: undefined,
    }
  }

  componentDidMount() {
    const openId = this.props.userInfo ? this.props.userInfo.wechatOpenid : null
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    if (userNo == null || openId == null) {
      Taro.showToast({
        title: "登录失效，请重新登录",
        icon: 'none',
        complete: () => {
          toLogin();
        }
      })
      return;
    }
  }

  handleDepositItemClick = (data) => {
    this.setState({currentDeposit: data, inputValue: null});
  }
  handleConfirm = () => {
    const number = Number(this.state.currentDeposit)
    if (number != this.state.currentDeposit) {
      Taro.showToast({
        title: "请输入正确的数字",
        icon: 'none',
      });
      return;
    }
    this.props.handleConfirm && this.props.handleConfirm(number);
  }
  handleInputChange = (value) => {
    this.setState({inputValue: value, currentDeposit: value})
  }

  render() {
    const {isOpened = false, handleCancel} = this.props;
    const {currentDeposit} = this.state;
    return (
      <View>
        <AtModal isOpened={isOpened} onClose={handleCancel}>
          <AtModalHeader>选择充值茄币数量</AtModalHeader>
          {isOpened ? <AtModalContent>
            <View className="qz-deposit-modal__grid">
              {deposit_price && deposit_price.map((data: any) =>
                <View
                  className={`qz-deposit-modal__grid-item ${data == currentDeposit ? "qz-deposit-modal__grid-item-active" : ""}`}
                  key={data}
                  onClick={this.handleDepositItemClick.bind(this, data)}>
                  <View className="qz-deposit-modal__grid-item-text">{data}茄币</View>
                </View>
              )}
            </View>
            <View className="qz-deposit-modal__input">
              <AtInput
                name='value'
                type='number'
                placeholderClass="base-font-size"
                placeholder={isOpened ? "自定义面值" : undefined}
                className="w-full qz-input-no-padding"
                value={this.state.inputValue}
                onChange={this.handleInputChange}/>
            </View>
          </AtModalContent> : null}
          <AtModalAction>
            <Button className="mini-gray" onClick={this.props.handleCancel}>取消</Button>
            <Button className="black" onClick={this.handleConfirm}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    payEnabled: state.config ? state.config.payEnabled : null,
  }
}
export default connect(mapStateToProps)(ModalDeposit)
