import {
  CONFIG, CONFIG_BANNER, CONFIG_BULLETIN, CONFIG_LOCATION, CONFIG_WECHAT,CONFIG_PAY_ENABLED
} from '../constants/config'

const INITIAL_STATE = {
  config: {},
  bannerConfig: [],
  bulletinConfig: [],
  wechatConfig: {},
  locationConfig: {},
  payEnabled: true,
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
    default:
      return state
  }
}
