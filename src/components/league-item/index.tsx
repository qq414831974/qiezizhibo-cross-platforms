import {Component} from 'react'
import {View, Text, Image} from '@tarojs/components'
import defaultLogo from '../../assets/default-logo.png'
import defaultPoster from '../../assets/default-poster.jpg'
import './index.scss'
import {formatDate, formatMonthDay} from "../../utils/utils";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  leagueInfo: any;
  onClick?: any | null;
  pictureOnly?: boolean | null;
  withoutName?: boolean | null;
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueItem {
  props: IProps;
}

class LeagueItem extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  getDateString = (leagueInfo) => {
    const now = new Date();
    const start = new Date(leagueInfo.dateBegin);
    const end = new Date(leagueInfo.dateEnd);
    let isOn = false;
    let dateString = "";
    if (now.getFullYear() != start.getFullYear()) {
      dateString = formatDate(start);
    } else {
      dateString = formatMonthDay(start);
    }
    if (now.getFullYear() != end.getFullYear()) {
      dateString = dateString + "-" + formatDate(end);
    } else {
      dateString = dateString + "-" + formatMonthDay(end);
    }
    if (now > start && now < end) {
      isOn = true;
    }
    return {isOn, dateString};
  }

  render() {
    const {leagueInfo, pictureOnly = false, withoutName = false} = this.props
    if (leagueInfo == null) {
      return <View/>
    }
    const date = this.getDateString(leagueInfo);
    return <View className="qz-league-item" onClick={this.props.onClick}>
      <View className="qz-league-item-content">
        {!withoutName && !pictureOnly && <View className='qz-league-item__title qz-league-item__title-bottom-gradient'>
          <Image className="img"
                 src={leagueInfo.headImg ? leagueInfo.headImg : defaultLogo}/>
          <Text className="name">{leagueInfo.shortName ? leagueInfo.shortName : leagueInfo.name}</Text>
        </View>}
        {!pictureOnly && <View className="qz-league-item__info">
          {leagueInfo.city ? <View className="city">{leagueInfo.city}</View> : null}
          {leagueInfo.dateBegin ?
            <Text className={`time ${date.isOn ? "live" : "nolive"}`}>
              {date.dateString}
            </Text>
            :
            <Text className="time">
              {leagueInfo.isParent ? "系列赛" : null}
            </Text>
          }
          {leagueInfo.isParent ? <Text className="series">
            系列赛
          </Text> : null}
        </View>}
        {leagueInfo.registration &&  leagueInfo.registration.available ? <Text className="registration">
          球队报名
        </Text> : null}
      </View>
      <Image src={leagueInfo.poster ? leagueInfo.poster : defaultPoster} className="qz-league-item__poster"/>
    </View>
  }
}

export default LeagueItem
