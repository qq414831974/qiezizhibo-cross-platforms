import Taro from '@tarojs/taro'
import {API_LOGIN, API_REFRESH_TOKEN} from '../constants/api'
import {toLogin, getStorage, updateStorage} from "./utils";


const CODE_SUCCESS = 200;
const CODE_AUTH_EXPIRED = 401;
const CODE_AUTH_FORBIDDEN = 403;
let refreshing = false;
let refreshingInterval = {};
/**
 * 简易封装网络请求
 * // NOTE 需要注意 RN 不支持 *StorageSync，此处用 async/await 解决
 * @param {*} options
 */
const interceptor = function (chain) {
  const requestParams = chain.requestParams;
  const {method, data} = requestParams;


  if (method === 'GET') {
    if (data) {
      for (let dataKey in data) {
        const params = data[dataKey];
        if (Array.isArray(params)) {
          if (params.length > 0) {
            data[dataKey] = params.join()
          } else {
            delete data[dataKey];
          }
        }
      }
      requestParams.data = data;
    }
  }
  return chain.proceed(requestParams)
    .then(res => {
      return res
    })
};
Taro.addInterceptor(interceptor);
const updateRefreshing = (data = false) => {
  refreshing = data;
  // return Promise.all([
  //   Taro.setStorage({key: 'isRefreshing', data: data})
  // ]);
};

const isRefreshing = (): any => {
  // return Taro.getStorage({key: 'isRefreshing'}).then(res => res.data).catch(() => false)
  return refreshing
};

export default class Request {
  get(url: string, payload: any, showLoading?: boolean, autoLogin?: boolean) {
    return request({url, payload, showLoading, autoLogin})
  }

  post(url: string, payload: any, showLoading?: boolean, autoLogin?: boolean) {
    return request({url, payload, method: 'POST', showLoading, autoLogin})
  }

  put(url: string, payload: any, showLoading?: boolean, autoLogin?: boolean) {
    return request({url, payload, method: 'PUT', showLoading, autoLogin})
  }

  delete(url: string, payload: any, showLoading?: boolean, autoLogin?: boolean) {
    return request({url, payload, method: 'DELETE', showLoading, autoLogin})
  }
}

const refreshAuth = async (refreshToken) => {
  return new Request().post(`${API_REFRESH_TOKEN}?client_id=wechat&refresh_token=${refreshToken}`, {}, true, false)
    .then((res: any) => {
      updateStorage(res);
      return res;
    }).catch(async (error) => {
      console.log(error)
      await updateStorage({})
    });
}
const request = async (options) => {
  const {url, payload, method = 'GET', showToast = true, autoLogin = true, showLoading = true} = options;
  const token = await getStorage('accessToken');
  const refreshToken = await getStorage('refreshToken');
  const header = (token && !url.includes(`${API_REFRESH_TOKEN}`)) ? {'Authorization': `Bearer ${token}`} : {};
  if (method == 'POST' || method == 'PUT') {
    header['content-type'] = 'application/json'
  }
  showLoading && Taro.showNavigationBarLoading();
  for (let payloadKey in payload) {
    if (payload[payloadKey] == null) {
      delete payload[payloadKey];
    }
  }
  return new Promise((resolve, reject) => {
    Taro.request({
        url,
        method,
        data: payload,
        header,
        complete: async (res: any) => {
          const {data, statusCode} = res;
          const {code} = data;
          if (statusCode != CODE_SUCCESS || (data.data && code != CODE_SUCCESS)) {
            //token过期
            if ((statusCode == CODE_AUTH_EXPIRED || (data.data && code == CODE_AUTH_EXPIRED)) && autoLogin && refreshToken) {
              if (!isRefreshing()) {
                updateRefreshing(true);
                //刷新token
                refreshAuth(refreshToken).then(async () => {
                  updateRefreshing(false);
                  delete options.autoLogin;
                  //重新请求
                  request(options).then((reRequest: any) => {
                    resolve(reRequest)
                  })
                }).catch(async (error) => {
                  await updateStorage({})
                  reject(error)
                  updateRefreshing(false);
                });
              } else {
                const refreshingIntervalKey = options.url + "/" + options.method;
                refreshingInterval[refreshingIntervalKey] = setInterval(() => {
                  if (!isRefreshing()) {
                    clearInterval(refreshingInterval[refreshingIntervalKey])
                    delete options.autoLogin;
                    //重新请求
                    request(options).then((reRequest: any) => {
                      resolve(reRequest)
                    })
                  }
                }, 100)
              }
            } else {
              //请求异常或无token
              let title;
              let defaultMsg = (statusCode == CODE_AUTH_EXPIRED || statusCode == CODE_AUTH_FORBIDDEN) ? '登录失效' : '请求异常';
              title = res && res.data && res.data.message || defaultMsg;
              if (url.includes("refresh_token")) {
                title = "登录失效，请重新登录"
              }
              if (showToast) {
                Taro.showToast({
                  title: title,
                  icon: 'none',
                  complete: () => {
                    if (statusCode == CODE_AUTH_EXPIRED || statusCode == CODE_AUTH_FORBIDDEN || url.includes("refresh_token")) {
                      toLogin();
                    }
                  }
                })
              }
              showLoading && Taro.hideNavigationBarLoading();
              reject(res)
            }
          } else {
            //正常请求
            if (url.includes(API_LOGIN)) {
              console.log(data.data)
              await updateStorage(data.data)
            }
            showLoading && Taro.hideNavigationBarLoading();
            resolve(data.data != null ? data.data : data)
          }
        }
      }
    )
  })
};
