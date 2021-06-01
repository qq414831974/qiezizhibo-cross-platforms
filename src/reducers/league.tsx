import {
  LEAGUE,
  LEAGUES,
  LEAGUES_CLEAR,
  LEAGUE_TEAMS,
  LEAGUE_PLAYERS,
  LEAGUES_ADD,
  LEAGUE_SERIES,
  LEAGUE_SERIES_ADD,
  LEAGUE_SERIES_LEAGUE,
  LEAGUE_REPORT
} from '../constants/league'

type PropsType = {
  league: any;
  leagueList: any;
  leagueSeriesList: any;
  leagueTeams: any;
  leaguePlayers: any;
  seriesLeagues: any;
  leagueReport: any;
}
const INITIAL_STATE = {
  league: {},
  leagueList: {},
  leagueSeriesList: {},
  leagueTeams: {},
  leaguePlayers: {},
  seriesLeagues: {},
  leagueReport: {},
}

export default function league(state: PropsType = INITIAL_STATE, action) {
  switch (action.type) {
    case LEAGUE:
      return {
        ...state,
        league: action.payload
      }
    case LEAGUES:
      return {
        ...state,
        leagueList: action.payload
      }
    case LEAGUES_CLEAR:
      return {
        ...state,
        leagueList: {}
      }
    case LEAGUES_ADD:
      if (action.payload == null) {
        return state;
      }
      const leagueList = state.leagueList.records.concat(action.payload.records);
      action.payload.records = leagueList;
      return {
        ...state,
        leagueList: action.payload
      }
    case LEAGUE_SERIES:
      return {
        ...state,
        leagueSeriesList: action.payload
      }
    case LEAGUE_SERIES_ADD:
      if (action.payload == null) {
        return state;
      }
      const leagueSeriesList = state.leagueSeriesList.records.concat(action.payload.records);
      action.payload.records = leagueSeriesList;
      return {
        ...state,
        leagueSeriesList: action.payload
      }
    case LEAGUE_SERIES_LEAGUE:
      return {
        ...state,
        seriesLeagues: action.payload
      }
    case LEAGUE_TEAMS:
      return {
        ...state,
        leagueTeams: action.payload
      }
    case LEAGUE_PLAYERS:
      return {
        ...state,
        leaguePlayers: action.payload
      }
    case LEAGUE_REPORT:
      return {
        ...state,
        leagueReport: action.payload
      }
    default:
      return state
  }
}
