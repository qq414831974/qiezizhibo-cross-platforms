import {
  SEARCH_LEAGUE, SEARCH_LEAGUE_ADD, SEARCH_MATCH, SEARCH_MATCH_ADD, SEARCH_PLAYER, SEARCH_CLEAR_ALL
} from '../constants/search'

type PropsType = {
  league: any;
  match: any;
  player: any;
}

const INITIAL_STATE = {
  league: {},
  match: {},
  player: {},
}

export default function search(state: PropsType = INITIAL_STATE, action) {
  switch (action.type) {
    case SEARCH_LEAGUE:
      return {
        ...state,
        league: action.payload.league
      }
    case SEARCH_LEAGUE_ADD:
      if(action.payload.league == null){
        return state;
      }
      const leaguelist = state.league.records.concat(action.payload.league.records);
      action.payload.league.records = leaguelist;
      return {
        ...state,
        league: action.payload.league
      }
    case SEARCH_MATCH:
      return {
        ...state,
        match: action.payload.match
      }
    case SEARCH_MATCH_ADD:
      if(action.payload.match == null){
        return state;
      }
      const matchlist = state.match.records.concat(action.payload.match.records);
      action.payload.match.records = matchlist;
      return {
        ...state,
        match: action.payload.match
      }
    case SEARCH_PLAYER:
      return {
        ...state,
        player: action.payload.player
      }
    case SEARCH_CLEAR_ALL:
      return {
        ...state,
        league: {},
        match: {},
        player: {}
      }
    default:
      return state
  }
}
