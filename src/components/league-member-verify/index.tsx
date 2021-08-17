import classNames from 'classnames'
import Taro from '@tarojs/taro'
import {Component} from 'react'
import {AtIcon} from "taro-ui"
import {View, Text, Image, Button} from '@tarojs/components'
import {connect} from 'react-redux'
import './index.scss'
import {getStorage, getYuan, toLogin} from "../../utils/utils";
import {crown} from "../../utils/assets";

type PageStateProps = {
  payEnabled: boolean;
  giftEnabled: boolean;
  userInfo: any;
}

type PageDispatchProps = {
  onClose?: any,
}

type PageOwnProps = {
  isOpened: boolean,
  leagueMemberRule: boolean,
  league: any,
}

type PageState = {
  _isOpened: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LeagueMemberVerify {
  props: IProps | any;
}

class LeagueMemberVerify extends Component<IProps, PageState> {

  constructor(props) {
    super(props)
    this.state = {
      _isOpened: false,
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps: any): void {
    const {isOpened} = nextProps
    if (isOpened !== this.state._isOpened) {
      this.setState({
        _isOpened: isOpened
      })
    }
  }

  handleClose = () => {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose()
    }
  }
  close = (): void => {
    this.setState(
      {
        _isOpened: false
      },
      this.handleClose
    )
  }
  handleTouchMove = (e): void => {
    e.stopPropagation()
  }
  onMemberSignUp = async () => {
    const openId = await getStorage('wechatOpenid')
    const userNo = await getStorage('userNo')
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
    if (this.props.leagueMemberRule == null || this.props.leagueMemberRule.verifyAvailable == null || !this.props.leagueMemberRule.verifyAvailable) {
      return;
    }
    Taro.navigateTo({
      url: `/pages/leagueMemberVerify/leagueMemberVerify?id=${this.props.leagueMemberRule.leagueId}`,
    })
  }

  getLeagueName = (league) => {
    if (league && league.shortName) {
      return league.shortName
    } else if (league && league.name) {
      return league.shortName
    } else {
      return "联赛";
    }
  }

  render() {
    const {_isOpened} = this.state

    const rootClass = classNames(
      'qz-league-member-verfiy',
      {
        'qz-league-member-verfiy--active': _isOpened
      },
    )
    return (
      <View className={rootClass} onTouchMove={this.handleTouchMove}>
        <View onClick={this.close} className='qz-league-member__overlay'/>
        {_isOpened ?
          <View className='qz-league-member__container layout'>
            <View className='layout-header'>
              <View className='layout-header__btn-close' onClick={this.close}/>
              <View className="layout-header__title">
                <Image src={crown}/>
                <Text>球员VIP(限免)</Text>
              </View>
            </View>
            <View className='layout-body'>
              <View className="qz-league-member__league">
                <Image
                  src={this.props.league && this.props.league.headImg ? this.props.league.headImg : {crown}}/>
                <Text>{this.getLeagueName(this.props.league)}</Text>
              </View>
              <View className="qz-league-member__card">
                <View className="qz-league-member__card-item qz-league-member__card-item-hover">
                  <View className="item">
                    <View className="qz-league-member__card-item-price-discount">
                      {this.props.leagueMemberRule && this.props.leagueMemberRule.price ? `¥${getYuan(this.props.leagueMemberRule.price)}` : "¥999"}
                    </View>
                  </View>
                  <View className="item">
                    <View className="qz-league-member__card-item-price">
                      ¥0
                    </View>
                  </View>
                  <View className="item">
                    <View className="qz-league-member__card-item-time">
                      {this.props.leagueMemberRule && this.props.leagueMemberRule.verifyExpireMonths ? this.props.leagueMemberRule.verifyExpireMonths : 1}个月
                    </View>
                  </View>
                </View>
              </View>
              <View className="qz-league-member__title">
                球员VIP特权
              </View>
              <View className="qz-league-member__desc">
                <AtIcon value='play' size='12' color='#7F7F7F'/>
                {this.props.leagueMemberRule && this.props.leagueMemberRule.verifyExpireMonths ? this.props.leagueMemberRule.verifyExpireMonths : 1}个月内可免费观看此联赛的所有比赛录像
              </View>
              <View className="qz-league-member__desc">
                <AtIcon value='play' size='12' color='#7F7F7F'/>
                一名球员可绑定{this.props.leagueMemberRule && this.props.leagueMemberRule.verifyLimited ? this.props.leagueMemberRule.verifyLimited : 2}个账号，绑定后不可解绑，请谨慎操作
              </View>
              <View className="qz-league-member__desc">
                <AtIcon value='play' size='12' color='#7F7F7F'/>
                仅限参赛球员享有此特权
              </View>
              <Button className="qz-league-member__button" onClick={this.onMemberSignUp}>开通</Button>
            </View>
          </View>
          : null}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    deposit: state.deposit.depositInfo ? state.deposit.depositInfo.deposit : 0,
    userInfo: state.user.userInfo,
    payEnabled: state.config ? state.config.payEnabled : null,
    giftEnabled: state.config ? state.config.giftEnabled : null,
  }
}
export default connect(mapStateToProps)(LeagueMemberVerify)
