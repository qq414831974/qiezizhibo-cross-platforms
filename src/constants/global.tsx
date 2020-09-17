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
  1: '时间轴',
  2: '统计',
  3: '名单',
  4: '聊天室',
}

export class CacheManager {
  static instance: CacheManager;
  CACHE_ENABLED: boolean;

  static getInstance() {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
}
