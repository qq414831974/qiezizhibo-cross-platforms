import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import './index.scss'
import {
  redcard,
  yellowcard,
  change,
  goal,
  owngoal,
  shoot,
  substitutionLeft,
  substitutionRight
} from '../../../../utils/assets';
import noperson from '../../../../assets/no-person.png';

const eventType = {
  1: {text: "进球", icon: goal},
  2: {text: "射门", icon: shoot},
  7: {text: "黄牌", icon: yellowcard},
  8: {text: "红牌", icon: redcard},
  10: {text: "换人", icon: change, secondIcon: {left: substitutionLeft, right: substitutionRight}},
  22: {text: "乌龙球", icon: owngoal},
};

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  timeline: [];
  matchInfo: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface TimeLine {
  props: IProps;
}

class TimeLine extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  render() {
    const {timeline = [], matchInfo = {}} = this.props
    return (
      <View className="qz_time-line-content">
        {timeline && timeline.map((item: any) => {
          const secondPlayer = item.secondPlayer ? item.secondPlayer : {}
          return (
            <View key={item.id} className="qz_time-line-item">
              <View className="qz_time-line-item-tail"/>
              <View className="qz_time-line-item-dot">
                <Image src={eventType[item.eventType].icon}/>
              </View>
              {matchInfo && matchInfo.hostTeam && matchInfo.hostTeam.id == item.teamId ?
                <View className="qz_time-line-item-content qz_time-line-item-left">
                  <View className="qz_time-line-item-content__item qz_time-line-item-content__item-left">
                    {eventType[item.eventType].secondIcon ?
                      <View className="qz_time-line-item-content__item-second-player-content">
                        <View className="qz_time-line-item-content__item-second-player">
                          <View className="qz_time-line-item-content__item-second-player-img">
                            <Image src={secondPlayer && secondPlayer.headImg ? secondPlayer.headImg : noperson}/>
                            {secondPlayer && secondPlayer.shirtNum &&
                            <View className="qz_time-line-item-content__item-second-player-img__shirtnum">
                              <Text>{secondPlayer && secondPlayer.shirtNum}</Text>
                            </View>}
                          </View>
                          <Text>{secondPlayer && secondPlayer.name}</Text>
                        </View>
                        <View className="qz_time-line-item-content__item-second-player-dot">
                          <Image src={eventType[item.eventType].secondIcon.left}/>
                        </View>
                      </View>
                      : null}
                    <View className="qz_time-line-item-content__item-player">
                      <View className="qz_time-line-item-content__item-player-img">
                        <Image src={item.player && item.player.headImg ? item.player.headImg : noperson}/>
                        {item.player && item.player.shirtNum &&
                        <View className="qz_time-line-item-content__item-player-img__shirtnum">
                          <Text>{item.player && item.player.shirtNum}</Text>
                        </View>}
                      </View>
                      <Text>{item.player && item.player.name}</Text>
                    </View>
                    <View className="qz_time-line-item-content__item-time">
                      {`${item.time}`}'
                    </View>
                  </View>
                </View>
                : null}
              {matchInfo && matchInfo.guestTeam && matchInfo.guestTeam.id == item.teamId ?
                <View className="qz_time-line-item-content qz_time-line-item-right">
                  <View className="qz_time-line-item-content__item qz_time-line-item-content__item-right">
                    <View className="qz_time-line-item-content__item-time">
                      {`${item.time}`}'
                    </View>
                    <View className="qz_time-line-item-content__item-player">
                      <View className="qz_time-line-item-content__item-player-img">
                        <Image src={item.player && item.player.headImg ? item.player.headImg : noperson}/>
                        {item.player && item.player.shirtNum &&
                        <View className="qz_time-line-item-content__item-player-img__shirtnum">
                          <Text>{item.player && item.player.shirtNum}</Text>
                        </View>}
                      </View>
                      <Text>{item.player && item.player.name}</Text>
                    </View>
                    {eventType[item.eventType].secondIcon ?
                      <View className="qz_time-line-item-content__item-second-player-content">
                        <View className="qz_time-line-item-content__item-second-player-dot">
                          <Image src={eventType[item.eventType].secondIcon.right}/>
                        </View>
                        <View className="qz_time-line-item-content__item-second-player">
                          <View className="qz_time-line-item-content__item-second-player-img">
                            <Image src={secondPlayer && secondPlayer.headImg ? secondPlayer.headImg : noperson}/>
                            {secondPlayer && secondPlayer.shirtNum &&
                            <View className="qz_time-line-item-content__item-second-player-img__shirtnum">
                              <Text>{secondPlayer && secondPlayer.shirtNum}</Text>
                            </View>}
                          </View>
                          <Text>{secondPlayer && secondPlayer.name}</Text>
                        </View>
                      </View>
                      : null}
                  </View>
                </View>
                : null}
            </View>
          )
        })}
      </View>
    )
  }
}

export default TimeLine
