import {bindActionCreators} from 'redux'
import * as league from '../constants/league'
import * as api from '../constants/api'
import store from '../store'
import {createAction, createApiAction} from './index'
import Request from '../utils/request'

type LeagueParams = {
  id: number,
  detailRound: boolean | null
}

type LeaguesParams = {
  pageNum: number,
  pageSize: number,
  city: string | null,
  country: number | null,
  status: number | null,
  name: number | null,
  match: number | null,
}
type LeagueSeriesParams = {
  pageNum: number,
  pageSize: number,
  filter: any | null,
  sortField: string | null,
  sortOrder: string | null,
}
type LeaguePlayerParams = {
  leagueId: number,
  goal: boolean | null,
}

type LeagueTeamParams = {
  leagueId: number,
  teamId: number | null,
}
type SeriesLeagueParams = {
  leagueId: number,
}
export const getLeagueInfo: any = createApiAction(league.LEAGUE, (params: LeagueParams) => new Request().get(api.API_LEAGUE(params.id), params))
export const getLeagueList: any = createApiAction(league.LEAGUES, (params: LeaguesParams) => new Request().get(api.API_LEAGUES, params))
export const getLeagueList_add: any = createApiAction(league.LEAGUES_ADD, (params: LeaguesParams) => new Request().get(api.API_LEAGUES, params))
export const getLeagueList_clear: any = createAction(league.LEAGUES_CLEAR)
export const getLeagueSeriesList: any = createApiAction(league.LEAGUE_SERIES, (params: LeagueSeriesParams) => new Request().get(api.API_LEAGUE_SERIES, params))
export const getLeagueSeriesList_add: any = createApiAction(league.LEAGUE_SERIES_ADD, (params: LeagueSeriesParams) => new Request().get(api.API_LEAGUE_SERIES, params))
export const getLeagueSeriesLeagues: any = createApiAction(league.LEAGUE_SERIES_LEAGUE, (params: SeriesLeagueParams) => new Request().get(api.API_LEAGUE_SERIES_LEAGUE, params))
export const getLeaguePlayer: any = createApiAction(league.LEAGUE_PLAYERS, (params: LeaguePlayerParams) => new Request().get(api.API_LEAGUE_PLAYER, params))
export const getLeagueTeam: any = createApiAction(league.LEAGUE_TEAMS, (params: LeagueTeamParams) => new Request().get(api.API_LEAGUE_TEAM, params))
export const getLeagueReport: any = createApiAction(league.LEAGUE_REPORT, (id: number) => new Request().get(api.API_LEAGUE_REPORT, {leagueId: id}))

export default bindActionCreators({
  getLeagueInfo,
  getLeagueList,
  getLeagueList_clear,
  getLeagueList_add,
  getLeagueSeriesList,
  getLeagueSeriesList_add,
  getLeagueSeriesLeagues,
  getLeaguePlayer,
  getLeagueTeam,
  getLeagueReport,
}, store.dispatch)
