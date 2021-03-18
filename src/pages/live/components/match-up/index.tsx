import Taro, {Component} from '@tarojs/taro'
import {AtAvatar, AtIcon} from "taro-ui"
import {View, Text, Image} from '@tarojs/components'

import defaultLogo from '../../../../assets/default-logo.png'
import noUser from '../../../../assets/no-user.png'
import './index.scss'
import {formatTime, formatMonthDayTime} from "../../../../utils/utils";

const eventType: { [key: number]: { text: string, color: string }; } = {}
eventType[-1] = {text: "未开始", color: "unopen"};
eventType[0] = {text: "比赛中", color: "live"};
eventType[11] = {text: "加时", color: "live"};
eventType[12] = {text: "点球大战", color: "live"};
eventType[13] = {text: "伤停", color: "live"};
eventType[14] = {text: "中场", color: "live"};
eventType[15] = {text: "下半场", color: "live"};
eventType[16] = {text: "暂停", color: "live"};
eventType[21] = {text: "比赛结束", color: "finish"};

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  matchInfo: any;
  matchStatus: any;
  onClick?: any | null;
  className?: string | null;
  onlytime?: boolean | null;
  onMonopolyClick: any;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MatchUp {
  props: IProps;
}

class MatchUp extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  onItemClick = () => {
    // if (this.props.matchInfo.activityId) {
    //   this.props.onClick();
    // }
  }
  onMonopolyClick = () => {
    this.props.onMonopolyClick();
  }

  render() {
    const {matchInfo, matchStatus, className = "", onlytime = false} = this.props
    if (matchInfo == null) {
      return <View/>
    }
    return (
      <View className={'qz-match-up-content ' + className}>
        <View className='qz-match-up-content__inner'>
          <View className='qz-match-up-item' onClick={this.onItemClick}>
            {matchInfo.hostTeam != null && matchInfo.guestTeam != null ?
              <View className='qz-match-up-item-content'>
                <View className='qz-match-up-item__team'>
                  <View className='qz-match-up-item__team-avatar'>
                    <AtAvatar circle
                              size='large'
                              image={matchInfo.hostTeam && matchInfo.hostTeam.headImg ? matchInfo.hostTeam.headImg : defaultLogo}/>
                  </View>
                  <Text
                    className='qz-match-up-item__team-name'>
                    {matchInfo.hostTeam ? matchInfo.hostTeam.name : ""}
                  </Text>
                </View>
                <View className='qz-match-up-item__vs'>
                  {matchInfo.startTime && <View className='qz-match-up-item__vs-content'>
                    <Text className='qz-match-up-item__vs-match-time'>
                      {`${onlytime ? formatMonthDayTime(new Date(matchInfo.startTime)) : formatTime(new Date(matchInfo.startTime))} ${eventType[matchStatus.status != null ? matchStatus.status : -1].text}`}
                    </Text>
                    <Text
                      className={matchStatus.penaltyScore || matchStatus.score.length > 5 ? 'qz-match-up-item__vs-match-score qz-match-up-item__vs-match-score-small' : 'qz-match-up-item__vs-match-score'}>
                      {matchStatus.status == -1 ? "VS" : matchStatus.score}
                    </Text>
                    {matchStatus.penaltyScore ?
                      <Text className='qz-match-up-item__vs-match-score-penalty'>
                        {matchStatus.penaltyScore}
                      </Text> : null
                    }
                    {matchInfo.round != null ?
                      <Text className='qz-match-up-item__vs-match-round'>
                        {matchInfo.round}
                      </Text> : <View/>}
                    {matchInfo.place ?
                      <View className='qz-match-up-item__vs-match-place'>
                        <AtIcon value='map-pin' size='12' className='qz-match-up-item__vs-match-place-icon'/>
                        <Text className='text'>
                          {matchInfo.place}
                        </Text>
                      </View>
                      : null
                    }
                    {matchInfo.isMonopoly && matchInfo.monopolyUser ?
                      <View className='qz-match-up-item__vs-match-monopoly__container'>
                        <Text className='title'>
                          感谢金主爸爸
                        </Text>
                        <View className='qz-match-up-item__vs-match-monopoly'>
                          <Image className='avatar'
                                 src={matchInfo.monopolyUser.avatar ? matchInfo.monopolyUser.avatar : defaultLogo}/>
                          <Text className={matchInfo.monopolyUser.name.length >= 7 ? 'text-small' : "text"}>
                            {matchInfo.monopolyUser.name}
                          </Text>
                        </View>
                      </View>
                      : matchInfo.isMonopolyCharge
                        ?
                        <View className='qz-match-up-item__vs-match-monopoly__container'
                              onClick={this.onMonopolyClick}>
                          <Text className='title'>
                            感谢金主爸爸
                          </Text>
                          <View className='qz-match-up-item__vs-match-monopoly'>
                            <Image className='avatar'
                                   src={noUser}/>
                            <Text className="text-small">
                              暂无金主支持
                            </Text>
                          </View>
                        </View>
                        : null
                    }
                  </View>}
                </View>
                <View className='qz-match-up-item__team'>
                  <View className='qz-match-up-item__team-avatar'>
                    <AtAvatar circle
                              size='large'
                              image={matchInfo.guestTeam && matchInfo.guestTeam.headImg ? matchInfo.guestTeam.headImg : defaultLogo}/>
                  </View>
                  <Text
                    className='qz-match-up-item__team-name'>
                    {matchInfo.guestTeam ? matchInfo.guestTeam.name : ""}
                  </Text>
                </View>
              </View>
              :
              <View className='qz-match-up-item-content'>
                <View className='qz-match-up-item__vs qz-match-up-item__vs-full'>
                  {matchInfo.startTime && <View className='qz-match-up-item__vs-content'>
                    <Text className='qz-match-up-item__vs-match-time'>
                      {`${onlytime ? formatMonthDayTime(new Date(matchInfo.startTime)) : formatTime(new Date(matchInfo.startTime))} ${eventType[matchStatus.status != null ? matchStatus.status : -1].text}`}
                    </Text>
                    <Text className='qz-match-up-item__vs-match-name'>
                      {matchInfo.name}
                    </Text>
                    {matchInfo.round != null ?
                      <Text className='qz-match-up-item__vs-match-round'>
                        {matchInfo.round}
                      </Text> : <View/>}
                    {matchInfo.place ?
                      <View className='qz-match-up-item__vs-match-place'>
                        <AtIcon value='map-pin' size='12' className='qz-match-up-item__vs-match-place-icon'/>
                        <Text className='text'>
                          {matchInfo.place}
                        </Text>
                      </View>
                      : null
                    }
                    {matchInfo.isMonopoly && matchInfo.monopolyUser ?
                      <View className='qz-match-up-item__vs-match-monopoly__container'>
                        <Text className='title'>
                          感谢金主爸爸
                        </Text>
                        <View className='qz-match-up-item__vs-match-monopoly'>
                          <Image className='avatar'
                                 src={matchInfo.monopolyUser.avatar ? matchInfo.monopolyUser.avatar : defaultLogo}/>
                          <Text className={matchInfo.monopolyUser.name.length >= 7 ? 'text-small' : "text"}>
                            {matchInfo.monopolyUser.name}
                          </Text>
                        </View>
                      </View>
                      : matchInfo.isMonopolyCharge
                        ? <View className='qz-match-up-item__vs-match-monopoly__container'
                                onClick={this.props.onMonopolyClick}>
                          <Text className='title'>
                            感谢金主爸爸
                          </Text>
                          <View className='qz-match-up-item__vs-match-monopoly'>
                            <Image className='avatar'
                                   src={noUser}/>
                            <Text className="text-small">
                              暂无金主支持
                            </Text>
                          </View>
                        </View>
                        : null
                    }
                  </View>}
                </View>
              </View>}
          </View>
        </View>
      </View>
    )
  }
}

export default MatchUp
