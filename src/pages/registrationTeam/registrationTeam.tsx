import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Image, Input, Button} from '@tarojs/components'
import {connect} from "react-redux";
import camera from '../../assets/camera.png'
import ImageCropper from "../../components/image-cropper"

import './registrationTeam.scss'
import NavBar from "../../components/nav-bar";
import {checkMobile, getStorage, hasLogin} from "../../utils/utils";
import * as api from "../../constants/api";
import * as error from "../../constants/error";
import userAction from "../../actions/user";
import LoginModal from "../../components/modal-login";
import PhoneModal from "../../components/modal-phone";
import {LOADING_TEXT, SUBSCRIBE_TEMPLATES} from "../../constants/global";
import Request from "../../utils/request";

type PageStateProps = {
  registrationTeam: any;
  userInfo: any;
}

type PageDispatchProps = {
  registrationTeamFunc: any;
}

type PageOwnProps = {}

type PageState = {
  teamHeadImg: any;
  teamName: any;
  teamPhone: any;
  teamCoachName: any;
  teamCoachPhone: any;
  phoneOpen: any;
  loginOpen: any;
  cropperShow: any;
  unCropperImg: any;
  cropperKey: any;
  fileUploading: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface RegistrationTeam {
  props: IProps;
}

class RegistrationTeam extends Component<IProps, PageState> {
  navRef: any = null;
  editable: any = true;
  leagueId: any = null;
  imageCropper: any = null;

  constructor(props) {
    super(props)
    this.state = {
      teamHeadImg: null,
      teamName: null,
      teamPhone: null,
      teamCoachName: null,
      teamCoachPhone: null,
      phoneOpen: false,
      loginOpen: false,
      cropperShow: false,
      unCropperImg: null,
      cropperKey: null,
      fileUploading: false,
    }
  }

  componentWillMount() {
    this.editable = this.getParamEditable() === 'true';
    this.leagueId = this.getParamId();
  }

  async componentDidMount() {
    this.editable = this.getParamEditable() === 'true';
    this.leagueId = this.getParamId();
    if (!await this.isUserLogin()) {
      this.showAuth();
      return;
    }
    const currentTeam = this.props.registrationTeam;
    if (currentTeam != null && currentTeam.name != null) {
      this.setState({
        teamHeadImg: currentTeam.headImg,
        teamName: currentTeam.name,
        teamPhone: currentTeam.phoneNumber,
        teamCoachName: currentTeam.coachName,
        teamCoachPhone: currentTeam.coachPhone,
      })
    }
    if (this.editable) {
      Taro.enableAlertBeforeUnload({message: "确定返回上一页吗？返回后填写的内容将不会保存！"});
    }
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  getParamEditable = () => {
    let editable;
    const router = getCurrentInstance().router;
    if (router && router.params) {
      if (router.params.editable == null) {
        editable = router.params.scene
      } else {
        editable = router.params.editable
      }
    } else {
      return null;
    }
    return editable;
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
  onRegistrationConfirm = () => {
    if (this.state.teamPhone == null || !checkMobile(this.state.teamPhone)) {
      Taro.showToast({title: "手机号格式错误", icon: "none"});
      return;
    }
    if (this.state.teamCoachPhone == null || !checkMobile(this.state.teamCoachPhone)) {
      Taro.showToast({title: "教练手机号格式错误", icon: "none"});
      return;
    }
    if (this.state.teamName == null) {
      Taro.showToast({title: "球队名字不能为空", icon: "none"});
      return;
    }
    if (this.state.teamCoachName == null) {
      Taro.showToast({title: "教练名字不能为空", icon: "none"});
      return;
    }
    if (this.state.teamHeadImg == null) {
      Taro.showToast({title: "请上传球队logo", icon: "none"});
      return;
    }
    this.onSubscribe(() => {
      this.props.registrationTeamFunc({
        headImg: this.state.teamHeadImg,
        name: this.state.teamName,
        phoneNumber: this.state.teamPhone,
        coachName: this.state.teamCoachName,
        coachPhone: this.state.teamCoachPhone,
      });
      Taro.disableAlertBeforeUnload()
      Taro.navigateBack({
        delta: 1,
      });
    });
  }

  onSubscribe = (callback) => {
    const currentTeam = this.props.registrationTeam;
    if (currentTeam != null && currentTeam.name != null) {
      callback && callback();
      return;
    }
    const user = this.props.userInfo;
    let tmplIds: any = [];
    tmplIds.push(SUBSCRIBE_TEMPLATES.REGISTRATION_MESSAGE);
    const openid = user.wechatOpenid;
    let param: any = {
      userNo: this.props.userInfo.userNo,
      openId: openid,
      leagueId: this.leagueId,
    };
    Taro.requestSubscribeMessage({tmplIds: tmplIds}).then((res: any) => {
      if (res.errMsg == "requestSubscribeMessage:ok") {
        delete res.errMsg
        new Request().post(api.API_SUBSCRIBE_REGISTRATION, {templateIds: res, ...param}).then((data: any) => {
          callback && callback();
        })
      }
    }).catch(() => {
      callback && callback();
    })
  }


  onTeamNameInput = (e) => {
    this.setState({teamName: e.target.value})
  }
  onTeamPhoneInput = (e) => {
    this.setState({teamPhone: e.target.value})
  }
  onGetPhoneNumberClick = () => {
    const user = this.props.userInfo;
    if (user && user.phone) {
      this.setState({teamPhone: user.phone.slice(2)})
    } else {
      if (user == null) {
        this.setState({loginOpen: true})
      } else {
        this.setState({phoneOpen: true})
      }
    }
  }
  onTeamCoachNameInput = (e) => {
    this.setState({teamCoachName: e.target.value})
  }
  onTeamCoachPhoneInput = (e) => {
    this.setState({teamCoachPhone: e.target.value})
  }
  onGetCoachPhoneNumberClick = () => {
    const user = this.props.userInfo;
    if (user && user.phone) {
      this.setState({teamCoachPhone: user.phone.slice(2)})
    } else {
      if (user == null) {
        this.setState({loginOpen: true})
      } else {
        this.setState({phoneOpen: true})
      }
    }
  }
  onImageUploadClick = () => {
    if (!this.editable) {
      return;
    }
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    }).then((res: any) => {
      let value = res && res.tempFilePaths[0];
      if (value != null) {
        this.setState({unCropperImg: value})
        this.onCropperShow();
      }
    })
  }
  onPhoneClose = () => {
    this.setState({phoneOpen: false})
  }

  onPhoneCancel = () => {
    this.setState({phoneOpen: false})
  }

  onPhoneError = (reason) => {
    switch (reason) {
      case error.ERROR_WX_UPDATE_USER: {
        Taro.showToast({
          title: "更新用户信息失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_WX_LOGIN: {
        Taro.showToast({
          title: "微信登录失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_LOGIN: {
        Taro.showToast({
          title: "登录失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onPhoneSuccess = () => {
    this.setState({phoneOpen: false})
    this.getUserInfo()
  }

  async getUserInfo(onSuccess?: Function | null) {
    if (await hasLogin()) {
      const openid = await getStorage('wechatOpenid');
      userAction.getUserInfo({openId: openid}, {
        success: (res) => {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
          if (onSuccess) {
            onSuccess(res);
          }
        }, failed: () => {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      });
    } else {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    }
  }

  showAuth = () => {
    this.setState({loginOpen: true});
  }

  onAuthClose = () => {
    this.setState({loginOpen: false})
  }

  onAuthCancel = () => {
    this.setState({loginOpen: false})
  }

  onAuthError = (reason) => {
    switch (reason) {
      case error.ERROR_WX_UPDATE_USER: {
        Taro.showToast({
          title: "更新用户信息失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_WX_LOGIN: {
        Taro.showToast({
          title: "微信登录失败",
          icon: 'none',
        });
        return;
      }
      case error.ERROR_LOGIN: {
        Taro.showToast({
          title: "登录失败",
          icon: 'none',
        });
        return;
      }
    }
  }

  onAuthSuccess = () => {
    this.setState({loginOpen: false})
    this.getUserInfo((res) => {
      const phone = res.payload.phone
      if (res.payload != null && phone == null) {
        this.setState({phoneOpen: true})
      }
    })
  }
  isUserLogin = async () => {
    const token = await getStorage('accessToken');
    if (token == null || token == '' || this.props.userInfo.userNo == null || this.props.userInfo.userNo == '') {
      return false;
    } else {
      return true;
    }
  }
  onCropperShow = () => {
    Taro.showLoading({title: LOADING_TEXT})
    this.setState({cropperKey: new Date().getTime()}, () => {
      this.setState({cropperShow: true}, () => {
        Taro.hideLoading();
      })
    })
  }
  onCropperCancel = () => {
    this.setState({cropperShow: false})
  }
  onCropperComplete = ({url}) => {
    Taro.uploadFile({
      url: api.API_SYS_UPLOAD_AVATAR,
      filePath: url,
      name: "file",
    }).then((data: any) => {
      this.setState({fileUploading: false})
      Taro.hideLoading();
      if (data.data) {
        const response = JSON.parse(data.data)
        if (response && response.data) {
          this.setState({teamHeadImg: response.data, cropperShow: false})
        } else {
          Taro.showToast({title: "上传失败", icon: "none"});
        }
      } else {
        Taro.showToast({title: "上传失败", icon: "none"});
      }
    }).catch(() => {
      this.setState({fileUploading: false})
      Taro.hideLoading();
    })
  }
  imageCropperRef = (ref) => {
    this.imageCropper = ref;
  }
  onCropperConfirm = () => {
    if (this.state.fileUploading) {
      return;
    }
    Taro.showLoading({title: LOADING_TEXT})
    this.setState({fileUploading: true})
    this.imageCropper.getImg(this.onCropperComplete)
  }
  onTouchStart = () => {
    Taro.hideKeyboard()
  }

  render() {
    return (
      <View
        className={`qz-registration-team ${this.state.cropperShow ? "qz-registration-team__no-scroll" : "qz-registration-team__scroll"}`}
        onTouchStart={this.onTouchStart}
      >
        <NavBar
          title='球队信息'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className="qz-registration-team__content">
          <View className="qz-registration-team__form">
            <View className="qz-registration-team__img-container">
              <View className="upload" onClick={this.onImageUploadClick}>
                {this.state.teamHeadImg ?
                  <Image src={this.state.teamHeadImg} className="headImg"/>
                  :
                  <Image src={camera} className="icon"/>}
              </View>
            </View>
            <View className="qz-registration-team__img-title">
              球队logo{this.editable ? "（必填）" : null}
            </View>
            <View className="qz-registration-team__input">
              <View className="title">
                球队名称
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  value={this.state.teamName}
                  onInput={this.onTeamNameInput}
                  className="input"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
            </View>
            <View className="qz-registration-team__input ">
              <View className="title">
                联系电话
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  value={this.state.teamPhone}
                  onInput={this.onTeamPhoneInput}
                  className="input-left"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
              {this.editable ? <View className="button-wrapper button-wrapper-ct">
                <Button onClick={this.onGetPhoneNumberClick}>自动获取</Button>
              </View> : null}
            </View>
            <View className="qz-registration-team__input">
              <View className="title">
                教练名字
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  value={this.state.teamCoachName}
                  onInput={this.onTeamCoachNameInput}
                  className="input"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
            </View>
            <View className="qz-registration-team__input ">
              <View className="title">
                教练电话
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  value={this.state.teamCoachPhone}
                  onInput={this.onTeamCoachPhoneInput}
                  className="input-left"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
              {this.editable ? <View className="button-wrapper button-wrapper-ct">
                <Button onClick={this.onGetCoachPhoneNumberClick}>自动获取</Button>
              </View> : null}
            </View>
          </View>
          {this.editable ? <View className='qz-registration-team__button'>
            <Button onClick={this.onRegistrationConfirm}>确认并保存</Button>
          </View> : null}
        </View>
        <LoginModal
          isOpened={this.state.loginOpen}
          handleConfirm={this.onAuthSuccess}
          handleCancel={this.onAuthCancel}
          handleClose={this.onAuthClose}
          handleError={this.onAuthError}/>
        <PhoneModal
          isOpened={this.state.phoneOpen}
          handleConfirm={this.onPhoneSuccess}
          handleCancel={this.onPhoneCancel}
          handleClose={this.onPhoneClose}
          handleError={this.onPhoneError}/>
        {this.state.cropperShow ?
          <View>
            <View className="qz-registration-team__cropper-background" onTouchMove={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}/>
            <View key={this.state.cropperKey}
                  className="qz-registration-team__cropper">
              <ImageCropper
                ref={this.imageCropperRef}
                height={200}
                width={200}
                limit_move
                disable_rotate
                onTapcut={this.onCropperComplete}
                imgSrc={this.state.unCropperImg}/>
              <View className="button-wrapper">
                <Button onClick={this.onCropperCancel}>取消</Button>
                <Button onClick={this.onCropperConfirm}>完成</Button>
              </View>
            </View>
          </View>
          : null}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    registrationTeamFunc: state.registration.registrationTeamFunc,
    registrationTeam: state.registration.registrationTeam,
  }
}
export default connect(mapStateToProps)(RegistrationTeam)
