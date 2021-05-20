export const protocol_http = "https://";
export const protocol_ws = "wss://";
export const gateway_client_service = "www.qiezizhibo.com";
export const gateway_admin_service = `${protocol_http}${gateway_client_service}/gateway-admin`
export const auth_service = `${protocol_http}${gateway_client_service}/service-auth`
export const user_service = `${protocol_http}${gateway_client_service}/service-user`
export const system_service = `${protocol_http}${gateway_client_service}/service-system`
export const football_service = `${protocol_http}${gateway_client_service}/service-football`
export const media_service = `${protocol_http}${gateway_client_service}/service-media`
export const chat_service = `${protocol_http}${gateway_client_service}/service-chat`
export const live_service = `${protocol_http}${gateway_client_service}/service-live`
export const pay_service = `${protocol_http}${gateway_client_service}/service-pay`
export const websocket_service = `${protocol_ws}${gateway_client_service}/service-websocket`
// export const websocket_service = `ws://172.20.10.5:8080`
// export const host = "http://192.168.3.102:8080";

//websocket
export const websocket = (id) => `${websocket_service}/websocket/${id}`;

//config
export const API_CONFIG_BANNER = `${system_service}/sys/banner`;
export const API_CONFIG_BULLETIN = `${system_service}/sys/bulletin`;
export const API_CONFIG_BULLETIN_MATCH = `${system_service}/sys/bulletin/match`;
export const API_SYSTEM_SECURITY_CHECK = `${system_service}/wx/ma/securityCheck`;
export const API_VISIT = `${user_service}/user/visit`;
export const API_GET_SHARE_MOMENT_PICTURE = `${system_service}/wx/ma/picture/moment`;
export const API_GET_SHARE_SENTENCE = `${system_service}/sys/share/sentence`;
export const API_GET_SHARE_PICTURE = `${system_service}/wx/ma/picture/share`;
export const API_GET_HEAT_COMPETITION_SHARE = `${system_service}/wx/ma/picture/heat`;
export const API_SYS_PAYMENT_CONFIG = `${system_service}/sys/config/payment`;
export const API_SYS_FEEDBACK = `${system_service}/sys/feedback`;
export const API_SYS_EXP = `${system_service}/sys/exp`;

//user
export const API_LOGIN = `${auth_service}/auth`;
export const API_PHONENUMBER = `${auth_service}/user/phone`;
export const API_AUTH_USER = `${auth_service}/auth/user`;
export const API_USER = `${user_service}/user`;
export const API_REFRESH_TOKEN = `${auth_service}/auth/refresh_token`;
export const API_USER_ABILITY = `${user_service}/user/ability`;
export const API_USER_ADDRESS = `${user_service}/user/address`;
export const API_USER_EXP = `${user_service}/user/exp`;

//league
export const API_LEAGUE = (id) => `${football_service}/league/${id}`;
export const API_LEAGUES = `${football_service}/league`;
export const API_LEAGUE_SERIES = `${football_service}/league`;
export const API_LEAGUE_PLAYER = `${football_service}/league/rank/player`;
export const API_LEAGUE_TEAM = `${football_service}/league/rank/team`;
export const API_LEAGUE_SERIES_LEAGUE = `${football_service}/league`;
export const API_LEAGUE_REPORT = `${football_service}/league/report`;
export const API_LEAGUE_RANK_SETTING = `${football_service}/league/rank/setting`;
export const API_LEAGUE_AD = `${football_service}/ad/league`;

//match
export const API_MATCH = (id) => `${football_service}/match/${id}`;
export const API_MATCHES = `${football_service}/match`;
export const API_MATCH_STATUS = `${football_service}/timeline/status`;
export const API_MATCH_NOOICE = `${football_service}/match/nooice`;
export const API_MATCH_COMMENT = `${chat_service}/comment`;
export const API_MATCH_COMMENT_DANMU = `${chat_service}/comment/danmu`;
export const API_MATCH_MEDIA = `${media_service}/media/match`;
export const API_MATCH_ONLINE = `${football_service}/match/online`;

//team
export const API_TEAM = (id) => `${football_service}/team/${id}`;
export const API_TEAMS = `${football_service}/teams`;

//player
export const API_PLAYER = (id) => `${football_service}/player/${id}`;
export const API_PLAYERS = `${football_service}/player`;
export const API_PLAYER_BEST = `${football_service}/player/best`;
export const API_PLAYER_MEDIA = `${media_service}/media/player`;

