import Taro, {Component} from '@tarojs/taro'
import {AtModal, AtModalContent, AtModalAction, AtAvatar, AtDivider} from "taro-ui"
import {View, Text, Button} from '@tarojs/components'
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {
  onClick: () => any,
}

type PageOwnProps = {
  background: any,
  top: any,
  className: any,
}

type PageState = {
  activeClass: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface RectFab {
  props: IProps;
}

class RectFab extends Component<PageOwnProps, PageState> {
  static defaultProps = {
    onClick: () => {
    },
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({activeClass: "qz-fab-rect-active"})
    }, 600);
  }

  render() {
    const {children, onClick, background, top, className} = this.props;
    return (
      <View className={`qz-fab-rect ${this.state.activeClass} ${className}`}
            onClick={onClick}
            style={{background: background, top: `${top}`}}>
        {children}
      </View>
    )
  }
}

export default RectFab
