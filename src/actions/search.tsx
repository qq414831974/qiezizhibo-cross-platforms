import {bindActionCreators} from 'redux'
import * as searcher from '../constants/search'
import * as api from '../constants/api'
import store from '../store'
import {createAction,createApiAction} from './index'
import Request from '../utils/request'

type Params = {
  key: string;
  pageNum: number,
  pageSize: number,
}

export const search_league: any = createApiAction(searcher.SEARCH_LEAGUE, (params: Params) => new Request().get(api.API_SEARCH, {type: "league", ...params}))
export const search_league_add: any = createApiAction(searcher.SEARCH_LEAGUE_ADD, (params: Params) => new Request().get(api.API_SEARCH, {type: "league", ...params}))
export const search_match: any = createApiAction(searcher.SEARCH_MATCH, (params: Params) => new Request().get(api.API_SEARCH, {type: "match", ...params}))
export const search_match_add: any = createApiAction(searcher.SEARCH_MATCH_ADD, (params: Params) => new Request().get(api.API_SEARCH, {type: "match", ...params}))
export const search_clear_all: any = createAction(searcher.SEARCH_CLEAR_ALL);
export default bindActionCreators({
  search_league,
  search_league_add,
  search_match,
  search_match_add,
  search_clear_all,
}, store.dispatch)
