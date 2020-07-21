import "taro-ui/dist/style/components/article.scss";
import Taro, {Component} from '@tarojs/taro'
import {AtAvatar} from "taro-ui"
import {View, Text} from '@tarojs/components'
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

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  matchInfo: any;
  onClick: any | null;
  className?: string | null;
  onlytime?: boolean | null;
  showRound?: boolean;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MatchItem {
  props: IProps;
}

class MatchItem extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

  onItemClick = () => {
    if (this.props.matchInfo.activityId) {
      this.props.onClick();
    }
  }

  render() {
    const {matchInfo, className = "", onlytime = false, showRound = true} = this.props
    if (matchInfo == null) {
      return <View/>
    }
    return (
      <View className={"qz-match-item " + className} onClick={this.onItemClick}>
        {matchInfo.hostteam != null && matchInfo.guestteam != null ?
          <View className="qz-match-item-content">
            {(matchInfo.status == 21 && matchInfo.isRecordCharge) || (matchInfo.status < 21 && matchInfo.isLiveCharge) ?
              <View className="qz-match-item__charge">
                付费{matchInfo.payTimes? ` ${matchInfo.payTimes}人已观看`:""}
              </View>
              : null
            }
            <View className='qz-match-item__team'>
              <View className="qz-match-item__team-avatar">
                <AtAvatar circle
                          size="large"
                          image={matchInfo.hostteam && matchInfo.hostteam.headImg ? matchInfo.hostteam.headImg : defaultLogo}/>
              </View>
              <Text
                className="qz-match-item__team-name">
                {matchInfo.hostteam ? matchInfo.hostteam.name : ""}
              </Text>
            </View>
            <View className='qz-match-item__vs'>
              <View className='qz-match-item__vs-content'>
                {matchInfo.league != null ?
                  <Text className="qz-match-item__vs-league-name">
                    {matchInfo.league.shortname ? matchInfo.league.shortname : matchInfo.league.name}
                  </Text> : <View/>}
                {matchInfo.round != null && showRound ?
                  <Text className="qz-match-item__vs-match-round">
                    {matchInfo.round}
                  </Text> : <View/>}
                <Text
                  className={matchInfo.penaltyscore ? "qz-match-item__vs-match-score qz-match-item__vs-match-score-small" : "qz-match-item__vs-match-score"}>
                  {matchInfo.status == -1 ? "VS" : matchInfo.score}
                </Text>
                {matchInfo.penaltyscore ?
                  <Text className="qz-match-item__vs-match-score-penalty">
                    {`点球:${matchInfo.penaltyscore}`}
                  </Text> : null
                }
                <View className="qz-match-item__vs-match-status">
                  <View className="status-box">
                    <View
                      className={`background ${matchInfo.activityId == null ? "" : eventType[matchInfo.status].color}`}>
                      <Text className={matchInfo.activityId == null ? "text-disabled" : "text"}>
                        {eventType[matchInfo.status].text}
                      </Text>
                      <View
                        className={`status-icon ${matchInfo.activityId == null ? "none" : eventType[matchInfo.status].color}`}>
                        <View
                          className={`icon ${matchInfo.activityId == null ? "none" : eventType[matchInfo.status].color}`}/>
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
                <AtAvatar circle
                          size="large"
                          image={matchInfo.guestteam && matchInfo.guestteam.headImg ? matchInfo.guestteam.headImg : defaultLogo}/>
              </View>
              <Text
                className="qz-match-item__team-name">
                {matchInfo.guestteam ? matchInfo.guestteam.name : ""}
              </Text>
            </View>
          </View>
          :
          <View className="qz-match-item-content">
            <View className='qz-match-item__vs qz-match-item__vs-full'>
              <View className='qz-match-item__vs-content'>
                {matchInfo.league != null ?
                  <Text className="qz-match-item__vs-league-name">
                    {matchInfo.league.shortname ? matchInfo.league.shortname : matchInfo.league.name}
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
                      className={`background ${matchInfo.activityId == null ? "" : eventType[matchInfo.status].color}`}>
                      <Text className={matchInfo.activityId == null ? "text-disabled" : "text"}>
                        {eventType[matchInfo.status].text}
                      </Text>
                      <View
                        className={`status-icon ${matchInfo.activityId == null ? "none" : eventType[matchInfo.status].color}`}>
                        <View
                          className={`icon ${matchInfo.activityId == null ? "none" : eventType[matchInfo.status].color}`}/>
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

export default MatchItem
