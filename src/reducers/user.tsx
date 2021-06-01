import {
  USERINFO, USERINFO_REMOVE,
} from '../constants/user'

const INITIAL_STATE = {
  userInfo: {},
}

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case USERINFO:
      return {
        ...state,
        userInfo: action.payload
      }
    case USERINFO_REMOVE:
      return {
        ...state,
        userInfo: {}
      }
    default:
      return state
  }
}
