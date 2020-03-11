import {
  AREAS,
} from '../constants/area'

const INITIAL_STATE = {
  areas: {},
}

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case AREAS:
      return {
        ...state,
        areas: action.payload
      }
    default:
      return state
  }
}
