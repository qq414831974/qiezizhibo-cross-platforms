import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, ScrollView, Image, Button, Text} from '@tarojs/components'
import {AtActivityIndicator, AtAvatar, AtActionSheet, AtActionSheetItem, AtToast, AtIcon} from 'taro-ui'
import {connect} from 'react-redux'
import ModalAlbum from "../../../../components/modal-album";

import './index.scss'
import logo from "../../../../assets/default-logo.png";
import {formatDate, getTimeDifference} from "../../../../utils/utils";
import ShareMoment from "../../../../components/share-moment";
import Request from "../../../../utils/request";
import * as api from "../../../../constants/api";

type PageStateProps = {
  report?: any;
}

type PageDispatchProps = {}

type PageOwnProps = {
  leagueMatch: any;
  loading: boolean;
  visible: boolean;
  tabScrollStyle: any;
  leagueRegistration: any;
  userLeagueRegistration: any;
}

type PageState = {
  reportLoading: boolean;
  sheetOpen: boolean;
  photoUrl: string;
  downLoading: boolean;
  permissionShow: boolean;
  regStatus: any;
  endDiffDayTime: any;
  timerID_CountDown: any;
  shareMomentOpen: boolean;
  shareMomentLoading: boolean;
  shareMomentPoster: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueRegulations {
  props: IProps;
}

const STATUS = {
  unknow: -1,
  unopen: 0,
  open: 1,
  finish: 2,
}

class LeagueRegulations extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      reportLoading: false,
      sheetOpen: false,
      photoUrl: "",
      downLoading: false,
      permissionShow: false,
      regStatus: null,
      endDiffDayTime: null,
      timerID_CountDown: null,
      shareMomentOpen: false,
      shareMomentLoading: false,
      shareMomentPoster: null,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.startTimer_CountDown();
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  componentWillUnmount() {
    this.clearTimer_CountDown();
  }

  getPlaceString = (placeArrsay: Array<string>) => {
    let placeStr = "";
    for (let i = 0; i < placeArrsay.length; i++) {
      if (i == 0) {
        placeStr = placeArrsay[i];
      } else {
        placeStr = placeStr + ", " + placeArrsay[i];
      }
    }
    return placeStr;
  }
  openSheet = (photo) => {
    this.setState({photoUrl: photo, sheetOpen: true})
  }
  handleSheetClose = () => {
    this.setState({sheetOpen: false})
  }
  savePhoto = () => {
    this.setState({downLoading: true})
    Taro.downloadFile({
      url: this.state.photoUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          Taro.saveImageToPhotosAlbum({filePath: res.tempFilePath}).then(saveres => {
            console.log(saveres)
            this.showMessage("保存成功", "success")
            this.setState({downLoading: false, sheetOpen: false})
          }, () => {
            this.showMessage("保存失败", "error")
            this.setState({downLoading: false, sheetOpen: false, permissionShow: true})
          })
        }
      }
    });
  }
  onPremissionClose = () => {
    this.setState({permissionShow: false})
  }
  onPremissionCancel = () => {
    this.setState({permissionShow: false})
  }
  onPremissionSuccess = () => {
    this.setState({permissionShow: false})
  }
  showMessage = (title, type) => {
    Taro.showToast({
      'title': title,
      'icon': type,
    })
  }
  onRegistrationClick = () => {
    Taro.navigateTo({url: `../registration/registration?leagueId=${this.props.leagueMatch.id}&editable=true`});
  }
  onRegistrationTeamClick = (regTeam) => {
    const endTime = this.props.leagueRegistration && this.props.leagueRegistration.dateEnd ? new Date(this.props.leagueRegistration.dateEnd) : null;
    const nowDate = new Date();
    if (endTime != null && endTime.getTime() < nowDate.getTime()) {
      Taro.showToast({title: "不在报名时段内", icon: "none"});
      return;
    }
    Taro.navigateTo({url: `../registration/registration?leagueId=${this.props.leagueMatch.id}&regTeamId=${regTeam.id}&editable=true`});
  }
  onRegistrationListClick = () => {
    Taro.navigateTo({url: `../registrationList/registrationList?leagueId=${this.props.leagueMatch.id}`});
  }
  getVerifyStatus = (status) => {
    if (status == null) {
      return null;
    }
    switch (status) {
      case -2:
        return "未提交";
      case -1:
        return "审核中";
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
  getEndDiffTime = () => {
    const endTime = this.props.leagueRegistration && this.props.leagueRegistration.dateEnd ? new Date(this.props.leagueRegistration.dateEnd) : null;
    if (endTime) {
      const diff = getTimeDifference(endTime, true);
      this.setState({
        endDiffDayTime: diff,
      });
    }
  }
  getStatus = () => {
    const endTime = this.props.leagueRegistration && this.props.leagueRegistration.dateEnd ? new Date(this.props.leagueRegistration.dateEnd) : null;
    if (endTime == null) {
      return STATUS.unknow;
    }
    const nowDate = new Date().getTime();
    const endTime_diff = endTime.getTime() - nowDate;
    if (endTime_diff > 0) {
      return STATUS.open;
    } else {
      return STATUS.finish;
    }
  }
  startTimer_CountDown = () => {
    this.clearTimer_CountDown();
    const timerID_CountDown = setInterval(() => {
      const status = this.getStatus();
      this.setState({regStatus: status})
      if (status == STATUS.open) {
        this.getEndDiffTime()
      }
    }, 1000)
    this.setState({timerID_CountDown: timerID_CountDown})
  }
  clearTimer_CountDown = () => {
    if (this.state.timerID_CountDown) {
      clearInterval(this.state.timerID_CountDown)
      this.setState({timerID_CountDown: null})
    }
  }
  onCountDownTitleClick = () => {
    Taro.showToast({title: "报名截止后，组委不再受理球队的报名及报名表修改，如需修改或报名请联系组委会", icon: "none", duration: 3000})
  }
  onGenRegistrationCodeClick = () => {
    if (this.state.downLoading) {
      return;
    }
    this.setState({downLoading: true})
    if (this.props.leagueRegistration && this.props.leagueRegistration.sharePic) {
      this.setState({
        shareMomentPoster: this.props.leagueRegistration.sharePic,
        shareMomentOpen: true,
        downLoading: false
      })
    } else {
      new Request().get(api.API_GET_REGISTRATION_LEAGUE_SHARE, {leagueId: this.props.leagueMatch.id}).then((shareData: any) => {
        if (shareData) {
          this.setState({shareMomentPoster: shareData, shareMomentOpen: true, downLoading: false})
        } else {
          Taro.showToast({title: "生成失败", icon: "none"})
          this.setState({downLoading: false})
        }
      });
    }
  }
  onShareMomentConfirm = () => {
    this.setState({shareMomentLoading: true})
    Taro.downloadFile({
      url: this.state.shareMomentPoster,
      success: (res) => {
        if (res.statusCode === 200) {
          Taro.saveImageToPhotosAlbum({filePath: res.tempFilePath}).then(saveres => {
            console.log(saveres)
            Taro.showToast({
              title: "图片保存到相册成功",
              icon: 'none',
            });
            this.setState({shareMomentLoading: false})
          }, () => {
            Taro.showToast({
              title: "图片保存到相册失败",
              icon: 'none',
            });
            this.setState({shareMomentLoading: false, permissionShow: true})
          })
        }
      }
    });
  }
  onShareMomentCancel = () => {
    this.setState({shareMomentOpen: false})
  }

  render() {
    const {loading = false, visible = false, leagueMatch = {}, report = null, leagueRegistration = null} = this.props
    const {regStatus, endDiffDayTime} = this.state
    if (!visible) {
      return <View/>
    }
    if (loading) {
      return <View className="qz-league-regulations__result-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <ScrollView scrollY className='qz-league-regulations__result' style={this.props.tabScrollStyle}>
        {leagueMatch.poster ?
          <Image
            onClick={this.openSheet.bind(this, leagueMatch.poster)}
            className='qz-league-regulations__poster'
            src={leagueMatch.poster}/> : null}
        <View className='qz-league-regulations__header'>
          <View className='qz-league-regulations__header-avatar'>
            <AtAvatar
              circle
              size="large"
              image={leagueMatch.headImg ? leagueMatch.headImg : logo}/>
          </View>
          <View className='qz-league-regulations__header-des'>
            <View className='qz-league-regulations__header-des-name'>{leagueMatch.name}</View>
            <View className='qz-league-regulations__header-des-city'>{leagueMatch.city}</View>
            <View className='qz-league-regulations__header-des-time'>
              {`${formatDate(new Date(leagueMatch.dateBegin))} ~ ${formatDate(new Date(leagueMatch.dateEnd))}`}
            </View>
          </View>
        </View>
        <View className='qz-league-regulations__info'>
          {leagueMatch.majorSponsor ? <View className='at-row qz-league-regulations__info-container'>
            <View className='at-col at-col-2 at-col__offset-1 qz-league-regulations__info-title'>主办方</View>
            <View
              className='at-col at-col-8 at-col__offset-1 at-col--wrap qz-league-regulations__info-content'>{leagueMatch.majorSponsor}</View>
          </View> : null}
          {leagueMatch.sponsor ? <View className='at-row qz-league-regulations__info-container'>
            <View className='at-col at-col-2 at-col__offset-1 qz-league-regulations__info-title'>赞助商</View>
            <View
              className='at-col at-col-8 at-col__offset-1 at-col--wrap qz-league-regulations__info-content'>{leagueMatch.sponsor}</View>
          </View> : null}
          {leagueMatch.phoneNumber ? <View className='at-row qz-league-regulations__info-container'>
            <View className='at-col at-col-2 at-col__offset-1 qz-league-regulations__info-title'>电话</View>
            <View
              className='at-col at-col-8 at-col__offset-1 at-col--wrap qz-league-regulations__info-content'>{leagueMatch.phoneNumber}</View>
          </View> : null}
          <View className='at-row qz-league-regulations__info-container'>
            <View className='at-col at-col-2 at-col__offset-1 qz-league-regulations__info-title'>类型</View>
            <View
              className='at-col at-col-8 at-col__offset-1 at-col--wrap qz-league-regulations__info-content'>{leagueMatch.type == 1 ? "杯赛" : "联赛"}</View>
          </View>
          {leagueMatch.regulations && leagueMatch.regulations.population && leagueMatch.regulations.population != 0 ?
            <View className='at-row qz-league-regulations__info-container'>
              <View className='at-col at-col-2 at-col__offset-1 qz-league-regulations__info-title'>赛制</View>
              <View
                className='at-col at-col-8 at-col__offset-1 at-col--wrap qz-league-regulations__info-content'>{leagueMatch.regulations.population}人制</View>
            </View> : null}
          {leagueMatch.place && leagueMatch.place.length > 0 ?
            <View className='at-row qz-league-regulations__info-container'>
              <View className='at-col at-col-2 at-col__offset-1 qz-league-regulations__info-title'>场地</View>
              <View
                className='at-col at-col-8 at-col__offset-1 at-col--wrap qz-league-regulations__info-content'>{this.getPlaceString(leagueMatch.place)}</View>
            </View> : null}
          {leagueMatch.description ? <View className='at-row qz-league-regulations__info-container'>
            <View className='at-col at-col-2 at-col__offset-1 qz-league-regulations__info-title'>简介</View>
            <View
              className='at-col at-col-8 at-col__offset-1 at-col--wrap qz-league-regulations__info-content'>{leagueMatch.description}</View>
          </View> : null}
        </View>
        {this.props.leagueRegistration && this.props.leagueRegistration.available ?
          <View className='qz-league-regulations__info'>
            <View className="qz-league-regulations__info-title text-center" onClick={this.onCountDownTitleClick}>
              报名倒计时<AtIcon value='help' size='12' color='#999'/>
            </View>
            <View className="qz-league-regulations__info-content text-center">
              {regStatus == STATUS.open ? `报名中 ${endDiffDayTime ? `${endDiffDayTime.diffTime ? endDiffDayTime.diffDay + endDiffDayTime.diffTime : ""}` : ""}` : ""}
              {regStatus == STATUS.finish ? `报名已结束` : ""}
            </View>
            <View className="qz-league-regulations__info-link text-center" onClick={this.onGenRegistrationCodeClick}>
              点击生成报名二维码
            </View>
          </View>
          : null}
        <View className='qz-league-regulations__registration'>
          {this.props.userLeagueRegistration && this.props.userLeagueRegistration.length > 0 ?
            <View className='qz-league-regulations__registration-title'>
              我报名的球队
            </View> : null}
          <View className='qz-league-regulations__registration-team'>
            {this.props.userLeagueRegistration && this.props.userLeagueRegistration.map((team, index) => {
              return <View key={`team-${index}`}
                           onClick={this.onRegistrationTeamClick.bind(this, team)}
                           className='qz-league-regulations__registration-team__item'>
                <View className='qz-league-regulations__registration-team__item-inner'>
                  <View className='qz-league-regulations__registration-team__item-avatar'>
                    <Image mode='scaleToFill' src={team.headImg ? team.headImg : logo}/>
                  </View>
                  <View className='qz-league-regulations__registration-team__item-content item-content'>
                    <View className='item-content__info'>
                      <View className='item-content__info-title'>{team.name ? team.name : "球队"}</View>
                    </View>
                  </View>
                  <View className='qz-league-regulations__registration-team__item-extra item-extra'>
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
          {leagueRegistration && leagueRegistration.available && regStatus == STATUS.open ?
            <Button onClick={this.onRegistrationClick}>球队报名（领队使用）</Button> : null
          }
          {leagueRegistration ?
            <Button onClick={this.onRegistrationListClick}>报名球队查看/审核（组委会使用）</Button> : null
          }
        </View>
        {report && report.url ?
          <View className='qz-league-regulations__report'>
            <View className='qz-league-regulations__report-title'>↓↓↓战报（点击图片可保存）↓↓↓</View>
            <Image
              onClick={this.openSheet.bind(this, report.url)}
              className='qz-league-regulations__report-img'
              src={report.url}
              mode="widthFix"/>
          </View> : null}
        <AtActionSheet
          isOpened={this.state.sheetOpen}
          cancelText='取消'
          onCancel={this.handleSheetClose}
          onClose={this.handleSheetClose}>
          <AtActionSheetItem onClick={this.savePhoto}>
            保存图片
          </AtActionSheetItem>
        </AtActionSheet>
        <AtToast isOpened={this.state.downLoading} text="下载中..." status="loading"/>
        <ModalAlbum
          isOpened={this.state.permissionShow}
          handleConfirm={this.onPremissionSuccess}
          handleCancel={this.onPremissionCancel}
          handleClose={this.onPremissionClose}/>
        <ShareMoment
          isOpened={this.state.shareMomentOpen}
          loading={this.state.shareMomentLoading}
          poster={this.state.shareMomentPoster}
          handleConfirm={this.onShareMomentConfirm}
          handleCancel={this.onShareMomentCancel}
        />
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    report: state.league.leagueReport,
  }
}
export default connect(mapStateToProps)(LeagueRegulations)
