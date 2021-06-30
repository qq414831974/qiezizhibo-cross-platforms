import {combineReducers} from 'redux'
import user from './user'
import config from './config'
import search from './search'
import league from './league'
import match from './match'
import live from './live'
import player from './player'
import area from './area'
import pay from './pay'
import deposit from './deposit'
import registration from './registration'

export default combineReducers({
  user,
  config,
  search,
  league,
  match,
  live,
  player,
  area,
  pay,
  deposit,
  registration,
})
