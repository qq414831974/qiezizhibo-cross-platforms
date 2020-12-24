import {bindActionCreators} from 'redux'
import * as deposit from '../constants/deposit'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction} from './index'
import Request from '../utils/request'

export const getDeposit: any = createApiAction(deposit.DEPOSIT, (userNo) => new Request().get(api.API_DEPOSIT, {userNo: userNo}))
export default bindActionCreators({
  getDeposit,
}, store.dispatch)
