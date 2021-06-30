import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Image, Text} from '@tarojs/components'
import {AtActivityIndicator} from "taro-ui"
import {connect} from 'react-redux'

import './registrationList.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import NavBar from "../../components/nav-bar";
import logo from "../../assets/default-logo.png";
import EncryptionModal from "../../components/modal-encryption";
import registrationAction from "../../actions/registration";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  encryptionShow: boolean;
  loading: boolean;
  teamList: Array<any>;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface RegistrationList {
  props: IProps;
}

class RegistrationList extends Component<IProps, PageState> {
  navRef: any = null;
  leagueId: any = null;

  constructor(props) {
    super(props)
    this.state = {
      encryptionShow: true,
      loading: false,
      teamList: [],
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.leagueId = this.getParamId();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getParamId = () => {
    let leagueId;
    const router = getCurrentInstance().router;
    if (router && router.params != null) {
      if (router.params.leagueId == null && router.params.scene != null) {
        leagueId = router.params.scene
      } else if (router.params.leagueId != null) {
        leagueId = router.params.leagueId
      } else {
        return null
      }
    } else {
      return null;
    }
    return leagueId;
  }
  getRegistrationList = (password) => {
    if (password == null || password.trim() == "") {
      Taro.showToast({title: "请输入密码", icon: "none"})
      return;
    }
    this.setState({loading: true})
    new Request().post(api.API_LEAGUE_REGISTRATION_TEAM_ALL, {
      leagueId: this.leagueId,
      passwordInput: password,
    }).then((res: any) => {
      if (res && res.isSuccess) {
        this.setState({teamList: res.registrationTeamList, loading: false, encryptionShow: false});
      } else {
        Taro.showToast({title: "密码错误", icon: "none"})
      }
    })
  }
  onRegistrationTeamClick = (regTeam) => {
    Taro.navigateTo({url: `../registration/registration?leagueId=${this.leagueId}&regTeamId=${regTeam.id}&editable=false`});
  }
  onEncryptionConfirm = (password) => {
    registrationAction.setRegistrationVerifyCompleteFunc(this.getRegistrationList.bind(this, password))
    this.getRegistrationList(password);
  }
  onEncryptionCancel = () => {
    Taro.navigateBack({
      delta: 1
    })
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
      <View className='qz-registration-list-content'>
        <NavBar
          title='已报名的球队'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        {loading ? <View className="qz-registration-list-loading">
            <AtActivityIndicator
              mode="center"
              content="加载中..."/>
          </View> :
          <View className='qz-registration-list__registration'>
            <View className='qz-registration-list__registration-team'>
              {teamList && teamList.map((team, index) => {
                return <View key={`team-${index}`}
                             onClick={this.onRegistrationTeamClick.bind(this, team)}
                             className='qz-registration-list__registration-team__item'>
                  <View className='qz-registration-list__registration-team__item-inner'>
                    <View className='qz-registration-list__registration-team__item-avatar'>
                      <Image mode='scaleToFill' src={team.headImg ? team.headImg : logo}/>
                    </View>
                    <View className='qz-registration-list__registration-team__item-content item-content'>
                      <View className='item-content__info'>
                        <View className='item-content__info-title'>{team.name ? team.name : "球队"}</View>
                      </View>
                    </View>
                    <View className='qz-registration-list__registration-team__item-extra item-extra'>
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
        <EncryptionModal
          isOpened={this.state.encryptionShow}
          handleConfirm={this.onEncryptionConfirm}
          handleCancel={this.onEncryptionCancel}/>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(RegistrationList)
