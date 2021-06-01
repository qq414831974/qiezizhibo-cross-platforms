import {
  ACTIVITY_MEDIA_LIST,ACTIVITY_MEDIA_LIST_CLEAR, ACTIVITY_PING
} from '../constants/live'

type PropsType = {
  mediaList: any;
  ping: any;
}
const INITIAL_STATE = {
  mediaList: [],
  ping: {},
}

export default function live(state: PropsType = INITIAL_STATE, action) {
  switch (action.type) {
    case ACTIVITY_MEDIA_LIST:
      return {
        ...state,
        mediaList: action.payload
      }
    case ACTIVITY_MEDIA_LIST_CLEAR:
      return {
        ...state,
        mediaList: []
      }
    case ACTIVITY_PING:
      return {
        ...state,
        ping: action.payload
      }
    default:
      return state
  }
}
