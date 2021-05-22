import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Image} from '@tarojs/components'
import './index.scss'
import defaultPoster from '../../../../assets/default-poster.jpg';

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  hidden: boolean;
  medias: [];
  needPay: boolean;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MatchClip {
  props: IProps;
}

class MatchClip extends Component<IProps, PageState> {
  static defaultProps = {}
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  onMediaClick = (mediaId) => {
    if(this.props.needPay){
      Taro.showToast({
        title: "购买比赛后才可观看本场比赛剪辑",
        duration: 2000,
        icon: "none",
      });
      return;
    }
    Taro.navigateTo({url: `../media/media?id=${mediaId}`});
  }

  render() {
    const {medias = [], hidden = false} = this.props
    if (hidden) {
      return <View/>
    }
    return (
      <View className="qz-match-clip" hidden={hidden}>
        {medias && medias.map((media: any) => {
          return <View key={media.id} className="qz-match-clip-item"
                       onClick={this.onMediaClick.bind(this, media.mediaId)}>
            <Image
              className="qz-match-clip-item-img"
              src={media.meida && media.meida.poster ? media.meida.poster : defaultPoster}/>
            <View className="qz-match-clip-item-title">{media.media ? media.media.title : "集锦"}</View>
          </View>;
        })}
      </View>
    )
  }
}

export default MatchClip
