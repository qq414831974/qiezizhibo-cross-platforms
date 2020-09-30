import {bindActionCreators} from 'redux'
import * as match from '../constants/match'
import * as api from '../constants/api'
import store from '../store'
import {createApiAction, createAction} from './index'
import Request from '../utils/request'
import * as global from "../constants/global";

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
export const getMatchInfo: any = createApiAction(match.MATCH, (id: number) => {
  let url = api.API_MATCH(id);
  if (global.CacheManager.getInstance().CACHE_ENABLED) {
    url = api.API_CACHED_MATCH(id);
  }
  return new Request().get(url, null);
})
export const getMatchInfo_clear: any = createAction(match.MATCH_CLEAR)
export const getMatchList: any = createApiAction(match.MATCHES, (params: MatchParams | any) => {
  let url = api.API_MATCHES;
  if (global.CacheManager.getInstance().CACHE_ENABLED && params.round != null) {
    url = api.API_CACHED_MATCHES(params.leagueId, params.round);
    params = null;
  }
  if (global.CacheManager.getInstance().CACHE_ENABLED && params.status != null) {
    if (params.status == "finish") {
      url = api.API_CACHED_MATCHES_FINISH;
    } else if (params.status == "unfinish") {
      url = api.API_CACHED_MATCHES_UNFINISH;
    }
    params = null;
  }
  return new Request().get(url, params);
})
export const getMatchList_add: any = createApiAction(match.MATCHES_ADD, (params: MatchParams) => new Request().get(api.API_MATCHES, params))
export const getMatchList_clear: any = createAction(match.MATCHES_CLEAR)
export const getMatchStatus: any = createApiAction(match.MATCH_STATUS, (params: MatchStatusParams) => new Request().get(api.API_MATCH_STATUS, params))
export const getRecommendMatch: any = createApiAction(match.MATCH_RECOMMEND, (params: MatchRecommendParams) => new Request().get(api.API_MATCH_RECOMMEND, params))
export const getRecommendMatch_add: any = createApiAction(match.MATCH_RECOMMEND_ADD, (params: MatchRecommendParams) => new Request().get(api.API_MATCH_RECOMMEND, params))
export const addMatchNooice: any = createApiAction(match.MATCH_NOOICE, (params: MathNooiceParams) => new Request().get(api.API_MATCH_NOOICE, params))
export const getMatchComment: any = createApiAction(match.MATCH_COMMENT, (params: CommentParams) => new Request().get(api.API_MATCH_COMMENT, params))
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
  getMatchComment_add,
  getMatchComment_Count,
  getMatchDanmu,
}, store.dispatch)
