import {
  GIFT_LIST
} from '../constants/pay'

type PropsType = {
  gifts: any;
}
const INITIAL_STATE = {
  gifts: [],
}

export default function Gift(state: PropsType = INITIAL_STATE, action) {
  switch (action.type) {
    case GIFT_LIST:
      return {
        ...state,
        gifts: action.payload
      }
    default:
      return state
  }
}
