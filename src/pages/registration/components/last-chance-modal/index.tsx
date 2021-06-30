import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, Button, Input} from '@tarojs/components'
import {AtModal, AtModalContent, AtModalAction, AtDivider} from "taro-ui"

import './index.scss'
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
  verifyMessage: any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ModalLastChance {
  props: IProps;
}


class ModalLastChance extends Component<IProps, PageState> {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      verifyMessage: null,
    }
  }

  componentDidShow() {

  }

  onConfirm = () => {
    if (this.state.verifyMessage == null || this.state.verifyMessage.trim() == "") {
      Taro.showToast({title: "请输入不通过原因", icon: "none"});
      return;
    }
    const {onError, onSuccess} = this.props
    let param: any = {
      registrationTeamId: this.props.registrationTeamId,
      lastChance: true,
      verifyMessage: this.state.verifyMessage,
    };
    new Request().post(api.API_LEAGUE_REGISTRATION_TEAM_LAST_CHANCE, param).then((data: any) => {
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
            <View className="qz-last-chance-modal">
              <View className="qz-last-chance-modal-title">
                是否确认让他重新修改一次
              </View>
              <AtDivider height={48} lineColor="#E5E5E5B3"/>
              <View className="qz-last-chance-modal-input">
                <Input
                  value={this.state.verifyMessage}
                  onInput={this.onVerifyMessageInput}
                  placeholderClass="input-placeholder"
                  placeholder="请输入原因（必填）"/>
              </View>
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

export default ModalLastChance
