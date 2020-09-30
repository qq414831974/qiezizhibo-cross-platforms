import Taro, {Component} from '@tarojs/taro'
import {View, ScrollView, Text, Image, Picker} from '@tarojs/components'
import {AtActivityIndicator, AtButton, AtInputNumber} from 'taro-ui'
import './index.scss'
import * as global from '../../../../constants/global';
import {getYuan, isInteger} from '../../../../utils/utils';
import GiftModal from '../../../../components/modal-gift';
import flame from '../../../../assets/live/flame.png';

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  gifts: [];
  loading: boolean;
  heatType: number | null;
  matchInfo: any;
  supportTeam: any;
  supportPlayer: any;
  onHandlePaySuccess: any;
  onHandlePayError: any;
  hidden: any;
  leagueId: any;
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

class GiftPanel extends Component<PageOwnProps, PageState> {
  static defaultProps = {}

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
    if (!isInteger(value)) {
      Taro.showToast({
        'title': "请输入整数",
        'icon': 'none',
      })
      return;
    } else {
      this.setState({currentNum: value})
    }
  }
  onGiftSendClick = () => {
    this.setState({giftConfirmOpen: true})
  }
  onGiftConfrimCancel = () => {
    this.setState({giftConfirmOpen: false})
  }
  onGiftConfrim = (orderId: any) => {
    this.setState({giftConfirmOpen: false})
    this.props.onHandlePaySuccess(orderId);
  }
  refreshDiscount = (gift) => {
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

  render() {
    const {gifts = [], loading = false, heatType = 0, hidden = false} = this.props
    const {currentGift = null, currentNum = 0} = this.state
    const discountPrice = this.getGiftDiscountPriceByNum(currentGift, currentNum);
    const realPrice = this.getGiftRealPriceByNum(currentGift, currentNum);
    const heat = this.getGiftGrowthByType(this.state.currentGift, heatType == global.HEAT_TYPE.TEAM_HEAT ? global.GROWTH_TYPE.TEAM_HEAT : global.GROWTH_TYPE.PLAYER_HEAT, currentNum)
    const exp = this.getGiftGrowthByType(this.state.currentGift, global.GROWTH_TYPE.USER_EXP, currentNum)
    const onGiftClick = this.onGiftClick;

    return (
      <View className="qz-gifts">
        {loading || hidden ?
          <View className="qz-lineup-content-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
          :
          <View>
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
                          <Text>{getYuan(data.price)}茄币</Text>
                        </View> :
                        <View className="qz-gifts__grid-item-price">
                          <Text>免费(余{data.limitRemain})</Text>
                        </View>}
                    </View>
                  )
                )}
              </View>
            </ScrollView>
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
              isOpened={this.state.giftConfirmOpen}
              gift={this.state.currentGift}
              num={this.state.currentNum}
              matchId={this.props.matchInfo ? this.props.matchInfo.id : null}
              leagueId={this.props.leagueId ? this.props.leagueId : null}
              externalId={this.props.heatType == global.HEAT_TYPE.TEAM_HEAT && this.props.supportTeam ? this.props.supportTeam.id : ((this.props.heatType == global.HEAT_TYPE.PLAYER_HEAT || this.props.heatType == global.HEAT_TYPE.LEAGUE_PLAYER_HEAT) && this.props.supportPlayer ? this.props.supportPlayer.id : null)}
              giftInfo={{price: discountPrice, realPrice: realPrice, heatValue: heat, expValue: exp}}
              heatType={this.props.heatType}
              handleCancel={this.onGiftConfrimCancel}
              handleConfirm={this.onGiftConfrim}
              handleError={this.props.onHandlePayError}
            />
          </View>
        }
      </View>
    )
  }
}

export default GiftPanel
