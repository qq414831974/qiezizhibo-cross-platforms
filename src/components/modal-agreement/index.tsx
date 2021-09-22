import {Component} from 'react'
import classNames from 'classnames';
import {View, Image, ScrollView, Button} from '@tarojs/components'
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  onClose: (event) => any,
  onConfirm?: (event) => any,
  picUrl: any;
  isOpened: boolean,
}

type PageState = {
  _isOpened: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface AgreementModal {
  props: IProps;
}

class AgreementModal extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      _isOpened: false,
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
    if (typeof this.props.onConfirm === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.props.onConfirm(event);
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

  render() {
    const {picUrl = null} = this.props
    const {_isOpened} = this.state;

    const rootClass = classNames('qz-agreement-modal', {
      'qz-agreement-modal--active': _isOpened
    });

    return (
      <View className={rootClass}>
        <View className="qz-agreement-modal__overlay" onClick={this.handleClickOverlay}/>
        <View className="qz-agreement-modal__container">
          <ScrollView scrollY className="qz-agreement-modal__content">
            <View className="content">
              <Image
                id="heat-img"
                className='qz-agreement-modal-img'
                src={picUrl}
                mode="widthFix"/>
            </View>
          </ScrollView>
          <View className="qz-agreement-modal__footer">
            {this.props.onConfirm != null ? <View className="qz-agreement-modal__action">
                <Button className="mini-gray" onClick={this.handleClose}>不同意</Button>
                <Button onClick={this.handleConfirm}>同意</Button>
              </View> :
              <View className="qz-agreement-modal__action">
                <Button className="mini-gray" onClick={this.handleClose}>我知道了</Button>
              </View>
            }
          </View>
        </View>
      </View>
    )
  }
}

export default AgreementModal
