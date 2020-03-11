import Taro from '@tarojs/taro'
import {bindActionCreators} from 'redux'
import * as config from '../constants/config'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction} from './index'
import Request from '../utils/request'
import {getStorage} from "../utils/utils";

export const getBannerConfig: any = createApiAction(config.CONFIG_BANNER, (params) => new Request().get(api.API_CONFIG_BANNER, params, true, true))
export const getBulletinConfig: any = createApiAction(config.CONFIG_BULLETIN, (params) => new Request().get(api.API_CONFIG_BULLETIN, params, true, true))
export const getLocationConfig: any = createApiAction(config.CONFIG_LOCATION, async () => await getStorage("location"))
export const setLocationConfig: any = createApiAction(config.CONFIG_LOCATION_SET, async (data: any) => Taro.setStorage({
  key: "location",
  data: data
}))
export const setVisit: any = createApiAction(config.VISIT, () => new Request().get(api.API_VISIT, null))

export default bindActionCreators({
  getBannerConfig,
  getBulletinConfig,
  getLocationConfig,
  setLocationConfig,
  setVisit
}, store.dispatch)
