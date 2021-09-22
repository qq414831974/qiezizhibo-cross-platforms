import Taro from '@tarojs/taro'
import {Component} from 'react'
import classNames from 'classnames';
import {View, Button} from '@tarojs/components'
import {AtIcon, AtAvatar} from "taro-ui"
import './index.scss'
import logo from "../../assets/default-logo.png";


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  onClose: (event) => any,
  onConfirm: (event) => any,
  onHeatRuleClick: any,
  onAgreementClick: any,
  isOpened: boolean,
  player: any
}

type PageState = {
  _isOpened: boolean;
  check: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface CashAgreementModal {
  props: IProps;
}

class CashAgreementModal extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      _isOpened: false,
      check: true,
    }
  }

  handleClickOverlay = () => {
    this.setState({
      _isOpened: false
    }, this.handleClose);
  };
  handleClose = (event) => {
    if (typeof this.props.onClose === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.props.onClose(event);
    }
  };
  handleConfirm = (event) => {
    if (this.state.check) {
      if (typeof this.props.onConfirm === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.props.onConfirm(event);
      }
    } else {
      Taro.showToast({title: "请先阅读并同意提现规则和免责声明", icon: "none"})
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {isOpened} = nextProps;
    if (isOpened !== this.state._isOpened) {
      this.setState({
        _isOpened: isOpened
      });
    }
  }

  onCheckBoxClick = () => {
    this.setState({check: !this.state.check})
  }
  onHeatRuleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.props.onHeatRuleClick && this.props.onHeatRuleClick()
  }
  onAgreementClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.props.onAgreementClick && this.props.onAgreementClick()
  }

  render() {
    const {_isOpened} = this.state;

    const rootClass = classNames('qz-cash-agreement-modal', {
      'qz-cash-agreement-modal--active': _isOpened
    });

    return (
      <View className={rootClass}>
        <View className="qz-cash-agreement-modal__overlay" onClick={this.handleClickOverlay}/>
        <View className="qz-cash-agreement-modal__container">
          <View className="qz-cash-agreement-modal__content">
            <View className="center">
              <AtAvatar image={this.props.player && this.props.player.headImg ? this.props.player.headImg : logo}/>
            </View>
            <View className="center">
              {this.props.player && this.props.player.name ? this.props.player.name : "球员"}
            </View>
            <View className='qz-cash-agreement-modal-checkbox-container' onClick={this.onCheckBoxClick}>
              <View
                className={`${this.state.check ? "qz-cash-agreement-modal-checkbox" : "qz-cash-agreement-modal-checkbox-disabled"}`}>
                {this.state.check ? <AtIcon value='check' size='10' color='#ffffff'/> : null}
              </View>
              <View className='qz-cash-agreement-modal-checkbox-text' style={{marginLeft: "10rpx"}}>
                我已阅读
              </View>
              <View className='qz-cash-agreement-modal-checkbox-text-underline' onClick={this.onHeatRuleClick}>
                《提现规则》
              </View>
              <View className='qz-cash-agreement-modal-checkbox-text'>
                以及
              </View>
              <View className='qz-cash-agreement-modal-checkbox-text-underline' onClick={this.onAgreementClick}>
                《免责声明》
              </View>
            </View>
          </View>
          <View className="qz-cash-agreement-modal__footer">
            <View className="qz-cash-agreement-modal__action">
              <Button className="mini-gray" onClick={this.handleClose}>关闭</Button>
              <Button onClick={this.handleConfirm}>去提现</Button>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default CashAgreementModal
