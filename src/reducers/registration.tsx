import {
  REGISTRATION_TEAM_FUNC,
  REGISTRATION_PLAYER_FUNC,
  REGISTRATION_PLAYER_DELETE_FUNC,
  REGISTRATION_TEAM,
  REGISTRATION_PLAYER,
  REGISTRATION_COMPLETE_FUNC,
  REGISTRATION_VERIFY_COMPLETE_FUNC,
} from '../constants/registration'

type PropsType = {
  registrationTeamFunc: any;
  registrationPlayerFunc: any;
  registrationPlayerDeleteFunc: any;
  registrationTeam: any;
  registrationPlayer: any;
  registrationCompleteFunc: any;
  registrationVerifyCompleteFunc: any;
}
const INITIAL_STATE = {
  registrationTeamFunc: null,
  registrationPlayerFunc: null,
  registrationPlayerDeleteFunc: null,
  registrationTeam: null,
  registrationPlayer: null,
  registrationCompleteFunc: null,
  registrationVerifyCompleteFunc: null,
}

export default function registration(state: PropsType = INITIAL_STATE, action) {
  switch (action.type) {
    case REGISTRATION_TEAM_FUNC:
      return {
        ...state,
        registrationTeamFunc: action.func
      }
    case REGISTRATION_PLAYER_FUNC:
      return {
        ...state,
        registrationPlayerFunc: action.func
      }
    case REGISTRATION_PLAYER_DELETE_FUNC:
      return {
        ...state,
        registrationPlayerDeleteFunc: action.func
      }
    case REGISTRATION_TEAM:
      return {
        ...state,
        registrationTeam: action.team
      }
    case REGISTRATION_PLAYER:
      return {
        ...state,
        registrationPlayer: action.player
      }
    case REGISTRATION_COMPLETE_FUNC:
      return {
        ...state,
        registrationCompleteFunc: action.func
      }
    case REGISTRATION_VERIFY_COMPLETE_FUNC:
      return {
        ...state,
        registrationVerifyCompleteFunc: action.func
      }
    default:
      return state
  }
}
