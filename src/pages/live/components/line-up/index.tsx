import Taro, {Component} from '@tarojs/taro'
import {View, ScrollView, Text, Image} from '@tarojs/components'
import {AtSegmentedControl, AtActivityIndicator} from 'taro-ui'
import './index.scss'
import noperson from '../../../../assets/no-person.png';
import shirt from '../../../../assets/live/t-shirt.png';


type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  players: [];
  matchInfo: any;
  switchTab: any;
  loading: boolean;
  hidden: any;
}

type PageState = {
  current: number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LineUp {
  props: IProps;
}

class LineUp extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      current: 0
    }
  }

  handleClick = (value) => {
    this.setState({
      current: value
    }, () => {
      this.props.switchTab(this.state.current);
    })
  }

  render() {
    const {players = [], matchInfo = {}, loading = false, hidden = false} = this.props
    const hostTeam = matchInfo.hostTeam ? matchInfo.hostTeam : {name: "主队"};
    const guestTeam = matchInfo.guestTeam ? matchInfo.guestTeam : {name: "客队"};
    if (hidden) {
      return <View/>
    }
    return (
      <View className="qz-lineup">
        <AtSegmentedControl
          values={[hostTeam.name, guestTeam.name]}
          onClick={this.handleClick}
          current={this.state.current}
        />
        <ScrollView scrollY className="qz-lineup-scroll-content">
          {loading ?
            <View className="qz-lineup-content-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
            :
            players.map((item: any) => (
              <View key={item.id} className='qz-lineup-content'>
                <View className='qz-lineup-list'>
                  <View className='qz-lineup-list__item'>
                    <View className='qz-lineup-list__item-container'>
                      <View className='qz-lineup-list__item-avatar'>
                        <Image mode='scaleToFill' src={item.headImg ? item.headImg : noperson}/>
                      </View>
                      <View className='qz-lineup-list__item-content item-content'>
                        <View className='item-content__info'>
                          <View className='item-content__info-title'>{item.name}</View>
                          {/*{"11" && <View className='item-content__info-note'>{111}</View>}*/}
                        </View>
                      </View>
                      <View className='qz-lineup-list__item-extra item-extra'>
                        <View className='item-extra__image'>
                          <Image mode='aspectFit' src={shirt}/>
                          <Text>{item.shirtNum}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          }
        </ScrollView>
      </View>
    )
  }
}

export default LineUp
