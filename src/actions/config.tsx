import Taro from '@tarojs/taro'
import {bindActionCreators} from 'redux'
import * as config from '../constants/config'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction} from './index'
import Request from '../utils/request'
import {getStorage} from "../utils/utils";
import * as global from "../constants/global";

export const getBannerConfig: any = createApiAction(config.CONFIG_BANNER, (params) => {
  let url = api.API_CONFIG_BANNER;
  if (global.CacheManager.getInstance().CACHE_ENABLED) {
    url = api.API_CACHED_BANNER;
    params = null;
  }
  return new Request().get(url, params, true, true)
})
export const getBulletinConfig: any = createApiAction(config.CONFIG_BULLETIN, (params) => {
  let url = api.API_CONFIG_BULLETIN;
  if (global.CacheManager.getInstance().CACHE_ENABLED) {
    url = api.API_CACHED_BULLETIN;
    params = null;
  }
  return new Request().get(url, params, true, true);
})
export const getLocationConfig: any = createApiAction(config.CONFIG_LOCATION, async () => await getStorage("location"))
export const setLocationConfig: any = createApiAction(config.CONFIG_LOCATION_SET, async (data: any) => Taro.setStorage({
  key: "location",
  data: data
}))
export const setVisit: any = createApiAction(config.VISIT, () => new Request().post(api.API_VISIT, {"areatype": 2}))

export default bindActionCreators({
  getBannerConfig,
  getBulletinConfig,
  getLocationConfig,
  setLocationConfig,
  setVisit
}, store.dispatch)
