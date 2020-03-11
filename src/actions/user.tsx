import {bindActionCreators} from 'redux'
import * as user from '../constants/user'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction, createAction} from './index'
import Request from '../utils/request'

export const getUserInfo: any = createApiAction(user.USERINFO, (params) => new Request().get(`${api.API_USER}/${params.openId}`, {type: "openId"}))
export const clearUserInfo = createAction(user.USERINFO_REMOVE);
export default bindActionCreators({
  getUserInfo,
  clearUserInfo
}, store.dispatch)
