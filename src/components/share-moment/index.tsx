import {Component} from 'react'
import {View, Image, Button} from '@tarojs/components'
import {AtModal, AtModalContent, AtModalAction} from "taro-ui"
import './index.scss'


type PageStateProps = {}

type PageDispatchProps = {
  handleCancel: () => any,
  handleConfirm: () => any,
}

type PageOwnProps = {
  poster: any;
  isOpened: boolean,
  loading: boolean,
}

type PageState = {
  current: number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ShareMoment {
  props: IProps;
}

class ShareMoment extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      current: 0
    }
  }

  render() {
    const {isOpened = false, poster = null, loading = false, handleCancel, handleConfirm} = this.props

    return (
      <View>
        <AtModal className="at-modal-big" isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-sharemoment">
              <View>
                <Image
                  className='qz-sharemoment-img'
                  src={poster}
                  mode="widthFix"/>
              </View>
            </View>
          </AtModalContent> : null}
          <AtModalAction>
            <Button className="mini-gray" onClick={handleCancel}>关闭</Button>
            <Button className="qz-sharemoment-download" loading={loading} disabled={loading}
                    onClick={handleConfirm}><View className='at-icon at-icon-download'/>下载图片</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default ShareMoment
