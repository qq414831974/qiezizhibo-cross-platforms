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
type BestPlayersParams = {
  pageNum: number,
  pageSize: number,
}
type PlayerMeidaParams = {
  playerID: number,
}
export const getPlayerInfo: any = createApiAction(player.PLAYER, (id: number) => new Request().get(api.API_PLAYER(id), null))
export const getPlayerList: any = createApiAction(player.PLAYERS, (params: PlayersParams) => new Request().get(api.API_PLAYERS, params))
export const getBestPlayerList: any = createApiAction(player.PLAYER_BEST, (params: BestPlayersParams) => new Request().get(api.API_PLAYER_BEST, params))
export const getPlayerMediaList: any = createApiAction(player.PLAYER_MEDIA, (params: PlayerMeidaParams) => new Request().get(api.API_PLAYER_MEDIA, params))

export default bindActionCreators({
  getPlayerInfo,
  getPlayerList,
  getBestPlayerList,
  getPlayerMediaList,
}, store.dispatch)
