export const protocol_http = "https://";
export const protocol_ws = "wss://";
export const gateway_client_service  = "git.qiezizhibo.com";
export const gateway_admin_service = `${protocol_http}${gateway_client_service}/gateway-admin`
export const auth_service = `${protocol_http}${gateway_client_service}/service-auth`
export const user_service = `${protocol_http}${gateway_client_service}/service-user`
export const system_service = `${protocol_http}${gateway_client_service}/service-system`
export const football_service = `${protocol_http}${gateway_client_service}/service-football`
export const media_service = `${protocol_http}${gateway_client_service}/service-media`
export const chat_service = `${protocol_http}${gateway_client_service}/service-chat`
export const live_service = `${protocol_http}${gateway_client_service}/service-live`
export const websocket_service = `${protocol_ws}${gateway_client_service}/service-websocket`
// export const host = "http://192.168.3.102:8080";

//websocket
export const websocket = (id) => `${websocket_service}/websocket/${id}`;

//config
export const API_CONFIG_BANNER = `${system_service}/system/config/banner`;
export const API_CONFIG_BULLETIN = `${system_service}/system/config/bulletin`;
export const API_SYSTEM_SECURITY_CHECK = `${system_service}/system/wxa_security_check`;
export const API_VISIT = `${user_service}/user/visit`;

//user
export const API_LOGIN = `${auth_service}/auth/wechat`;
export const API_PHONENUMBER = `${auth_service}/auth/getPhoneNumber`;
export const API_AUTH_USER = `${auth_service}/auth/user`;
export const API_USER = `${user_service}/user`;
export const API_REFRESH_TOKEN = `${auth_service}/auth/refresh_token`;

//league
export const API_LEAGUE = (id) => `${football_service}/league/${id}`;
export const API_LEAGUES = `${football_service}/league`;
export const API_LEAGUE_SERIES = `${football_service}/league`;
export const API_LEAGUE_PLAYER = `${football_service}/league/rank/player`;
export const API_LEAGUE_TEAM = `${football_service}/league/rank/team`;
export const API_LEAGUE_SERIES_LEAGUE = `${football_service}/league`;
export const API_LEAGUE_REPORT = (id) => `${football_service}/league/${id}/report`;

//match
export const API_MATCH = (id) => `${football_service}/match/${id}`;
export const API_MATCHES = `${football_service}/match`;
export const API_MATCH_STATUS = `${football_service}/timeline/status`;
export const API_MATCH_RECOMMEND = `${football_service}/recommend/matchs`;
export const API_MATCH_NOOICE = `${football_service}/nooice`;
export const API_MATCH_COMMENT = `${chat_service}/comment`;
export const API_MATCH_COMMENT_COUNT = `${chat_service}/comment/count`;
export const API_MATCH_COMMENT_DANMU = `${chat_service}/comment/danmu`;

//team
export const API_TEAM = (id) => `${football_service}/team/${id}`;
export const API_TEAMS = `${football_service}/teams`;

//player
export const API_PLAYER = (id) => `${football_service}/player/${id}`;
export const API_PLAYERS = `${football_service}/player`;
export const API_PLAYER_BEST = `${football_service}/player/best`;
export const API_PLAYER_MEDIA = `${football_service}/media/player`;

//live
export const API_ACTIVITY_MEDIA_LIST = (id) => `${live_service}/activity/${id}/mediaList`;
export const API_ACTIVITY_PING = (id) => `${live_service}/activity/${id}/ping`;

//media
export const API_MEDIA = `${media_service}/media`;
export const API_MEDIA_RECOMMEND = `${media_service}/media/recommend`;
export const API_MEDIA_NOOICE = `${media_service}/media/nooice`;

//search
export const API_SEARCH = `${football_service}/search`;

//area
export const API_AREA = `${system_service}/system/config/area`;
