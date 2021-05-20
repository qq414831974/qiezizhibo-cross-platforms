import Taro, {Component} from '@tarojs/taro'
import {View, Image, Button} from '@tarojs/components'
import {AtModal, AtModalContent, AtModalAction} from "taro-ui"
import './index.scss'
import NoUser from '../../assets/no-user.png'
import * as global from "../../constants/global";
import flame from "../../assets/live/left-support.png";

type PageStateProps = {}

type PageDispatchProps = {
  handleCancel: () => any,
}

type PageOwnProps = {
  heatType: any,
  heatRanks: any,
  loading: any,
  isOpened: boolean,
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface HeatRank {
  props: IProps;
}


class HeatRank extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  getFontSize = (data) => {
    if (this.props.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.props.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
      data = data.player;
    } else {
      data = data.team;
    }
    if (data && data.shortName && data.shortName.leagueMember > 7) {
      if (data && data.shortName && data.shortName.length > 9) {
        return "qz-heatrank-text-mini";
      }
      return "qz-heatrank-text-small";
    }
    if (data && data.name && data.name.length > 7) {
      if (data && data.name && data.name.length > 9) {
        return "qz-heatrank-text-mini";
      }
      return "qz-heatrank-text-small";
    }
  }
  getHeatHeadImg = (data) => {
    if (this.props.heatType == null) {
      return NoUser;
    }
    if (this.props.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.props.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
      return data.player && data.player.headImg ? data.player.headImg : NoUser
    }
    return data.team && data.team.headImg ? data.team.headImg : NoUser
  }
  getHeatName = (data) => {
    if (this.props.heatType == null) {
      return "选手";
    }
    if (this.props.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.props.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
      return data.player && data.player.name ? data.player.name : "选手"
    }
    if (data.team && data.team.shortName) {
      return data.team.shortName;
    }
    return data.team && data.team.name ? data.team.name : "选手"
  }
  getHeat = (heatObject) => {
    let heat = 0;
    if (heatObject.heat) {
      heat = heat + heatObject.heat;
    }
    if (heatObject.heatBase) {
      heat = heat + heatObject.heatBase;
    }
    return heat;
  }
  handleJump = () => {

  }

  render() {
    const {isOpened = false, heatRanks = [], handleCancel} = this.props

    return (
      <View>
        <AtModal className="at-modal-big" isOpened={isOpened} onClose={handleCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-heatrank">
              <View className="qz-heatrank-scroll-content">
                {heatRanks == null || heatRanks.length == 0 ?
                  <View className="qz-heatrank-content-nomore">暂无</View>
                  : null}
                {heatRanks && heatRanks.map((item: any) => (
                  <View key={item.id} className='qz-heatrank-content'>
                    <View className='qz-heatrank-list'>
                      <View className='qz-heatrank-list__item'>
                        <View className='qz-heatrank-list__item-container'>
                          <View
                            className={`qz-heatrank-list__item-rank ${item.index <= 3 ? `qz-heatrank-list__item-rank-r${item.index}` : ""}`}>
                            <View className='qz-heatrank-list__item-rank-text'>
                              {item.index}
                            </View>
                          </View>
                          <View className='qz-heatrank-list__item-avatar'>
                            <Image mode='scaleToFill' src={this.getHeatHeadImg(item)}/>
                          </View>
                          <View className='qz-heatrank-list__item-content item-content'>
                            <View className='item-content__info'>
                              <View className={`item-content__info-title ${this.getFontSize(item)}`}>
                                {this.getHeatName(item)}
                              </View>
                            </View>
                          </View>
                          <View className='qz-heatrank-list__item-extra item-extra'>
                            <Image className='item-extra__img' src={flame}/>
                            <View className='item-extra__text'>
                              {this.getHeat(item)}
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
                }
              </View>
            </View>
          </AtModalContent> : null}
          <AtModalAction>
            <Button className="qz-heatrank-button" onClick={this.handleJump}>更多球员</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default HeatRank
