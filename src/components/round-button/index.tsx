import {Component} from 'react'
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
  margin?: any;
  animation?: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface RoundButton {
  props: IProps;
}

class RoundButton extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {img = null, size, onClick, text = null, openType = null, margin = null, animation = false} = this.props
    const style = {
      height: size + "px",
      width: size + "px",
      lineHeight: size,
      borderRadius: size / 2 + "px",
    }
    const viewStyle: any = {
      width: size + (text == null ? 0 : 24) + "px",
    }
    if (margin) {
      viewStyle.margin = margin;
    }
    const textStyle = {
      width: size + 24 + "px",
    }
    return <View style={viewStyle}
                 className={`qz-round-button-content ${animation ? "qz-round-button-content-animation" : ""}`}
                 onClick={onClick}>
      <Button style={style} className="qz-round-button" openType={openType}>
        {img ? <Image src={img}/> : null}
      </Button>
      {text ? <View style={textStyle} className="qz-round-button-text-content"><Text
        className="qz-round-button-text">{text}</Text></View> : null}
    </View>
  }
}

export default RoundButton
