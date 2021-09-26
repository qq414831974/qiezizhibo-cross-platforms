import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, Textarea, Input} from '@tarojs/components'
import {connect} from 'react-redux'
import {AtImagePicker, AtButton, AtIcon} from 'taro-ui'

import './feedbackdetail.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  value: any;
  phone: any;
  files: any;
  uploadedFiles: any;
  title: any;
  hint: any;
  check: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface FeedbackDetail {
  props: IProps;
}

class FeedbackDetail extends Component<IProps, PageState> {


  constructor(props) {
    super(props)
    this.state = {
      title: "",
      hint: "",
      value: "",
      phone: "",
      files: [],
      uploadedFiles: [],
      check: true,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    const router = getCurrentInstance().router;
    if (router && router.params && router.params.type != null) {
      const type = Number(router.params.type);
      let title = ""
      let hint = "允许开发者在48小时内通过客服消息联系我"
      if (type == 1) {
        title = "功能异常"
      } else if (type == 2) {
        title = "支付问题"
      } else if (type == 3) {
        title = "产品建议"
      } else if (type == 4) {
        title = "违规举报"
        hint = "允许微信使用小程序当前页面的数据和截图作为投诉证据"
      } else if (type == 5) {
        title = "交易投诉"
      }
      this.setState({title: title, hint: hint})
    }
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  handleChange = (e) => {
    this.setState({
      value: e.detail.value
    })
    return e.detail.value
  }
  handlePhoneChange = (e) => {
    this.setState({
      phone: e.detail.value
    })
    return e.detail.value
  }
  onFileChange = (files, operationType, removeIndex) => {
    let uploadedFiles = this.state.uploadedFiles;
    if (operationType == "remove") {
      uploadedFiles.splice(removeIndex, 1)
      this.setState({
        files: files,
        uploadedFiles: uploadedFiles
      })
    } else {
      if (files.length - 1 >= 0) {
        const file = files[files.length - 1]
        if (file.url != null) {
          Taro.uploadFile({
            url: api.API_SYS_UPLOAD_FEEDBACK,
            filePath: file.url,
            name: "file",
          }).then((data: any) => {
            if (data.data) {
              const response = JSON.parse(data.data)
              if (response && response.data) {
                uploadedFiles.push(response.data);
                this.setState({
                  files: files,
                  uploadedFiles: uploadedFiles
                })
              }
            }
          })
        }
      }
    }
  }
  onCheckBoxClick = () => {
    this.setState({check: !this.state.check})
  }
  onConfirm = () => {
    const router = getCurrentInstance().router;
    if (router == null) {
      return;
    }
    const type = router.params ? router.params.type : null;
    const value = this.state.value;
    const phone = this.state.phone;
    let userNo = null;
    if (this.props.userInfo && this.props.userInfo.userNo) {
      userNo = this.props.userInfo.userNo;
    }
    if (value == null || value.trim() == "") {
      Taro.showToast({
        title: "请输入内容",
        duration: 1000,
        icon: "none",
      });
      return;
    }
    if (phone == null || phone.trim() == "") {
      Taro.showToast({
        title: "请输入联系方式",
        duration: 1000,
        icon: "none",
      });
      return;
    }
    new Request().post(api.API_SYS_FEEDBACK, {
      type,
      phone,
      value,
      userNo,
      picList: this.state.uploadedFiles
    }).then((config: any) => {
      console.log(config)
    })
    Taro.navigateTo({
      url: `/pages/feedbackSuccess/feedbackSuccess?type=${type}`,
    })
  }

  render() {
    return (
      <View className='qz-feedback-detail'>
        <View className='qz-feedback-detail__option-hint'>
          <View className='qz-feedback-detail__option-hint__title qz-feedback-detail__option-hint__title-border'>
            {this.state.title}
          </View>
        </View>
        <View className='qz-feedback-detail__option-input'>
          <Textarea
            placeholder='请输入内容'
            className='qz-feedback-detail__option-input-textarea'
            placeholderClass='qz-feedback-detail__option-input-placeholder'
            value={this.state.value}
            onInput={this.handleChange}>
          </Textarea>
          <View className='qz-feedback-detail__option-input-num'>
            {this.state.value.length}/200
          </View>
        </View>
        <View className='qz-feedback-detail__option-hint'>
          <View className='qz-feedback-detail__option-hint__title'>
            相关截图
          </View>
        </View>
        <View className='qz-feedback-detail-image-picker'>
          <AtImagePicker
            files={this.state.files}
            onChange={this.onFileChange}
          />
          <View className='qz-feedback-detail-image-picker-border'>
          </View>
        </View>
        <View className='qz-feedback-detail__option-phone'>
          <View className='at-row'>
            <View className='qz-feedback-detail__option-phone-title at-col at-col-1 at-col--auto'>
              联系方式
            </View>
            <View className='qz-feedback-detail__option-phone-input at-col'>
              <Input
                placeholder="邮箱/手机号"
                onInput={this.handlePhoneChange}
                placeholderClass='qz-feedback-detail__option-input-placeholder-nopadding'
              />
            </View>
          </View>
          <View className='qz-feedback-detail__option-phone-border'>
          </View>
        </View>
        <View className='qz-feedback-detail-checkbox-container' onClick={this.onCheckBoxClick}>
          <View
            className={`${this.state.check ? "qz-feedback-detail-checkbox" : "qz-feedback-detail-checkbox-disabled"}`}>
            {this.state.check ? <AtIcon value='check' size='10' color='#ffffff'/> : null}
          </View>
          <View className='qz-feedback-detail-checkbox-text'>
            {this.state.hint}
          </View>
        </View>
        <AtButton
          onClick={this.onConfirm}
          type='primary'
          className="qz-feedback-detail-confirm"
          size='small'>
          提交
        </AtButton>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(FeedbackDetail)
