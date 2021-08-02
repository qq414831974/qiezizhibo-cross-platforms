import classNames from 'classnames';
import React, {Component} from 'react';
import {ScrollView, View} from '@tarojs/components';

import './index.scss'

type PageStateProps = {}
type PageDispatchProps = {}
type PageOwnProps = {
  /**
   * 控制是否出现在页面上
   * @default false
   */
  isOpened: boolean
  /**
   * 元素的标题
   */
  title?: any
  /**
   * 是否垂直滚动
   * @default true
   */
  scrollY?: boolean
  /**
   * 是否水平滚动
   * @default false
   */
  scrollX?: boolean
  /**
   * 设置竖向滚动条位置
   */
  scrollTop?: number
  /**
   * 设置横向滚动条位置
   */
  scrollLeft?: number
  /**
   * 距顶部/左边多远时，触发 scrolltolower 事件
   */
  upperThreshold?: number
  /**
   * 距底部/右边多远时，触发 scrolltolower 事件
   */
  lowerThreshold?: number
  /**
   * 在设置滚动条位置时使用动画过渡
   * @default false
   */
  scrollWithAnimation?: boolean
  /**
   * 元素被关闭时候触发的事件
   */
  onClose?: any
  /**
   * 滚动时触发的事件
   */
  onScroll?: any
  /**
   * 滚动到顶部/左边，会触发 onScrollToUpper 事件
   */
  onScrollToUpper?: any
  /**
   * 滚动到底部/右边，会触发 onScrollToLower 事件
   */
  onScrollToLower?: any
}

type PageState = {
  _isOpened: boolean
}
type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface FloatLayout {
  props: IProps;
}

class FloatLayout extends Component<IProps, PageState> {
  handleClose = null;
  handleTouchMove = null;
  close = null;

  static defaultProps = {
    title: '',
    isOpened: false,
    scrollY: true,
    scrollX: false,
    scrollWithAnimation: false
  };

  constructor(props) {
    super(props);
    this.handleClose = () => {
      if (typeof this.props.onClose === 'function') {
        this.props.onClose();
      }
    };
    this.close = () => {
      this.setState({
        _isOpened: false
      }, this.handleClose);
    };
    this.handleTouchMove = (e) => {
      e.stopPropagation();
    };
    const {isOpened} = props;
    this.state = {
      _isOpened: isOpened
    };
  }

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
    const {title, scrollY, scrollX, scrollTop, scrollLeft, upperThreshold, lowerThreshold, scrollWithAnimation} = this.props;
    const rootClass = classNames('qz-float-layout', {
      'qz-float-layout--active': _isOpened
    }, this.props.className);
    return (React.createElement(View, {className: rootClass, onTouchMove: this.handleTouchMove},
      React.createElement(View, {onClick: this.close, className: 'qz-float-layout__overlay'}),
      React.createElement(View, {className: 'qz-float-layout__container layout'},
        title ? (React.createElement(View, {className: 'layout-header'},
          React.createElement(View, {className: 'layout-header__title'}, title),
          React.createElement(View, {className: 'layout-header__btn-close', onClick: this.close}))) : null,
        React.createElement(View, {className: 'layout-body'},
          React.createElement(ScrollView, {
            scrollY: scrollY,
            scrollX: scrollX,
            scrollTop: scrollTop,
            scrollLeft: scrollLeft,
            upperThreshold: upperThreshold,
            lowerThreshold: lowerThreshold,
            scrollWithAnimation: scrollWithAnimation,
            onScroll: this.props.onScroll,
            onScrollToLower: this.props.onScrollToLower,
            onScrollToUpper: this.props.onScrollToUpper,
            className: 'layout-body__content'
          }, this.props.children)))));
  }
}

export default FloatLayout

