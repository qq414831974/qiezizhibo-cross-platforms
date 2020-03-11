import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components'
import './index.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  size: number;
  onClick: any;
  img?: any;
  text?: any;
  param?: any;
  openType?: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface RoundButton {
  props: IProps;
}

class RoundButton extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  render() {
    const {img = null, size, onClick, text = null, openType = null} = this.props
    const style = {
      height: size + "px",
      width: size + "px",
      lineHeight: size,
      borderRadius: size / 2 + "px",
    }
    const viewStyle = {
      width: size + 24 + "px",
    }
    const textStyle = {
      width: size + 24 + "px",
    }
    return <View style={viewStyle} className="qz-round-button-content" onClick={onClick}>
      <Button style={style} className="qz-round-button" openType={openType}>
        {img ? <Image src={img}/> : null}
      </Button>
      {text ? <View style={textStyle} className="qz-round-button-text-content"><Text
        className="qz-round-button-text">{text}</Text></View> : null}
    </View>
  }
}

export default RoundButton
