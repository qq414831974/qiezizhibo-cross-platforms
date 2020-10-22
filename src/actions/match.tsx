import {bindActionCreators} from 'redux'
import * as match from '../constants/match'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction, createAction} from './index'
import Request from '../utils/request'

type MatchParams = {
  pageNum: number,
  pageSize: number,
  leagueId?: number,
  round?: string,
  status?: "live" | "finish" | "unopen" | "open" | "unfinish",
  time?: string,
  name?: string,
  orderby?: "desc" | "asc",
  isActivity?: boolean,
  thumbnail?: boolean,
}

type MatchRecommendParams = {
  pageNum: number,
  pageSize: number,
  id?: number,
  thumbnail?: boolean,
}
type CommentParams = {
  pageNum: number,
  pageSize: number,
  matchId: number,
}
type CommentCountParams = {
  matchId: number,
}
type MathNooiceParams = {
  matchId: number,
  teamId: number,
  nooice?: number,
}
type MatchStatusParams = {
  matchid: number,
  type?: Array<string>,
  fullTime?: boolean,
}
type DanmuParams = {
  matchId: number,
  index: number,
}
export const getMatchInfo: any = createApiAction(match.MATCH, (id: number) => new Request().get(api.API_MATCH(id), null))
export const getMatchInfo_clear: any = createAction(match.MATCH_CLEAR)
export const getMatchList: any = createApiAction(match.MATCHES, (params: MatchParams) => new Request().get(api.API_MATCHES, params))
export const getMatchList_add: any = createApiAction(match.MATCHES_ADD, (params: MatchParams) => new Request().get(api.API_MATCHES, params))
export const getMatchList_clear: any = createAction(match.MATCHES_CLEAR)
export const getMatchStatus: any = createApiAction(match.MATCH_STATUS, (params: MatchStatusParams) => new Request().get(api.API_MATCH_STATUS, params))
export const getRecommendMatch: any = createApiAction(match.MATCH_RECOMMEND, (params: MatchRecommendParams) => new Request().get(api.API_MATCH_RECOMMEND, params))
export const getRecommendMatch_add: any = createApiAction(match.MATCH_RECOMMEND_ADD, (params: MatchRecommendParams) => new Request().get(api.API_MATCH_RECOMMEND, params))
export const addMatchNooice: any = createApiAction(match.MATCH_NOOICE, (params: MathNooiceParams) => new Request().get(api.API_MATCH_NOOICE, params))
export const getMatchComment: any = createApiAction(match.MATCH_COMMENT, (params: CommentParams) => new Request().get(api.API_MATCH_COMMENT, params))
export const getMatchComment_clear: any = createAction(match.MATCH_COMMENT_CLEAR)
export const getMatchComment_add: any = createApiAction(match.MATCH_COMMENT_ADD, (params: CommentParams) => new Request().get(api.API_MATCH_COMMENT, params))
export const getMatchComment_Count: any = createApiAction(match.MATCH_COMMENT_COUNT, (params: CommentCountParams) => new Request().get(api.API_MATCH_COMMENT_COUNT, params))
export const getMatchDanmu: any = createApiAction(match.MATCH_COMMENT_DANMU, (params: DanmuParams) => new Request().get(api.API_MATCH_COMMENT_DANMU, params))

export default bindActionCreators({
  getMatchInfo,
  getMatchInfo_clear,
  getMatchList,
  getMatchList_add,
  getMatchList_clear,
  getMatchStatus,
  getRecommendMatch,
  getRecommendMatch_add,
  addMatchNooice,
  getMatchComment,
  getMatchComment_clear,
  getMatchComment_add,
  getMatchComment_Count,
  getMatchDanmu,
}, store.dispatch)
