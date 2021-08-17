import classNames from 'classnames';
import React, {Component} from 'react';
import {Text, View, Image} from '@tarojs/components';

import './index.scss'

import {delayQuerySelector} from '../../utils/utils';

type PageStateProps = {}
type PageDispatchProps = {}
type PageOwnProps = {
  /**
   * 是否默认开启
   * @default false
   */
  open?: boolean
  /**
   * 标题
   */
  title?: string
  /**
   * 图标
   */
  icon?: any
  /**
   * 是否开启动画
   * @default true
   * @since v2.0.0-beta.3
   */
  isAnimation?: boolean
  /**
   * 是否有头部下划线
   * @default true
   */
  hasBorder?: boolean
  /**
   * 描述信息
   */
  note?: string
  /**
   * 点击头部触发事件
   */
  onClick?: (open: boolean, event: any) => void
}

type PageState = {
  wrapperHeight: number,
}
type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Accordion {
  props: IProps;
}

class Accordion extends Component<IProps, PageState> {
  handleClick = null;
  isCompleted = true;
  startOpen = false;

  static defaultProps = {
    open: false,
    customStyle: '',
    className: '',
    title: '',
    note: '',
    icon: null,
    hasBorder: true,
    isAnimation: true
  };

  constructor(props) {
    super(props);
    this.handleClick = (event) => {
      const {open} = this.props;
      if (!this.isCompleted)
        return;
      this.props.onClick && this.props.onClick(!open, event);
    };
    this.isCompleted = true;
    this.startOpen = false;
    this.state = {
      wrapperHeight: 0
    };
  }

  toggleWithAnimation() {
    const {open, isAnimation} = this.props;
    if (!this.isCompleted || !isAnimation)
      return;
    this.isCompleted = false;
    delayQuerySelector('.qz-accordion__body', 0).then(rect => {
      const height = parseInt(rect[0].height.toString());
      const startHeight = open ? height : 0;
      const endHeight = open ? 0 : height;
      this.startOpen = false;
      this.setState({
        wrapperHeight: startHeight
      }, () => {
        setTimeout(() => {
          this.setState({
            wrapperHeight: endHeight
          }, () => {
            setTimeout(() => {
              this.isCompleted = true;
              this.setState({});
            }, 700);
          });
        }, 100);
      });
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.props.open) {
      this.startOpen = !!nextProps.open && !!nextProps.isAnimation;
      this.toggleWithAnimation();
    }
  }

  render() {
    const {customStyle, className, title, icon, hasBorder, open, note} = this.props;
    const {wrapperHeight} = this.state;
    const rootCls = classNames('qz-accordion', className);
    const headerCls = classNames('qz-accordion__header', {
      'qz-accordion__header--noborder': !hasBorder
    });
    const arrowCls = classNames('qz-accordion__arrow', {
      'qz-accordion__arrow--folded': !!open
    });
    const contentCls = classNames('qz-accordion__content', {
      'qz-accordion__content--inactive': (!open && this.isCompleted) || this.startOpen
    });
    const contentStyle = {height: `${wrapperHeight}px`};
    if (this.isCompleted) {
      contentStyle.height = '';
    }
    return (React.createElement(View, {className: rootCls, style: customStyle},
      React.createElement(View, {className: headerCls, onClick: this.handleClick},
        icon && (React.createElement(Image, {src: icon, className: 'qz-accordion__info__icon'})),
        React.createElement(View, {className: 'qz-accordion__info'},
          React.createElement(View, {className: 'qz-accordion__info__title'}, title),
          React.createElement(View, {className: 'qz-accordion__info__note'}, note)),
        React.createElement(View, {className: arrowCls},
          React.createElement(Text, {className: 'at-icon at-icon-chevron-down'}))),
      React.createElement(View, {style: contentStyle, className: contentCls},
        React.createElement(View, {className: 'qz-accordion__body'}, this.props.children))));
  }
}

export default Accordion
