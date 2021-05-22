import {Component} from 'react'
import {View, Text} from '@tarojs/components'
import './index.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  percent: number;
  leftText?: string;
  rightText?: string;
  leftColor?: any;
  rightColor?: any;
  leftMoveClass?: any;
  rightMoveClass?: any;
  className?: string;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface StatBar {
  props: IProps;
}

class StatBar extends Component<IProps, PageState> {
  static defaultProps = {}
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  render() {
    const {percent, leftColor = "#FF4949", rightColor = "#78A4F4", leftText = "", rightText = "", leftMoveClass = "", rightMoveClass = "", className = ""} = this.props
    let leftPercent = percent;
    let rightPercent = 100 - percent;
    if (leftPercent < 2 || rightPercent > 98) {
      leftPercent = 2;
      rightPercent = 98;
    }
    if (rightPercent < 2 || leftPercent > 98) {
      leftPercent = 98;
      rightPercent = 2;
    }
    const leftProgressStyle = {
      width: `${leftPercent}%`,
      backgroundColor: leftColor,
      background: `linear-gradient(-45deg, transparent 9px, ${leftColor} 0) top right`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
    }
    const rightProgressStyle = {
      width: `${rightPercent}%`,
      backgroundColor: rightColor,
      background: `linear-gradient(135deg, transparent 9px, ${rightColor} 0) bottom left`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
    }
    const leftAddTextStyle = {
      color: leftColor,
    }
    const rightAddTextStyle = {
      color: rightColor,
    }

    return (
      <View className={"qz-stat-bar " + className}>
        <View className='qz-stat-bar__outer'>
          <View className='qz-stat-bar__outer-inner'>
            <View
              className='qz-stat-bar__outer-inner-left qz-stat-bar__outer-inner-background'
              style={leftProgressStyle}
            >
              <Text className='qz-stat-bar__outer-inner-left qz-stat-bar__outer-inner-text'>
                {leftText}
              </Text>
              <Text
                className={`qz-stat-bar__outer-inner-left qz-stat-bar__outer-inner-text-add ${leftMoveClass}`}
                style={leftAddTextStyle}
              >
                +1
              </Text>
            </View>
            <View
              className='qz-stat-bar__outer-inner-right qz-stat-bar__outer-inner-background'
              style={rightProgressStyle}
            >
              <Text className='qz-stat-bar__outer-inner-right qz-stat-bar__outer-inner-text'>
                {rightText}
              </Text>
              <Text
                className={`qz-stat-bar__outer-inner-right qz-stat-bar__outer-inner-text-add ${rightMoveClass}`}
                style={rightAddTextStyle}
              >
                +1
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default StatBar
