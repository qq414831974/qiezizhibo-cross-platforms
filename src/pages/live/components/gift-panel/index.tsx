import Taro, {Component} from '@tarojs/taro'
import {View, ScrollView, Text, Image, Picker} from '@tarojs/components'
import {AtActivityIndicator, AtGrid, AtButton, AtList, AtListItem} from 'taro-ui'
import './index.scss'
import noperson from '../../../../assets/no-person.png';
import shirt from '../../../../assets/live/t-shirt.png';


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  gifts: [];
  loading: boolean;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface GiftPanel {
  props: IProps;
}

class GiftPanel extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const {gifts = [], loading = false} = this.props
    return (
      <View className="qz-gifts">
        {loading ?
          <View className="qz-lineup-content-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
          :
          <View>
            <ScrollView scrollY className="qz-gifts__content">
              <View className="qz-gifts__grid">
                {gifts.map((data: any) => (
                    <View className="qz-gifts__grid-item">
                      <Image src={data.pic}/>
                    </View>
                  )
                )}
              </View>
            </ScrollView>
            <View className="qz-gifts__bottom-container">
              <View className="qz-gifts__bottom at-row">
                <View className="at-col at-col-6">

                </View>
                <View className="at-col at-col-6">
                  <View className="at-row">
                    <View className="at-col at-col-6 qz-gifts__bottom-num-container">
                      <View className="qz-gifts__bottom-num">
                        1
                      </View>
                      <View className="at-icon at-icon-chevron-down qz-gifts__bottom-arrow"/>
                    </View>
                    <View className="at-col at-col-6 qz-gifts__bottom-button">
                      <AtButton className="vertical-middle half-circle-button" size="small" type="primary" full circle>
                        发送
                      </AtButton>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        }
      </View>
    )
  }
}

export default GiftPanel
