import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Image, Input, Button, Picker} from '@tarojs/components'
import {AtFloatLayout} from "taro-ui"
import {connect} from "react-redux";

import './registrationPlayer.scss'
import NavBar from "../../components/nav-bar";
import {checkMobile, checkIdCard, checkNumber, hasLogin, getStorage} from "../../utils/utils";
import * as api from "../../constants/api";
import camera from "../../assets/camera.png";
import PhoneModal from "../../components/modal-phone";
import * as error from "../../constants/error";
import userAction from "../../actions/user";
import LoginModal from "../../components/modal-login";
import {sample_avatar} from "../../utils/assets";
import ImageCropper from "../../components/image-cropper";
import {LOADING_TEXT} from "../../constants/global";

type PageStateProps = {
  userInfo: any;
  registrationPlayer: any;
}

type PageDispatchProps = {
  registrationPlayerFunc: any;
  registrationPlayerDeleteFunc: any;
}

type PageOwnProps = {}

type PageState = {
  playerHeadImg: any;
  playerName: any;
  playerPhone: any;
  playerGender: any;
  playerGenderValue: any;
  playerIdType: any;
  playerIdTypeValue: any;
  playerIdCard: any;
  playerShirtNum: any;
  contactType: any;
  phoneOpen: any;
  loginOpen: any;
  sampleOpen: any;
  cropperShow: any;
  unCropperImg: any;
  cropperKey: any;
  playerList: any;
  fileUploading: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface RegistrationPlayer {
  props: IProps;
}

class RegistrationPlayer extends Component<IProps, PageState> {
  navRef: any = null;
  gender: Array<number> = [0, 1, 2]
  genderValue: Array<string> = ["女", "男", "其他"]
  idType: Array<number> = [0]
  idTypeValue: Array<string> = ["身份证"]
  index: any = null;
  editable: any = true;
  imageCropper: any = null;

  constructor(props) {
    super(props)
    this.state = {
      playerHeadImg: null,
      playerName: null,
      playerPhone: null,
      playerGender: 1,
      playerGenderValue: "男",
      playerIdType: 0,
      playerIdTypeValue: "身份证",
      playerIdCard: null,
      playerShirtNum: null,
      contactType: 1,
      phoneOpen: false,
      loginOpen: false,
      sampleOpen: false,
      cropperShow: false,
      unCropperImg: null,
      cropperKey: null,
      playerList: null,
      fileUploading: false,
    }
  }

  componentWillMount() {
    this.editable = this.getParamEditable() === 'true';
    this.index = this.getParamIndex();
  }

  async componentDidMount() {
    this.editable = this.getParamEditable() === 'true';
    this.index = this.getParamIndex();
    if (!await this.isUserLogin()) {
      this.showAuth();
      return;
    }
    const currentPlayer = this.props.registrationPlayer;
    if (currentPlayer.name != null) {
      this.setState({
        playerHeadImg: currentPlayer.headImg,
        playerName: currentPlayer.name,
        playerPhone: currentPlayer.phoneNumber,
        playerGender: currentPlayer.gender,
        playerGenderValue: this.genderValue[this.gender.indexOf(currentPlayer.gender)],
        playerIdType: currentPlayer.identityType,
        playerIdTypeValue: this.idTypeValue[this.idType.indexOf(currentPlayer.identityType)],
        playerIdCard: currentPlayer.identityNumber,
        playerShirtNum: currentPlayer.shirtNum,
        contactType: currentPlayer.contactType,
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

  getParamIndex = () => {
    let index;
    const router = getCurrentInstance().router;
    if (router && router.params) {
      if (router.params.index == null) {
        index = router.params.scene
      } else {
        index = router.params.index
      }
    } else {
      return null;
    }
    return index;
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
  onRegistrationConfirm = () => {
    if (this.state.playerPhone == null || !checkMobile(this.state.playerPhone)) {
      Taro.showToast({title: "手机号格式错误", icon: "none"});
      return;
    }
    if (this.state.playerName == null) {
      Taro.showToast({title: "球员名字不能为空", icon: "none"});
      return;
    }
    if (this.state.playerHeadImg == null) {
      Taro.showToast({title: "请上传球员logo", icon: "none"});
      return;
    }
    if (this.state.playerIdCard == null || !checkIdCard(this.state.playerIdCard)) {
      Taro.showToast({title: "请输入正确的身份证号", icon: "none"});
      return;
    }
    if (this.state.playerShirtNum == null || !checkNumber(this.state.playerShirtNum) || (this.state.playerShirtNum > 200 || this.state.playerShirtNum < 0)) {
      Taro.showToast({title: "球衣号只能为数字", icon: "none"});
      return;
    }
    this.props.registrationPlayerFunc({
      name: this.state.playerName,
      headImg: this.state.playerHeadImg,
      gender: this.state.playerGender,
      shirtNum: parseInt(this.state.playerShirtNum),
      identityType: this.state.playerIdType,
      identityNumber: this.state.playerIdCard,
      contactType: this.state.contactType,
      phoneNumber: this.state.playerPhone,
      index: this.index,
    }).then((data) => {
      if (data == error.ERROR_PLAYER_ID_NUMBER_DUPLICATE) {
        Taro.showToast({title: "请检查球员身份证号相同情况", icon: "none"});
      } else if (data == error.ERROR_PLAYER_SHIRT_NUMBER_DUPLICATE) {
        Taro.showToast({title: "请检查球员球衣号相同情况", icon: "none"});
      } else if (data == error.ERROR_PLAYER_USER_NOT_VALID) {
        Taro.showToast({title: "无法修改别人创建的球员", icon: "none"});
      } else {
        Taro.disableAlertBeforeUnload()
        Taro.navigateBack({
          delta: 1,
        });
      }
    });

  }
  onRegistrationDelete = () => {
    Taro.disableAlertBeforeUnload()
    this.props.registrationPlayerDeleteFunc(this.index);
    Taro.navigateBack({
      delta: 1,
    });
  }
  onPlayerNameInput = (e) => {
    this.setState({playerName: e.target.value})
  }
  onPlayerGenderInput = (e) => {
    this.setState({
      playerGender: this.gender[e.detail.value],
      playerGenderValue: this.genderValue[e.detail.value]
    })
  }
  onPlayerIdTypeInput = (e) => {
    this.setState({
      playerIdType: this.idType[e.detail.value],
      playerIdTypeValue: this.idTypeValue[e.detail.value]
    })
  }
  onPlayerPhoneInput = (e) => {
    this.setState({playerPhone: e.target.value})
  }
  onPlayerIdCardInput = (e) => {
    this.setState({playerIdCard: e.target.value})
  }
  onPlayerShirtNumInput = (e) => {
    this.setState({playerShirtNum: e.target.value})
  }
  onContactTypeClick = (type) => {
    if (!this.editable) {
      return
    }
    this.setState({contactType: type})
  }
  onGetPhoneNumberClick = () => {
    const user = this.props.userInfo;
    if (user && user.phone) {
      this.setState({playerPhone: user.phone.slice(2)})
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
      return
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
  onSampleClick = () => {
    this.setState({sampleOpen: true})
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
          this.setState({playerHeadImg: response.data, cropperShow: false})
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
        className={`qz-registration-player ${this.state.cropperShow ? "qz-registration-player__no-scroll" : "qz-registration-player__scroll"}`}
        onTouchStart={this.onTouchStart}
      >
        <NavBar
          title='球员信息'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        <View className="qz-registration-player__content">
          <View className="qz-registration-player__form">
            <View className="qz-registration-player__title">
              紧急联系人信息
            </View>
            <View className="qz-registration-player__input">
              <View className="title">
                紧急联系人
              </View>
              <View className="divider">
              </View>
              <View className="radio-wrapper at-row">
                <View
                  className={`radio-item at-col at-col-4 ${this.state.contactType == 1 ? "radio-item__active" : ""}`}
                  onClick={this.onContactTypeClick.bind(this, 1)}>
                  爸爸
                </View>
                <View
                  className={`radio-item at-col at-col-4 ${this.state.contactType == 0 ? "radio-item__active" : ""}`}
                  onClick={this.onContactTypeClick.bind(this, 0)}>
                  妈妈
                </View>
                <View
                  className={`radio-item at-col at-col-4 ${this.state.contactType == 2 ? "radio-item__active" : ""}`}
                  onClick={this.onContactTypeClick.bind(this, 2)}>
                  其他
                </View>
              </View>
            </View>
            <View className="qz-registration-player__input ">
              <View className="title">
                电话号码
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  value={this.state.playerPhone}
                  onInput={this.onPlayerPhoneInput}
                  className="input-left"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
              {this.editable ? <View className="button-wrapper button-wrapper-ct">
                <Button onClick={this.onGetPhoneNumberClick}>自动获取</Button>
              </View> : null}
            </View>
            <View className="qz-registration-player__hint">
              此电话号码仅供紧急联系时使用
            </View>
          </View>
          <View className="qz-registration-player__form">
            <View className="qz-registration-player__title">
              参赛人信息
            </View>
            <View className="qz-registration-player__input ">
              <View className="title">
                真实姓名
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  value={this.state.playerName}
                  onInput={this.onPlayerNameInput}
                  className="input"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
            </View>
            <View className="qz-registration-player__input ">
              <View className="title">
                性别
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Picker
                  disabled={!this.editable}
                  mode='selector'
                  range={this.genderValue}
                  onChange={this.onPlayerGenderInput}>
                  <Input
                    value={this.state.playerGenderValue}
                    disabled
                    className="input"
                    placeholderClass="input-placeholder"
                    placeholder="请输入（必填）"/>
                </Picker>
              </View>
              <View className="icon-wrapper">
                <View className='at-icon at-icon-chevron-right'>
                </View>
              </View>
            </View>
            <View className="qz-registration-player__input ">
              <View className="title">
                证件类型
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Picker
                  disabled={!this.editable}
                  mode='selector'
                  range={this.idTypeValue}
                  onChange={this.onPlayerIdTypeInput}>
                  <Input
                    value={this.state.playerIdTypeValue}
                    disabled
                    className="input"
                    placeholderClass="input-placeholder"
                    placeholder="请输入（必填）"/>
                </Picker>
              </View>
              <View className="icon-wrapper">
                <View className='at-icon at-icon-chevron-right'>
                </View>
              </View>
            </View>
            <View className="qz-registration-player__input ">
              <View className="title">
                证件号码
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  value={this.state.playerIdCard}
                  onInput={this.onPlayerIdCardInput}
                  className="input"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
            </View>
            <View className="qz-registration-player__input ">
              <View className="title">
                球衣号
              </View>
              <View className="divider">
              </View>
              <View className="input-wrapper">
                <Input
                  disabled={!this.editable}
                  type="number"
                  value={this.state.playerShirtNum}
                  onInput={this.onPlayerShirtNumInput}
                  className="input"
                  placeholderClass="input-placeholder"
                  placeholder="请输入（必填）"/>
              </View>
            </View>
            <View className="qz-registration-player__input ">
              <View className="title">
                参赛照片
              </View>
              <View className="divider">
              </View>
              <View className="upload-wrapper">
                <View className="img-container">
                  <View className="upload" onClick={this.onImageUploadClick}>
                    {this.state.playerHeadImg ?
                      <Image src={this.state.playerHeadImg} className="headImg"/>
                      :
                      <View>
                        <View>
                          <Image src={camera} className="icon"/>
                        </View>
                        <View className="text">请上传</View>
                        <View className="text">必填</View>
                      </View>}
                  </View>
                </View>
              </View>
              <View className="button-wrapper button-wrapper-tr">
                <Button onClick={this.onSampleClick}>查看上传示范</Button>
              </View>
            </View>
            <View className="qz-registration-player__hint">
              个人证件、照片等个人隐私信息将仅用于本平台比赛相关事宜，本平台竭力保护您的个人隐私。
            </View>
          </View>
          {this.editable ? <View className='qz-registration-player__button'>
            <Button onClick={this.onRegistrationConfirm}>确认并保存</Button>
          </View> : null}
          {this.editable && this.index != null ? <View className='qz-registration-player__button-delete'>
            <Button onClick={this.onRegistrationDelete}>删除</Button>
          </View> : null}
        </View>
        <AtFloatLayout title="参赛照片上传示范" className="at-float-layout-large" isOpened={this.state.sampleOpen}>
          <View className="qz-registration-player__sample">
            <View className="qz-registration-player__sample-image">
              <Image src={sample_avatar}/>
            </View>
            <View className="qz-registration-player__sample-hint qz-registration-player__sample-hint-paragraph">
              为保证您上传的照片符合参赛标准，请拍摄或从手机相册选择符合以下几点照片：
            </View>
            <View className="qz-registration-player__sample-hint">
              1 、照片背最蓝色、白色、红色均可
            </View>
            <View className="qz-registration-player__sample-hint">
              2 、请上传最近3个月内近照
            </View>
            <View className="qz-registration-player__sample-hint">
              3 、照片人物居中显示，取胸部以上最佳
            </View>
            <View className="qz-registration-player__sample-hint">
              4 、照片保证人物清晰
            </View>
          </View>
        </AtFloatLayout>
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
            <View className="qz-registration-player__cropper-background" onTouchMove={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}/>
            <View key={this.state.cropperKey}
                  className="qz-registration-player__cropper">
              <ImageCropper
                ref={this.imageCropperRef}
                height={200}
                width={200}
                limit_move
                disable_rotate
                onTapcut={this.onCropperComplete}
                imgSrc={this.state.unCropperImg}/>
              <View className="background-wrapper"/>
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
    registrationPlayerFunc: state.registration.registrationPlayerFunc,
    registrationPlayerDeleteFunc: state.registration.registrationPlayerDeleteFunc,
    registrationPlayer: state.registration.registrationPlayer,
  }
}
export default connect(mapStateToProps)(RegistrationPlayer)
