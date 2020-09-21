import {bindActionCreators} from 'redux'
import * as pay from '../constants/pay'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction} from './index'
import Request from '../utils/request'

type GiftsParams = {
  matchId: number,
}
export const getGiftList: any = createApiAction(pay.GIFT_LIST, (param: GiftsParams) => new Request().get(api.API_GIFT_LIST, param))

export default bindActionCreators({
  getGiftList,
}, store.dispatch)
