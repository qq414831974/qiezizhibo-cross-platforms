import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Image, Text} from '@tarojs/components'
import {AtActivityIndicator} from "taro-ui"
import {connect} from 'react-redux'

import './myRegistration.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import NavBar from "../../components/nav-bar";
import logo from "../../assets/default-logo.png";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  teamList: Array<any>;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface MyRegistration {
  props: IProps;
}

class MyRegistration extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      teamList: [],
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
    this.getUserLeagueRegistration();
  }

  componentDidHide() {
  }

  getUserLeagueRegistration = () => {
    new Request().get(api.API_LEAGUE_REGISTRATION_USER, {
      userNo: this.props.userInfo.userNo
    }).then((res: any) => {
      this.setState({teamList: res})
    })
  }
  onRegistrationTeamClick = (regTeam) => {
    Taro.navigateTo({url: `../registration/registration?leagueId=${regTeam.leagueId}&regTeamId=${regTeam.id}&editable=true`});
  }

  getVerifyStatus = (status) => {
    if (status == null) {
      return null;
    }
    switch (status) {
      case -2:
        return "未提交";
      case -1:
        return "待审核";
      case 0:
        return "审核不通过";
      case 1:
        return "已审核通过";
    }
  }
  getVerifyStatusClass = (status) => {
    if (status == null) {
      return null;
    }
    switch (status) {
      case -1:
        return "";
      case 0:
        return "not-pass";
      case 1:
        return "pass";
    }
  }

  render() {
    const {teamList, loading} = this.state

    return (
      <View className='qz-my-registration-list-content'>
        <NavBar
          title='我报名的球队'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        {loading ? <View className="qz-my-registration-list-loading">
            <AtActivityIndicator
              mode="center"
              content="加载中..."/>
          </View> :
          <View className='qz-my-registration-list__registration'>
            <View className='qz-my-registration-list__registration-team'>
              {teamList && teamList.map((team, index) => {
                return <View key={`team-${index}`}
                             onClick={this.onRegistrationTeamClick.bind(this, team)}
                             className='qz-my-registration-list__registration-team__item'>
                  <View className='qz-my-registration-list__registration-team__item-inner'>
                    <View className='qz-my-registration-list__registration-team__item-avatar'>
                      <Image mode='scaleToFill' src={team.headImg ? team.headImg : logo}/>
                    </View>
                    <View className='qz-my-registration-list__registration-team__item-content item-content'>
                      <View className='item-content__info'>
                        <View className='item-content__info-title'>{team.name ? team.name : "球队"}</View>
                        {team.league ? <View className='item-content__info-note'>
                          {team.league && team.league.name ? team.league.name : "联赛"}
                        </View> : null}
                      </View>
                    </View>
                    <View className='qz-my-registration-list__registration-team__item-extra item-extra'>
                      <View
                        className={`item-extra__text ${team.verifyStatus != null ? this.getVerifyStatusClass(team.verifyStatus) : ""}`}>
                        <Text>{team.verifyStatus != null ? this.getVerifyStatus(team.verifyStatus) : null}</Text>
                      </View>
                      <View className='at-icon at-icon-chevron-right'>
                      </View>
                    </View>
                  </View>
                </View>
              })}
            </View>
          </View>
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(MyRegistration)
