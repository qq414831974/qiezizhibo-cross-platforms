import Taro, {getCurrentInstance} from '@tarojs/taro'
import {Component} from 'react'
import {View, WebView} from '@tarojs/components'
import {connect} from 'react-redux'

import {AtActivityIndicator} from 'taro-ui'

import './personVerify.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import IdcardVerifyModal from "./components/modal-idcard-verify";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  verifyUrl: string;
  idCardVerifyShow: boolean;
  idCard: string;
  name: string;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface PersonVerify {
  props: IProps;
}

class PersonVerify extends Component<IProps, PageState> {
  type = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      verifyUrl: null,
      idCardVerifyShow: false,
      idCard: null,
      name: null,
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.type = this.getParam("type");
    const playerId = this.getParam("playerId");
    new Request().get(api.API_PLAYER(playerId), null).then((data: any) => {
      if (data != null && data.id != null) {
        if (data.idCard != null) {
          this.setState({idCard: data.idCard, name: data.name, idCardVerifyShow: true})
        } else {
          this.onVerifyIdCardSuccess();
        }
      } else {
        Taro.showToast({title: "认证失败，请返回重试", icon: "none"});
      }
    })
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    this.type = this.getParam("type");
  }

  componentDidHide() {
  }

  onVerifyIdCardSuccess = () => {
    if (this.type == 0) {
      const leagueId = this.getParam("leagueId");
      const playerId = this.getParam("playerId");
      const userNo = this.getParam("userNo");
      this.setState({loading: true})
      new Request().get(api.API_PERSON_VERIFY_LEAGUEMEMBER, {
        leagueId: leagueId,
        playerId: playerId,
        userNo: userNo
      }).then((data: any) => {
        if (data != null && typeof data == "string") {
          this.setState({verifyUrl: data, loading: false})
        } else {
          Taro.showToast({title: "认证失败，请返回重试", icon: "none"});
        }
      })
    } else if (this.type == 1) {
      const playerId = this.getParam("playerId");
      const userNo = this.getParam("userNo");
      this.setState({loading: true})
      new Request().get(api.API_PERSON_VERIFY_PLAYER, {
        playerId: playerId,
        userNo: userNo
      }).then((data: any) => {
        if (data != null && typeof data == "string") {
          this.setState({verifyUrl: data, loading: false})
        } else {
          Taro.showToast({title: "认证失败，请返回重试", icon: "none"});
        }
      })
    }
  }
  getParam = (name) => {
    const router = getCurrentInstance().router;
    if (router && router.params != null && router.params[name] != null) {
      return router.params[name]
    } else {
      return null;
    }
  }
  onIdCardVerifyConfirm = (idcard) => {
    if (typeof idcard == "string" && idcard.trim() == this.state.idCard) {
      this.setState({idCardVerifyShow: false}, () => {
        this.onVerifyIdCardSuccess();
      })
    } else {
      Taro.showToast({title: "身份证错误", icon: "none"})
    }
  }
  onIdCardVerifyCancel = () => {
    Taro.navigateBack({
      delta: 1
    })
  }

  render() {
    if (this.state.loading) {
      return <View className="qz-person-verify-loading">
        <AtActivityIndicator
          mode="center"
          content="加载中..."/>
      </View>
    }
    return (
      <View className='qz-person-verify-container'>
        {this.state.verifyUrl ?
          <WebView src={this.state.verifyUrl}/> : null}
        <IdcardVerifyModal
          name={this.state.name}
          isOpened={this.state.idCardVerifyShow}
          handleConfirm={this.onIdCardVerifyConfirm}
          handleCancel={this.onIdCardVerifyCancel}/>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(PersonVerify)
