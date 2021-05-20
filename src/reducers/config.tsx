import {
  CONFIG,
  CONFIG_BANNER,
  CONFIG_BULLETIN,
  CONFIG_LOCATION,
  CONFIG_WECHAT,
  CONFIG_PAY_ENABLED,
  CONFIG_GIFT_ENABLED,
  CONFIG_GET_SHARE_SENTENCE,
  CONFIG_EXP
} from '../constants/config'

const INITIAL_STATE = {
  config: {},
  bannerConfig: [],
  bulletinConfig: [],
  wechatConfig: {},
  locationConfig: {},
  payEnabled: true,
  giftEnabled: true,
  shareSentence: [],
  expInfo: [],
}

export default function config(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CONFIG:
      return {
        ...state,
        config: action.payload
      }
    case CONFIG_BANNER:
      return {
        ...state,
        bannerConfig: action.payload
      }
    case CONFIG_BULLETIN:
      return {
        ...state,
        bulletinConfig: action.payload
      }
    case CONFIG_WECHAT:
      return {
        ...state,
        wechatConfig: action.payload
      }
    case CONFIG_LOCATION:
      return {
        ...state,
        locationConfig: action.payload
      }
    case CONFIG_PAY_ENABLED:
      return {
        ...state,
        payEnabled: action.payload
      }
    case CONFIG_GIFT_ENABLED:
      return {
        ...state,
        giftEnabled: action.payload
      }
    case CONFIG_GET_SHARE_SENTENCE:
      return {
        ...state,
        shareSentence: action.payload
      }
    case CONFIG_EXP:
      return {
        ...state,
        expInfo: action.payload
      }
    default:
      return state
  }
}
