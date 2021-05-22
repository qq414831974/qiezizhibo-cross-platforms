export const LOADING_TEXT = '加载中...';

export class FootballEventType {
  static UNOPEN = -1;//-1:比赛未开始
  static START = 0;//0:比赛开始
  static GOAL = 1;//1:进球
  // remark位 助攻球员
  static SHOOT = 2;//2:射门
  // remark位 为空则普通射门
  // SHOOT_BLOCK = 1 射门被拦下
  // SHOOT_DOOR = 2 射到门框
  // SHOOT_OUT = 3 射偏
  static OFFSIDE = 3;//3:越位
  static TACKLE = 4;//4:抢断
  // remark位 为空则普通抢断
  // TACKLE_FAILED = 0
  // TACKLE_SUCCESS = 1
  static FREE_KICK = 5;//5:任意球
  static FOUL = 6;//6:犯规
  static YELLOW = 7;//7:黄牌
  static RED = 8;//8:红牌
  static SAVE = 9;//9:扑救
  static SUBSTITUTE = 10;//10:换人
  // remark位 换上的人
  static EXTRA = 11;//11:加时
  static PENALTY = 12;//12:点球大战开始
  static INJURY = 13;//13:伤停
  // remark位伤停时间
  static HALF_TIME = 14;//14:中场
  static SECOND_HALF = 15;//15:下半场
  static PAUSE = 16;//16:暂停
  static CORNER = 17;//17:角球
  static CROSS = 18;//18:传中
  // remark位 为空则普通传中
  // CROSS_FAILED = 0
  // CROSS_SUCCESS = 1
  static LONG_PASS = 19;//19:长传
  static CLEARANCE = 20;//20:解围
  static FINISH = 21;//21:比赛结束
  static OWN_GOAL = 22;//22:乌龙球
  static PASS_POSSESSION = 23;//23:传球控球率
  static PENALTY_KICK = 24;//24:点球
  // remark位 为空则普通点球
  // PENALTY_KICK_FAILED = 0
  // PENALTY_KICK_SUCCESS = 1
  static PENALTY_GOAL = 25;//24:点球大战进球

  static TEXT = 1000;//1000:文字描述
}

export const MATCH_TYPE = {
  timeLine: 1,
  lineUp: 3,
  chattingRoom: 4,
  clip: 5,
}
export const LEAGUE_TABS_TYPE = {
  leagueRule: "leagueRule",
  leagueMatch: "leagueMatch",
  leagueTeam: "leagueTeam",
  leaguePlayer: "leaguePlayer",
  heatPlayer: "heatPlayer",
  heatTeam: "heatLeagueTeam",
}
export const TABS_TYPE = {
  heatPlayer: "heatPlayer",
  heatLeagueTeam: "heatLeagueTeam",
  matchUp: "matchUp",
  heatReward: "heatReward",
  giftRank: "giftRank",
  clip: "clip",
  statistics: "statistics",
  lineUp: "lineUp",
}
export const ORDER_TYPE = {
  "normal": 0,
  "live": 1,
  "record": 2,
  "monopoly": 3,
  "gift": 4,
  "bet": 5,
  "deposit": 6,
  "leagueMember": 7,
}
export const ORDER_STAUTS = {
  "notpaid": 0,
  "close": 1,
  "paid": 2,
}
export const SHARE_SENTENCE_TYPE = {
  "match": 1,
  "league": 2,
}
export const REPOST_TEXT = [
  "人气落后啦，快进来帮我球队打call！",
  "两队打得相当激烈，还不进来为我们加油！",
  "神仙打架了，快来看！",
  "我的球队需要你的支持！",
  "这场比赛非常关键，我们必须拿下，快来支持吧！",
  "赢球输球不重要，球队人气不能输！速来支持！",
  "玩归玩，闹归闹，直播间支持我一票！",
  "不来现场看球，直播间也舍不得打开吗？快进来支持！",
  "我在球场上打飞机，你来直播间刷飞机~",
  "踢球最怕没人看，你会来看我吗？",
];
export const HEAT_TYPE = {
  TEAM_HEAT: 0,
  PLAYER_HEAT: 1,
  LEAGUE_PLAYER_HEAT: 2,
  LEAGUE_TEAM_HEAT: 3,
}
export const GROWTH_TYPE = {
  USER_EXP: 1,
  TEAM_HEAT: 2,
  PLAYER_HEAT: 3,
  FREE_BET: 4,
}
export const GIFT_TYPE = {
  FREE: 0,
  CHARGE: 1,
}
export const BET_STATUS = {
  BETTING: -1,
  BET_FAILED: 0,
  BET_SUCCESS_NOT_SEND: 1,
  BET_SUCCESS_ALREADY_SEND: 2,
  BET_SUCCESS_GIVE_UP: 3,
  BET_CANCEL: 4,
}
export const SUBSCRIBE_TEMPLATES = {
  MATCH_START: "Sh-UGpahk_q0RiXLtY1N1NAvPjO_10rh_vkimwC-Xi0",
  HEAT_SURPASS: "y8VV0Wp1ndS4phfhSUgrA9QyTwgadZ2VJtmjAOMLx3M",
  HEAT_COUNTDOWN: "2rDzauHgfdE55lncK3jgCuZuoKyNBeYj6gj4UG03S50",
  BET_SUCCESS: "KIvAhpqkNYGc84S6ssvqN6J5UNHZS0xT_C6P-TeugCo"
}
export const PAY_TYPE = {
  ONLINE: 0,
  DEPOSIT: 1,
}
export const DEPOSIT_LOG_TYPE = {
  PAY: 0,
  CHARGE: 1,
  REFUND: 2,
  BET_AWARD: 3,
}
export const BET_TYPE = {
  FREE: 0,
  CHARGE: 1,
}

export class CacheManager {
  static instance: CacheManager;
  CACHE_ENABLED: boolean;

  static getInstance = () => {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
}

export const LEVEL_COLOR = {
  0: "#FF851B",
  1: "#3D9970",
  2: "#2D8CF0",
  3: "#ff4136",
  4: "#B10DC9",
}
