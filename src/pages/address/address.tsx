import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtButton, AtLoadMore, AtList, AtListItem} from "taro-ui"
import {connect} from 'react-redux'

import './address.scss'
import Request from "../../utils/request";
import * as api from "../../constants/api";
import {toLogin} from "../../utils/utils";
import NavBar from "../../components/nav-bar";

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
  props: IProps;
}

class Address extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      updateLoading: false,
      address: null,
    }
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
        <NavBar
          title='我的地址'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
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
