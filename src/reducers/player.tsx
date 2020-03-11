import {
  PLAYER, PLAYERS, PLAYER_BEST, PLAYER_MEDIA
} from '../constants/player'

type PropsType = {
  player: any;
  playerList: any;
  playerBestList: any;
  playerMeidaList: any;
}
const INITIAL_STATE = {
  player: {},
  playerList: {},
  playerBestList: {},
  playerMeidaList: {},
}

export default function player(state: PropsType = INITIAL_STATE, action) {
  switch (action.type) {
    case PLAYER:
      return {
        ...state,
        player: action.payload
      }
    case PLAYERS:
      return {
        ...state,
        playerList: action.payload
      }
    case PLAYER_BEST:
      return {
        ...state,
        playerBestList: action.payload
      }
    case PLAYER_MEDIA:
      return {
        ...state,
        playerMeidaList: action.payload
      }
    default:
      return state
  }
}
