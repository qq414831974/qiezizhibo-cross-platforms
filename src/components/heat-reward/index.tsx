import Taro from '@tarojs/taro'
import {Component} from 'react'
import classNames from 'classnames';
import {View, Image, ScrollView, Button} from '@tarojs/components'
import {AtActivityIndicator} from "taro-ui"
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  onClose: (event) => any,
  heatRule: any;
  loading: boolean;
  isOpened: boolean,
  scrollBottom: boolean,
}

type PageState = {
  _isOpened: boolean;
  _scrollBottom: boolean;
  scrollTop: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface HeatReward {
  props: IProps;
}

class HeatReward extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      _isOpened: false,
      _scrollBottom: false,
      scrollTop: null,
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
    const {isOpened, scrollBottom} = nextProps;
    if (isOpened !== this.state._isOpened) {
      this.setState({
        _isOpened: isOpened
      });
    }
    if (scrollBottom != null && scrollBottom !== this.state._scrollBottom) {
      const that = this
      Taro.createSelectorQuery().select('#heat-img').boundingClientRect(function (rect) {
        if(scrollBottom){
          that.setState({
            scrollTop: rect.height,
          });
        }else{
          that.setState({
            scrollTop: 0,
          });
        }
      }).exec()
      this.setState({
        _scrollBottom: scrollBottom,
      });
    }
  }

  render() {
    const {heatRule = null, loading = true} = this.props
    const {_isOpened, scrollTop} = this.state;

    const rootClass = classNames('qz-heat-reward', {
      'qz-heat-reward--active': _isOpened
    });

    return (
      <View className={rootClass}>
        <View className="qz-heat-reward__overlay" onClick={this.handleClickOverlay}/>
        <View className="qz-heat-reward__container">
          <ScrollView scrollY scrollTop={scrollTop} className="qz-heat-reward__content">
            {loading ?
              <View className="qz-heat-reward-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
              :
              <View className="content">
                {heatRule.award ? <View className='qz-heat-reward-title'>{heatRule.award}</View> : null}
                <Image
                  id="heat-img"
                  className='qz-heat-reward-img'
                  src={heatRule.awardPic}
                  mode="widthFix"/>
              </View>
            }
          </ScrollView>
          <View className="qz-heat-reward__footer">
            <View className="qz-heat-reward__action">
              <Button className="mini-gray" onClick={this.handleClose}>我知道了</Button>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default HeatReward
