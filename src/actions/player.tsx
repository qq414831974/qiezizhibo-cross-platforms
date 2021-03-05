import {bindActionCreators} from 'redux'
import * as player from '../constants/player'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction} from './index'
import Request from '../utils/request'

type PlayersParams = {
  pageNum: number,
  pageSize: number,
  teamId?: number,
  matchId?: number,
}
export const getPlayerInfo: any = createApiAction(player.PLAYER, (id: number) => new Request().get(api.API_PLAYER(id), null))
export const getPlayerList: any = createApiAction(player.PLAYERS, (params: PlayersParams) => new Request().get(api.API_PLAYERS, params))

export default bindActionCreators({
  getPlayerInfo,
  getPlayerList,
}, store.dispatch)
