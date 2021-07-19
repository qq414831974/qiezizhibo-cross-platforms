import {Component} from 'react'
import classNames from 'classnames';
import {View, Text, OfficialAccount} from '@tarojs/components'
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  onClose: any;
  isOpened: boolean,
}

type PageState = {
  _isOpened: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface OfficialAccountModal {
  props: IProps;
}

class OfficialAccountModal extends Component<IProps, PageState> {
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {isOpened} = nextProps;
    if (isOpened !== this.state._isOpened) {
      this.setState({
        _isOpened: isOpened
      });
    }
  }

  render() {
    const {_isOpened} = this.state;

    const rootClass = classNames('official-account', {
      'official-account--active': _isOpened
    });
    return (
      <View className={rootClass}>
        <View className="official-account__overlay" onClick={this.handleClickOverlay}/>
        <View className="official-account__container">
          <View className="official-account__content">
            <View className="content">
              <View className="content-title">
                <Text>加关注，赛事随时看</Text>
                <View className="content__btn-close" onClick={this.handleClickOverlay}/>
              </View>
              <OfficialAccount/>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default OfficialAccountModal
