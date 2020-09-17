import {bindActionCreators} from 'redux'
import * as live from '../constants/live'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction} from './index'
import Request from '../utils/request'

export const getLiveMediaList: any = createApiAction(live.ACTIVITY_MEDIA_LIST, (id: number) => new Request().get(api.API_ACTIVITY_MEDIA_LIST(id), null))
export const livePing: any = createApiAction(live.ACTIVITY_PING, (id: number) => new Request().get(api.API_ACTIVITY_PING(id), null, false))
export const livePingManual: any = createApiAction(live.ACTIVITY_PING, (id: number) => new Promise((resolve, reject) => {
  resolve({isPushing: true});
}))

export default bindActionCreators({
  getLiveMediaList,
  livePing,
  livePingManual,
}, store.dispatch)
