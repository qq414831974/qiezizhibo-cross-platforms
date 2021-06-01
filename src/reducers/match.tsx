import {
  MATCH,
  MATCH_CLEAR,
  MATCHES,
  MATCHES_ADD,
  MATCHES_CLEAR,
  MATCH_COMMENT,
  MATCH_COMMENT_CLEAR,
  MATCH_COMMENT_ADD,
  MATCH_COMMENT_COUNT,
  MATCH_NOOICE,
  MATCH_RECOMMEND,
  MATCH_RECOMMEND_ADD,
  MATCH_STATUS, MATCH_COMMENT_DANMU
} from '../constants/match'

type PropsType = {
  match: any;
  matchList: any;
  comment: any;
  comment_count: any;
  nooice: any;
  recommend: any;
  status: any;
  danmu: any;
}
const INITIAL_STATE = {
  match: {},
  matchList: {},
  comment: {},
  comment_count: {},
  nooice: {},
  recommend: {},
  status: {},
  danmu: {},
}

export default function match(state: PropsType = INITIAL_STATE, action) {
  switch (action.type) {
    case MATCH:
      return {
        ...state,
        match: action.payload
      }
    case MATCH_CLEAR:
      return {
        ...state,
        match: {}
      }
    case MATCHES:
      return {
        ...state,
        matchList: action.payload
      }
    case MATCHES_ADD:
      if (action.payload == null) {
        return state;
      }
      const matchlist = state.matchList.records.concat(action.payload.records);
      action.payload.records = matchlist;
      return {
        ...state,
        matchList: action.payload
      }
    case MATCHES_CLEAR:
      return {
        ...state,
        matchList: {}
      }
    case MATCH_COMMENT:
      const commentList = action.payload.records.reverse()
      action.payload.records = commentList;
      return {
        ...state,
        comment: action.payload
      }
    case MATCH_COMMENT_CLEAR:
      return {
        ...state,
        comment: {}
      }
    case MATCH_COMMENT_ADD:
      if (action.payload == null) {
        return state;
      }
      let commentListAdd = action.payload.records.reverse().concat(state.comment.records);
      if (commentListAdd.length >= 10) {
        commentListAdd = commentListAdd.slice(0, 9);
      }
      action.payload.records = commentListAdd;
      return {
        ...state,
        comment: action.payload
      }
    case MATCH_COMMENT_COUNT:
      return {
        ...state,
        comment_count: action.payload
      }
    case MATCH_NOOICE:
      return {
        ...state,
        nooice: action.payload
      }
    case MATCH_RECOMMEND:
      return {
        ...state,
        recommend: action.payload
      }
    case MATCH_RECOMMEND_ADD:
      if (action.payload == null) {
        return state;
      }
      const recommendList = state.recommend.records.concat(action.payload.records);
      action.payload.records = recommendList;
      return {
        ...state,
        recommend: action.payload
      }
    case MATCH_STATUS:
      return {
        ...state,
        status: action.payload
      }
    case MATCH_COMMENT_DANMU:
      return {
        ...state,
        danmu: action.payload
      }
    default:
      return state
  }
}
