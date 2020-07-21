import {bindActionCreators} from 'redux'
import * as live from '../constants/live'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction,createAction} from './index'
import Request from '../utils/request'

export const getLiveMediaList: any = createApiAction(live.ACTIVITY_MEDIA_LIST, (id: number) => new Request().get(api.API_ACTIVITY_MEDIA_LIST(id), null))
export const getLiveMediaList_clear: any = createAction(live.ACTIVITY_MEDIA_LIST_CLEAR)
export const livePing: any = createApiAction(live.ACTIVITY_PING, (id: number) => new Request().get(api.API_ACTIVITY_PING(id), null,false))

export default bindActionCreators({
  getLiveMediaList,
  getLiveMediaList_clear,
  livePing,
}, store.dispatch)