//live
export const API_ACTIVITY_MEDIA_LIST = (id) => `${media_service}/media/activity?activityId=${id}`;
export const API_ACTIVITY_PING = `${live_service}/activity/ping`;

//media
export const API_MEDIA = (id) => `${media_service}/media/${id}`;
export const API_MEDIA_RECOMMEND = `${media_service}/media/recommend`;
export const API_MEDIA_NOOICE = `${media_service}/media/nooice`;

//search
export const API_SEARCH = `${football_service}/search`;

//area
export const API_AREA = `${system_service}/sys/area`;

//pay
export const API_ORDER_CREATE = `${pay_service}/order/jsapi`;
export const API_ORDER_IS_NEED_BUY = `${pay_service}/order/isUserNeedByMatch`;
export const API_ORDER_QUERY = `${pay_service}/order/query`;
export const API_ORDER_USER = `${pay_service}/order/user`;

export const API_GIFT_LIST = `${pay_service}/gift/list`;
export const API_GIFT_SEND_FREE = `${pay_service}/gift/free/send`;
export const API_GIFT_SEND_FREE_LIMIT = `${pay_service}/gift/free/limit`;
export const API_GIFT_RANK_MATCH = (id) => `${pay_service}/gift/rank/match?matchId=${id}`;
export const API_GIFT_RANK_LEAGUE = (id) => `${pay_service}/gift/rank/league?leagueId=${id}`;

export const API_CHARGE_USER = `${football_service}/charge/user`;


export const API_DEPOSIT = `${pay_service}/deposit`;
export const API_DEPOSIT_LOGS = `${pay_service}/deposit/logs`;

//heat
export const API_MATCH_HEAT = `${football_service}/heat/match`;
export const API_MATCH_TEAM_HEAT = `${football_service}/heat/match/team`;
export const API_MATCH_PLAYER_HEAT = `${football_service}/heat/match/player`;
export const API_MATCH_PLAYER_HEAT_TOTAL = `${football_service}/heat/match/player/total`;
export const API_LEAUGE_HEAT = `${football_service}/heat/league`;
export const API_LEAGUE_PLAYER_HEAT = `${football_service}/heat/league/player`;
export const API_LEAGUE_PLAYER_HEAT_TOTAL = `${football_service}/heat/league/player/total`;
export const API_LEAGUE_TEAM_HEAT = `${football_service}/heat/league/team`;
export const API_LEAGUE_TEAM_HEAT_TOTAL = `${football_service}/heat/league/team/total`;

//bet
export const API_LEAGUE_BET = `${football_service}/bet/league`;
export const API_MATCH_BET = `${football_service}/bet/match`;
export const API_MATCH_USER_BET = `${football_service}/bet`;
export const API_MATCH_USER_BET_CASH = `${football_service}/bet/cash`;
export const API_BET_RANK = `${football_service}/bet/rank`;
export const API_BET_FREE = `${football_service}/bet/free`;

//league member
export const API_LEAGUE_MEMBER = `${football_service}/charge/member/league`;
export const API_USER_LEAGUE_MEMBER = `${football_service}/charge/member/user`;

//subscribe
export const API_SUBSCRIBE = `${system_service}/subscribe`;

//cached
export const cached_service = `${protocol_http}qiezizhibo-1300664818.cos.ap-shanghai.myqcloud.com/cached/football`;

export const API_CACHED_CONTROLLER = `${cached_service}/controller.json`;

export const API_CACHED_HOME_LEAGUES = `${cached_service}/leagues.json`;
export const API_CACHED_LEAGUE = (leagueId) => `${cached_service}/league/${leagueId}.json`;
export const API_CACHED_LEAGUE_LEAGUE = `${cached_service}/series.json`;

export const API_CACHED_MATCHES = (leagueId, round) => `${cached_service}/league/match/${leagueId}/${round}.json`;
export const API_CACHED_MATCH = (id) => `${cached_service}/match/${id}.json`;

export const API_CACHED_LIVE_MANUAL = (id) => `${cached_service}/live/${id}.json`;

export const API_CACHED_LEAGUE_IN_SERIES_LEAGUE = (id) => `${cached_service}/inSeriesLeague/${id}.json`;
export const API_CACHED_MATCHES_FINISH = `${cached_service}/match/finish.json`;
export const API_CACHED_MATCHES_UNFINISH = `${cached_service}/match/live.json`;
