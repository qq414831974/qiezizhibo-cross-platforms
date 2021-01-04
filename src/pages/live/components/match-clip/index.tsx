import Taro, {Component} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import './index.scss'
import defaultPoster from '../../../../assets/default-poster.jpg';

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  hidden: boolean;
  medias: [];
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MatchClip {
  props: IProps;
}

class MatchClip extends Component<PageOwnProps, PageState> {
  static defaultProps = {}
  onMediaClick = (mediaId) => {
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
