import {bindActionCreators} from 'redux'
import {
  REGISTRATION_PLAYER_FUNC,
  REGISTRATION_TEAM_FUNC,
  REGISTRATION_TEAM,
  REGISTRATION_PLAYER,
  REGISTRATION_PLAYER_DELETE_FUNC,
  REGISTRATION_COMPLETE_FUNC,
  REGISTRATION_VERIFY_COMPLETE_FUNC
} from "../constants/registration";
import store from "../store";

export function setRegistrationTeamCallbackFunc(func) {
  return {
    type: REGISTRATION_TEAM_FUNC,
    func: func
  }
}

export function setRegistrationPlayerCallbackFunc(func) {
  return {
    type: REGISTRATION_PLAYER_FUNC,
    func: func
  }
}

export function setRegistrationPlayerDeleteCallbackFunc(func) {
  return {
    type: REGISTRATION_PLAYER_DELETE_FUNC,
    func: func
  }
}

export function setRegistrationPlayer(player) {
  return {
    type: REGISTRATION_PLAYER,
    player: player
  }
}

export function setRegistrationTeam(team) {
  return {
    type: REGISTRATION_TEAM,
    team: team
  }
}

export function setRegistrationCompleteFunc(func) {
  return {
    type: REGISTRATION_COMPLETE_FUNC,
    func: func
  }
}

export function setRegistrationVerifyCompleteFunc(func) {
  return {
    type: REGISTRATION_VERIFY_COMPLETE_FUNC,
    func: func
  }
}

export default bindActionCreators({
  setRegistrationTeamCallbackFunc,
  setRegistrationPlayerCallbackFunc,
  setRegistrationPlayerDeleteCallbackFunc,
  setRegistrationPlayer,
  setRegistrationTeam,
  setRegistrationCompleteFunc,
  setRegistrationVerifyCompleteFunc,
}, store.dispatch)
