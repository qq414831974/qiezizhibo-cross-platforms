import {
  DEPOSIT,
} from '../constants/deposit'

const INITIAL_STATE = {
  depositInfo: {},
}

export default function deposit(state = INITIAL_STATE, action) {
  switch (action.type) {
    case DEPOSIT:
      return {
        ...state,
        depositInfo: action.payload
      }
    default:
      return state
  }
}
