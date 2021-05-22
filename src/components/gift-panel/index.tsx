import Taro from '@tarojs/taro'
import {Component} from 'react'
import {View, ScrollView, Text, Image, Picker, Button} from '@tarojs/components'
import {AtActivityIndicator, AtButton, AtInputNumber} from 'taro-ui'
import {connect} from 'react-redux'
import './index.scss'
import * as global from '../../constants/global';
import * as api from '../../constants/api';
import {getYuan, isInteger} from '../../utils/utils';
import GiftModal from '../../components/modal-gift';
import flame from '../../assets/live/left-support.png';
import Request from "../../utils/request";

type PageStateProps = {
  userInfo: any;
  payEnabled: any;
  giftEnabled: any;
}

type PageDispatchProps = {
  onPayConfirm: (callback: any, price: any) => any,
  onPayClose: () => any,
}

type PageOwnProps = {
  gifts: Array<any>;
  loading: boolean;
  heatType: number | null;
  matchInfo: any;
  supportTeam: any;
  supportPlayer: any;
  onHandlePaySuccess: any;
  onHandlePayError: any;
  onHandleShareSuccess: any;
  hidden: any;
  leagueId: any;
  giftWatchPrice?: any;
  giftWatchEternalPrice?: any;
}

type PageState = {
  currentGift: any;
  currentNum: number;
  selectorValue: number;
  numSelectorValue: Array<any>;
  numSelector: Array<any>;
  giftConfirmOpen: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface GiftPanel {
  props: IProps;
}

class GiftPanel extends Component<IProps, PageState> {

  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100];

  constructor(props) {
    super(props)
    this.state = {
      currentGift: null,
      currentNum: 0,
      selectorValue: 0,
      numSelectorValue: [],
      numSelector: [],
      giftConfirmOpen: false,
    }
  }

  componentDidMount() {
    this.props.onHandleShareSuccess && this.props.onHandleShareSuccess(this.clearCurrentGift);
    this.setState({numSelectorValue: this.numbers, numSelector: this.numbers});
  }

  getGiftGrowthByType = (gift: any, type, num) => {
    if (gift == null || gift.growth == null) {
      return null;
    }
    let heat = 0;
    for (let growth of gift.growth) {
      if (growth.type == type) {
        heat = heat + growth.growth;
      }
    }
    return heat * num;
  }
  getGiftDiscountPriceByNum = (gift: any, num) => {
    if (gift != null) {
      const discount = this.getDiscountValue(gift, num);
      if (discount != null) {
        return getYuan(gift.price * num * discount / 100);
      } else {
        return getYuan(gift.price * num);
      }
    }
    return null;
  }
  getGiftRealPriceByNum = (gift: any, num) => {
    if (gift != null) {
      const discount = this.getDiscountValue(gift, num);
      if (discount != null) {
        return getYuan(gift.price * num);
      } else {
        return null;
      }
    }
    return null;
  }
  getDiscountValue = (gift: any, num) => {
    if (gift != null && gift.discountInfo != null) {
      let keyList: Array<any> = [];
      for (let key in gift.discountInfo) {
        if (key <= num) {
          keyList.push(key);
        }
      }
      const maxKey = keyList.sort().reverse()[0];
      if (maxKey != null) {
        return gift.discountInfo[maxKey];
      }
    }
    return null;
  }
  onGiftClick = (gift) => {
    this.refreshDiscount(gift);
    this.setState({currentGift: gift, currentNum: 1, selectorValue: 0})
  }
  onNumPickerChange = (e) => {
    this.setState({
      selectorValue: e.detail.value,
      currentNum: this.state.numSelector[e.detail.value]
    })
  }
  onNumInputChange = (value) => {
    value = Number(value);
    if (!isInteger(value) || value <= 0) {
      Taro.showToast({
        'title': "请输入整数",
        'icon': 'none',
      })
      this.setState({currentNum: 1})
      return 1;
    }
    if (this.state.currentGift.type == global.GIFT_TYPE.FREE) {
      if (value > 1) {
        Taro.showToast({
          'title': "免费礼物只能单个赠送",
          'icon': 'none',
        })
        this.setState({currentNum: 1})
        return 1;
      }
    }
    this.setState({currentNum: value})
    return value;
  }
  onGiftSendClick = () => {
    if (this.props.payEnabled != true) {
      Taro.showToast({
        'title': "由于相关规范，iOS功能暂不可用",
        'icon': 'none',
      })
      return;
    }
    if (this.state.currentGift == null) {
      Taro.showToast({
        'title': "请选择礼物",
        'icon': 'none',
      })
      return;
    }
    const openid = this.props.userInfo.wechatOpenid;
    let param: any = {
      userNo: this.props.userInfo.userNo,
      openId: openid,
      leagueId: this.props.leagueId,
      targetId: this.getTargetId(),
      heatType: this.props.heatType,
    };
    let tmplIds: any = [];
    let hintString: any = "";
    if (this.props.matchInfo && this.props.matchInfo.status == -1) {
      tmplIds.push(global.SUBSCRIBE_TEMPLATES.MATCH_START);
      param.matchId = this.props.matchInfo ? this.props.matchInfo.id : null;
      hintString = hintString + "开赛提醒，";
    }
    tmplIds.push(global.SUBSCRIBE_TEMPLATES.HEAT_SURPASS);
    tmplIds.push(global.SUBSCRIBE_TEMPLATES.HEAT_COUNTDOWN);
    hintString = hintString + "人气榜提醒";


    Taro.requestSubscribeMessage({tmplIds: tmplIds}).then((res: any) => {
      this.setState({giftConfirmOpen: true})
      if (res.errMsg == "requestSubscribeMessage:ok") {
        delete res.errMsg
        new Request().post(api.API_SUBSCRIBE, {templateIds: res, ...param}).then((data: any) => {
          if (data) {
            Taro.showToast({title: `订阅成功，将接收到${hintString}`, icon: "none", duration: 3000});
          }
        })
      }
    }).catch((err) => {
      console.log(err)
      this.setState({giftConfirmOpen: true})
      Taro.showToast({title: `未订阅，则无法收到${hintString}`, icon: "none", duration: 3000});
    })
  }
  onGiftConfrimCancel = () => {
    this.setState({giftConfirmOpen: false})
  }
  onGiftConfrim = (orderId: any) => {
    this.setState({giftConfirmOpen: false})
    setTimeout(() => {
      this.props.onHandlePaySuccess(orderId);
    }, 2000)
  }
  refreshDiscount = (gift) => {
    if (gift.type == global.GIFT_TYPE.FREE) {
      this.setState({numSelectorValue: [1], numSelector: [1]});
      return;
    }
    const values: any = [];
    for (let number of this.numbers) {
      const discount = this.getDiscountValue(gift, number);
      if (discount) {
        values.push(number + `(${discount / 10}折)`);
      } else {
        values.push(number);
      }
    }
    this.setState({numSelectorValue: values, numSelector: this.numbers});
  }
  getTargetId = () => {
    if (this.props.heatType == global.HEAT_TYPE.TEAM_HEAT || this.props.heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) {
      if (this.props.supportTeam) {
        return this.props.supportTeam.id;
      }
    } else if (this.props.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.props.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) {
      if (this.props.supportPlayer) {
        return this.props.supportPlayer.id;
      }
    }
    return null;
  }
  clearCurrentGift = () => {
    this.setState({currentGift: null, currentNum: 0});
  }

  render() {
    const {loading = false, heatType = 0, hidden = false, giftWatchPrice = null, giftWatchEternalPrice = null, payEnabled, giftEnabled} = this.props
    let {gifts = []} = this.props
    const {currentGift = null, currentNum = 0} = this.state
    const discountPrice = this.getGiftDiscountPriceByNum(currentGift, currentNum);
    const realPrice = this.getGiftRealPriceByNum(currentGift, currentNum);
    const heat = this.getGiftGrowthByType(this.state.currentGift, (heatType == global.HEAT_TYPE.TEAM_HEAT || heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) ? global.GROWTH_TYPE.TEAM_HEAT : global.GROWTH_TYPE.PLAYER_HEAT, currentNum)
    const exp = this.getGiftGrowthByType(this.state.currentGift, global.GROWTH_TYPE.USER_EXP, currentNum)
    const freeBet = this.getGiftGrowthByType(this.state.currentGift, global.GROWTH_TYPE.FREE_BET, currentNum)
    const onGiftClick = this.onGiftClick;
    const giftInfo = {price: discountPrice, realPrice: realPrice, heatValue: heat, expValue: exp, freeBetTime: freeBet}
    if (!giftEnabled) {
      gifts = gifts.slice(0, 1);
    }
    return (
      <View className="qz-gifts">
        {loading || hidden ?
          <View className="qz-lineup-content-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
          :
          <View>
            {payEnabled ?
              <ScrollView scrollY className="qz-gifts__content">
                <View className="qz-gifts__grid">
                  {gifts.map((data: any) => (
                      <View key={data.id}
                            className={`qz-gifts__grid-item ${currentGift && currentGift.id == data.id ? "qz-gifts__grid-item-active" : ""}`}
                            onClick={onGiftClick.bind(this, data)}>
                        <View className="qz-gifts__grid-item-img-container">
                          <Image src={data.pic}/>
                        </View>
                        <View className="qz-gifts__grid-item-name">
                          <Text>{data.name}</Text>
                        </View>
                        {data.type == global.GIFT_TYPE.CHARGE ? <View className="qz-gifts__grid-item-price">
                            <View>{getYuan(data.price)}茄币</View>
                          </View> :
                          <View className="qz-gifts__grid-item-price">
                            <Text>{data.limitRemain > 0 ? `免费(余${data.limitRemain})` : "分享群得茄子"}</Text>
                          </View>}
                        <View className="qz-gifts__grid-item-price">
                          <Image className="qz-gifts__grid-item-price__image" src={flame}/>
                          <Text>+{this.getGiftGrowthByType(data, (heatType == global.HEAT_TYPE.TEAM_HEAT || heatType == global.HEAT_TYPE.LEAGUE_TEAM_HEAT) ? global.GROWTH_TYPE.TEAM_HEAT : global.GROWTH_TYPE.PLAYER_HEAT, 1)}</Text>
                        </View>
                        {(giftWatchPrice != null || giftWatchEternalPrice != null) && data.price != null && data.price >= giftWatchPrice ?
                          <View className="qz-gifts__grid-item-freewatch">
                            送本场录像
                          </View>
                          : null}
                      </View>
                    )
                  )}
                </View>
              </ScrollView>
              : <View className="qz-gifts__content y-center">
                <View className="text-center w-full">
                  由于相关规范，iOS功能暂不可用
                </View>
                <Button className="black" openType="contact">联系客服</Button>
              </View>}
            <View className="qz-gifts__bottom-container">
              <View className="qz-gifts__bottom at-row">
                <View className="at-col at-col-7">
                  <View className="qz-gifts__bottom-left">
                    {discountPrice ?
                      <View
                        className="qz-gifts__bottom-price">茄币：{currentGift.type == global.GIFT_TYPE.CHARGE ? discountPrice : "免费"}</View>
                      : null}
                    {realPrice ?
                      <View className="qz-gifts__bottom-discount">(原价{realPrice})</View>
                      : null}
                    {heat ?
                      <View className="qz-gifts__bottom-heat"><Image src={flame}/><Text>+{heat}</Text></View> : null}
                    {/*{exp ?*/}
                    {/*  <View className="qz-gifts__bottom-exp">+{exp}经验</View> : null}*/}
                  </View>
                </View>
                <View className="at-col at-col-5">
                  <View className="at-row">
                    <View className="at-col at-col-6 qz-gifts__bottom-num-container">
                      <View className="qz-gifts__bottom-num">
                        <AtInputNumber
                          className="at-number-input-without-button"
                          type="number"
                          value={this.state.currentNum}
                          onChange={this.onNumInputChange}/>
                      </View>
                      <Picker
                        className="h-full center"
                        mode='selector'
                        range={this.state.numSelectorValue}
                        onChange={this.onNumPickerChange}
                        value={this.state.selectorValue}>
                        <View className="at-icon at-icon-chevron-down qz-gifts__bottom-arrow"/>
                      </Picker>
                    </View>
                    <View className="at-col at-col-6 qz-gifts__bottom-button">
                      <AtButton
                        className="vertical-middle half-circle-button"
                        size="small"
                        type="primary"
                        full
                        circle
                        onClick={this.onGiftSendClick}>
                        发送
                      </AtButton>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <GiftModal
              giftWatchPrice={giftWatchPrice}
              giftWatchEternalPrice={giftWatchEternalPrice}
              isOpened={this.state.giftConfirmOpen}
              gift={this.state.currentGift}
              num={this.state.currentNum}
              matchId={this.props.matchInfo ? this.props.matchInfo.id : null}
              leagueId={this.props.leagueId ? this.props.leagueId : null}
              externalId={this.getTargetId()}
              giftInfo={giftInfo}
              heatType={this.props.heatType}
              handleCancel={this.onGiftConfrimCancel}
              handleConfirm={this.onGiftConfrim}
              handleError={this.props.onHandlePayError}
              onPayConfirm={this.props.onPayConfirm}
              onPayClose={this.props.onPayClose}
            />
          </View>
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    payEnabled: state.config ? state.config.payEnabled : null,
    giftEnabled: state.config ? state.config.giftEnabled : null,
  }
}
export default connect(mapStateToProps)(GiftPanel)
