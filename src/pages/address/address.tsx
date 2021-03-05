import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtButton, AtLoadMore, AtList, AtListItem} from "taro-ui"
import {connect} from '@tarojs/redux'

import './address.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import {toLogin} from "../../utils/utils";

type PageStateProps = {
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  updateLoading: boolean;
  address: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Address {
  props: IProps | any;
}

class Address extends Component<PageOwnProps | any, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '我的地址',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  componentWillMount() {
  }

  componentDidMount() {
    const openId = this.props.userInfo ? this.props.userInfo.wechatOpenid : null
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    if (userNo == null || openId == null) {
      Taro.showToast({
        title: "登录失效，请重新登录",
        icon: 'none',
        complete: () => {
          toLogin();
        }
      })
      return;
    }
    this.getUserAddress();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getUserAddress = () => {
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    this.setState({loading: true})
    new Request().get(api.API_USER_ADDRESS, {userNo: userNo}).then((data: any) => {
      if (data && data.id) {
        this.setState({address: data})
      }
      this.setState({loading: false})
    });
  }
  addUserAddress = (params) => {
    const userNo = this.props.userInfo ? this.props.userInfo.userNo : null
    params.userNo = userNo;
    this.setState({updateLoading: true})
    new Request().post(api.API_USER_ADDRESS, params).then((data: any) => {
      if (data) {
        this.getUserAddress();
        this.setState({updateLoading: false})
      }
    });
  }
  onAddressAddClick = () => {
    Taro.chooseAddress().then((data: any) => {
      if (data.errMsg == "chooseAddress:ok") {
        this.addUserAddress(data);
      }
    }).catch(() => {
      Taro.showToast({title: "未选择地址", icon: "none"});
    })
  }

  render() {
    const {loading, address} = this.state
    if (loading) {
      return <AtLoadMore status="loading" loadingText="加载中..."/>
    }
    return (
      <View className='qz-address-content'>
        {address != null ? <View className='qz-address-address' onClick={this.onAddressAddClick}>
          <AtList>
            <AtListItem
              arrow='right'
              note={`${address.provinceName}${address.cityName}${address.countyName}${address.detailInfo}`}
              title={`${address.userName} ${address.telNumber}`}
              extraText='编辑'
            />
          </AtList>
        </View> : null}
        <View className='qz-address-add'>
          <AtButton loading={this.state.updateLoading}
                    type='primary'
                    onClick={this.onAddressAddClick}>
            {address != null ? "修改地址" : "新增地址"}
          </AtButton>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(Address)
