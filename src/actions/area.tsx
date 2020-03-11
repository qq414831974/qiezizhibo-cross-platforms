import {bindActionCreators} from 'redux'
import * as area from '../constants/area'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction} from './index'
import Request from '../utils/request'

export const getAreas: any = createApiAction(area.AREAS, () => new Request().get(api.API_AREA, null))
export default bindActionCreators({
  getAreas,
}, store.dispatch)
