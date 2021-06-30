import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Button, Input} from '@tarojs/components'
import {AtModal, AtModalContent, AtAvatar, AtModalAction, AtDivider} from "taro-ui"

import './index.scss'
import * as assets from "../../../../utils/assets";
import Request from "../../../../utils/request";
import * as api from "../../../../constants/api";


type PageStateProps = {}

type PageDispatchProps = {
  onCancel: () => any,
  onSuccess: () => any,
  onError: () => any,
}

type PageOwnProps = {
  isOpened: boolean,
  registrationTeamId: any,
}

type PageState = {
  loading: boolean,
  verifyStatus: any,
  verifyMessage: any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalVerify {
  props: IProps;
}


class ModalVerify extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      verifyStatus: null,
      verifyMessage: null,
    }
  }

  componentDidShow() {

  }

  onPassed = () => {
    this.setState({verifyStatus: 1})
  }
  onBanned = () => {
    this.setState({verifyStatus: 0})
  }
  onConfirm = () => {
    if (this.state.verifyStatus == null) {
      Taro.showToast({title: "请选择", icon: "none"});
      return;
    }
    if (this.state.verifyStatus == 0 && (this.state.verifyMessage == null || this.state.verifyMessage.trim() == "")) {
      Taro.showToast({title: "请输入不通过原因", icon: "none"});
      return;
    }
    const {onError, onSuccess} = this.props
    let param: any = {
      registrationTeamId: this.props.registrationTeamId,
      verifyStatus: this.state.verifyStatus,
    };
    if (this.state.verifyStatus == 0) {
      param.verifyMessage = this.state.verifyMessage;
    }
    new Request().post(api.API_LEAGUE_REGISTRATION_TEAM_VERIFY, param).then((data: any) => {
      if (data) {
        onSuccess && onSuccess();
      } else {
        onError && onError();
      }
    }).catch(() => {
      onError && onError();
    })
  }
  onVerifyMessageInput = (e) => {
    this.setState({verifyMessage: e.target.value})
  }

  render() {
    const {isOpened, onCancel} = this.props

    return (
      <View>
        <AtModal isOpened={isOpened} onClose={onCancel}>
          {isOpened ? <AtModalContent>
            <View className="qz-verify-modal">
              <View className="qz-verify-modal-title">
                请审核
              </View>
              <AtDivider height={48} lineColor="#E5E5E5B3"/>
              <View className="at-row">
                <View className={`at-col at-col-6 center ${this.state.verifyStatus == 1 ? "qz-verify-modal-choice-selected" : ""}`} onClick={this.onPassed}>
                  <View className="qz-verify-modal-choice-container">
                    <View className="qz-verify-modal-choice-img">
                      <AtAvatar
                        className="white"
                        size='large'
                        image={assets.passed}/>
                    </View>
                    <View className="qz-verify-modal-choice-text">
                      通过
                    </View>
                  </View>
                </View>
                <View className={`at-col at-col-6 center ${this.state.verifyStatus == 0 ? "qz-verify-modal-choice-selected" : ""}`} onClick={this.onBanned}>
                  <View className="qz-verify-modal-choice-container">
                    <View className="qz-verify-modal-choice-img">
                      <AtAvatar
                        className="white"
                        size='large'
                        image={assets.banned}/>
                    </View>
                    <View className="qz-verify-modal-choice-text">
                      不通过
                    </View>
                  </View>
                </View>
              </View>
              {this.state.verifyStatus == 0 ? <AtDivider height={48} lineColor="#E5E5E5B3"/> : null}
              {this.state.verifyStatus == 0 ?
                <View className="qz-verify-modal-input">
                  <Input
                    value={this.state.verifyMessage}
                    onInput={this.onVerifyMessageInput}
                    placeholderClass="input-placeholder"
                    placeholder="请输入原因（必填）"/>
                </View>
                : null}
            </View>
          </AtModalContent> : null}
          <AtModalAction>
            <Button onClick={onCancel}>取消</Button>
            <Button onClick={this.onConfirm}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}

export default ModalVerify
