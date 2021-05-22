import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, ScrollView, Image} from '@tarojs/components'
import {AtActivityIndicator, AtAvatar, AtActionSheet, AtActionSheetItem, AtToast, AtMessage} from 'taro-ui'
import {connect} from 'react-redux'
import ModalAlbum from "../../../../components/modal-album";

import './index.scss'
import logo from "../../../../assets/default-logo.png";
import {formatDate} from "../../../../utils/utils";

type PageStateProps = {
  report?: any;
}

type PageDispatchProps = {}

type PageOwnProps = {
  leagueMatch: any;
  loading: boolean;
  visible: boolean;
  tabScrollStyle: any;
}

type PageState = {
  reportLoading: boolean;
  sheetOpen: boolean;
  photoUrl: string;
  downLoading: boolean;
  permissionShow: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueRegulations {
  props: IProps;
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
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
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
    Taro.atMessage({
      'message': title,
      'type': type,
    })
  }

  render() {
    const {loading = false, visible = false, leagueMatch = {}, report = null} = this.props
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
        <AtMessage/>
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
