import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtAvatar} from "taro-ui"
import {connect} from '@tarojs/redux'
import {View, Text, Image} from '@tarojs/components'
import defaultLogo from '../../assets/default-logo.png'
import './index.scss'
import {formatTime, formatDayTime} from "../../utils/utils";

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

type PageStateProps = {
  payEnabled?: boolean;
}

type PageDispatchProps = {}

type PageOwnProps = {
  matchInfo: any;
  onClick: any | null;
  onBetClick: any | null;
  className?: string | null;
  onlytime?: boolean | null;
  showRound?: boolean;
  showCharge?: boolean;
  showBet?: boolean;
  forceClick?: boolean;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MatchItem {
  props: IProps | any;
}

class MatchItem extends Component<PageOwnProps | any, PageState> {
  static defaultProps = {}

  onItemClick = () => {
    if (this.props.matchInfo.available || this.props.forceClick) {
      this.props.onClick && this.props.onClick();
    }
  }
  onBetClick = (e) => {
    e.stopPropagation();
    this.props.onBetClick && this.props.onBetClick();
  }

  render() {
    const {matchInfo, className = "", onlytime = false, showRound = true, showCharge = true, payEnabled, showBet = true} = this.props
    if (matchInfo == null) {
      return <View/>
    }
    // matchInfo.isBetEnable = true
    return (
      <View className={`qz-match-item ${matchInfo.isBetEnable && showBet ? "qz-match-item-big" : ""} ${className}`}
            onClick={this.onItemClick}>
        {matchInfo.hostTeam != null && matchInfo.guestTeam != null ?
          <View className={`qz-match-item-content ${matchInfo.isBetEnable && showBet? "qz-match-item-content-big" : ""}`}>
            {((matchInfo.status == 21 && matchInfo.isRecordCharge) || (matchInfo.status < 21 && matchInfo.isLiveCharge)) && payEnabled && showCharge ?
              <View className="qz-match-item__charge">
                {matchInfo.isMonopoly ?
                  (matchInfo.monopolyUser ?
                      <View className="qz-match-item__charge-user">
                        <Image className='avatar'
                               src={matchInfo.monopolyUser.avatar ? matchInfo.monopolyUser.avatar : defaultLogo}/>
                        {matchInfo.monopolyUser.name}
                        请大家围观
                      </View>
                      : "匿名用户请大家围观"
                  ) : (matchInfo.chargeTimes ? `付费 ${matchInfo.chargeTimes}人已观看` : "付费")}
              </View>
              : null
            }
            {matchInfo.isBetEnable && showBet ?
              <View className="qz-match-item-top-skewed" onClick={this.onBetClick}>
                <View className="qz-match-item-top-skewed-center-text">
                  比分竞猜
                </View>
              </View>
              : null}
            <View className='qz-match-item__team'>
              <View className="qz-match-item__team-avatar">
                <Image src={matchInfo.hostTeam && matchInfo.hostTeam.headImg ? matchInfo.hostTeam.headImg : defaultLogo}/>
              </View>
              <Text
                className="qz-match-item__team-name">
                {matchInfo.hostTeam ? matchInfo.hostTeam.name : ""}
              </Text>
            </View>
            <View className='qz-match-item__vs'>
              <View className='qz-match-item__vs-content'>
                {matchInfo.league != null ?
                  <Text className="qz-match-item__vs-league-name">
                    {matchInfo.league.shortName ? matchInfo.league.shortName : matchInfo.league.name}
                  </Text> : <View/>}
                {matchInfo.round != null && showRound ?
                  <Text className="qz-match-item__vs-match-round">
                    {matchInfo.round}
                  </Text> : <View/>}
                <Text
                  className={matchInfo.penaltyScore ? "qz-match-item__vs-match-score qz-match-item__vs-match-score-small" : "qz-match-item__vs-match-score"}>
                  {matchInfo.status == -1 ? "VS" : matchInfo.score}
                </Text>
                {matchInfo.penaltyScore ?
                  <Text className="qz-match-item__vs-match-score-penalty">
                    {`点球:${matchInfo.penaltyScore}`}
                  </Text> : null
                }
                <View className="qz-match-item__vs-match-status">
                  <View className="status-box">
                    <View
                      className={`background ${matchInfo.activityId == null || !matchInfo.available ? "" : eventType[matchInfo.status].color}`}>
                      <Text className={matchInfo.activityId == null || !matchInfo.available ? "text-disabled" : "text"}>
                        {eventType[matchInfo.status].text}
                      </Text>
                      <View
                        className={`status-icon ${matchInfo.activityId == null || !matchInfo.available ? "none" : eventType[matchInfo.status].color}`}>
                        <View
                          className={`icon ${matchInfo.activityId == null || !matchInfo.available ? "none" : eventType[matchInfo.status].color}`}/>
                      </View>
                    </View>
                  </View>
                </View>
                <Text className="qz-match-item__vs-match-time">
                  {onlytime ? formatDayTime(new Date(matchInfo.startTime)) : formatTime(new Date(matchInfo.startTime))}
                </Text>
              </View>
            </View>
            <View className='qz-match-item__team'>
              <View className="qz-match-item__team-avatar">
                <Image src={matchInfo.guestTeam && matchInfo.guestTeam.headImg ? matchInfo.guestTeam.headImg : defaultLogo}/>
              </View>
              <Text
                className="qz-match-item__team-name">
                {matchInfo.guestTeam ? matchInfo.guestTeam.name : ""}
              </Text>
            </View>
          </View>
          :
          <View className="qz-match-item-content">
            <View className='qz-match-item__vs qz-match-item__vs-full'>
              <View className='qz-match-item__vs-content'>
                {matchInfo.league != null ?
                  <Text className="qz-match-item__vs-league-name">
                    {matchInfo.league.shortName ? matchInfo.league.shortName : matchInfo.league.name}
                  </Text> : <View/>}
                {matchInfo.round != null && showRound ?
                  <Text className="qz-match-item__vs-match-round">
                    {matchInfo.round}
                  </Text> : <View/>}
                <Text className="qz-match-item__vs-match-name">
                  {matchInfo.name}
                </Text>
                <View className="qz-match-item__vs-match-status">
                  <View className="status-box">
                    <View
                      className={`background ${matchInfo.activityId == null || !matchInfo.available ? "" : eventType[matchInfo.status].color}`}>
                      <Text className={matchInfo.activityId == null || !matchInfo.available ? "text-disabled" : "text"}>
                        {eventType[matchInfo.status].text}
                      </Text>
                      <View
                        className={`status-icon ${matchInfo.activityId == null || !matchInfo.available ? "none" : eventType[matchInfo.status].color}`}>
                        <View
                          className={`icon ${matchInfo.activityId == null || !matchInfo.available ? "none" : eventType[matchInfo.status].color}`}/>
                      </View>
                    </View>
                  </View>
                </View>
                <Text className="qz-match-item__vs-match-time">
                  {onlytime ? formatDayTime(new Date(matchInfo.startTime)) : formatTime(new Date(matchInfo.startTime))}
                </Text>
              </View>
            </View>
          </View>}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    payEnabled: state.config ? state.config.payEnabled : null,
  }
}
export default connect(mapStateToProps)(MatchItem)
