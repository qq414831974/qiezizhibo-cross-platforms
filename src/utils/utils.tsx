import Taro, {ENV_TYPE} from '@tarojs/taro';
import '../sdk/cnchar.2.0.3.min.js';

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}
export const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('/')
}
export const formatMonthDay = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [month, day].map(formatNumber).join('/')
}
export const formatMonthDayTime = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}
export const formatDayTime = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}
export const getTimeDifference = (time) => {
  let diff = '';
  let day = '';
  const time_diff = Date.parse(time) - new Date().getTime(); //时间差的毫秒数
  if (time_diff <= 0) {
    return null;
  }
  //计算出相差天数
  let days = Math.floor(time_diff / (24 * 3600 * 1000));
  if (days > 0) {
    day += days + '天';
  }
  //计算出小时数
  const leave1 = time_diff % (24 * 3600 * 1000);
  const hours = Math.floor(leave1 / (3600 * 1000));
  if (hours > 0) {
    // diff += hours + '小时';
    diff += (hours < 10 ? "0" + hours.toString() : hours) + ':';
  } else {
    if (diff !== '') {
      // diff += hours + '小时';
      diff += (hours < 10 ? "0" + hours.toString() : hours) + ':';
    }
  }
  //计算相差分钟数
  const leave2 = leave1 % (3600 * 1000);
  const minutes = Math.floor(leave2 / (60 * 1000));
  if (minutes > 0) {
    // diff += minutes + '分';
    diff += (minutes < 10 ? "0" + minutes.toString() : minutes) + ':';
  } else {
    if (diff !== '') {
      // diff += minutes + '分';
      diff += (minutes < 10 ? "0" + minutes.toString() : hours) + ':';
    }
  }
  //计算相差秒数
  const leave3 = leave2 % (60 * 1000);
  const seconds = Math.round(leave3 / 1000);
  if (seconds > 0) {
    // diff += seconds + '秒';
    diff += (seconds < 10 ? "0" + seconds.toString() : seconds);

  } else {
    if (diff !== '') {
      // diff += seconds + '秒';
      diff += (seconds < 10 ? "0" + seconds.toString() : seconds);
    }
  }
  return {
    diffDay: day,
    diffTime: diff
  };
}
export const isH5 = () => {
  return Taro.getEnv() === ENV_TYPE.WEB;
}
/**
 * @description 获取当前页url
 */
export const getCurrentPageUrl = () => {
  let pages = Taro.getCurrentPages();
  let currentPage = pages[pages.length - 1];
  return currentPage.route;
};

export const toLogin = () => {
  let path = getCurrentPageUrl();
  if (!path.includes('user')) {
    setTimeout(() => {
      Taro.switchTab({
        url: `/pages/user/user?backView=${path}`,
        success: () => {
          let page = Taro.getCurrentPages().pop();
          if (page == undefined || page == null) {
            return
          }
          page.onLoad();
        }
      });
    }, 1500)
  }
}

export const updateStorage = (data = {}) => {
  if (data['wechatOpenid']) {
    return Promise.all([
      Taro.setStorage({key: 'wechatOpenid', data: data['wechatOpenid'] || null})
    ]);
  }
  if (data['accessToken'] && data['refreshToken']) {
    return Promise.all([Taro.setStorage({key: 'accessToken', data: data['accessToken'] || null}),
      Taro.setStorage({key: 'refreshToken', data: data['refreshToken'] || null}),
    ]);
  }
  return Promise.all([Taro.setStorage({key: 'accessToken', data: data['accessToken'] || null}),
    Taro.setStorage({key: 'refreshToken', data: data['refreshToken'] || null}),
    Taro.setStorage({key: 'wechatOpenid', data: data['wechatOpenid'] || null})
  ]);
};

export const getStorage = (key): any => {
  return Taro.getStorage({key}).then(res => res.data).catch(() => null)
};
export const clearLoginToken = () => {
  return Promise.all([
    Taro.setStorage({key: 'accessToken', data: null}),
    Taro.setStorage({key: 'refreshToken', data: null}),
    Taro.setStorage({key: 'wechatOpenid', data: null}),
  ])
};
export const hasLogin = async () => {
  const token = await getStorage('accessToken');
  return token && token.length > 0
}
export const getCityData = (cityArray: Array<any>): any => {
  let cityData: Array<any> = [];
  let cityMap: any = {};
  for (let i = 0; i < cityArray.length; i++) {
    const province = cityArray[i].province;
    if (province && province.trim() != "") {
      let firstLetter = province.spell("array", "first")[0];
      if (province.startsWith('广')) {
        firstLetter = "G";
      }
      if (cityMap[firstLetter] == null) {
        cityMap[firstLetter] = [];
      }
      cityMap[firstLetter].push({'name': province, 'key': cityArray[i].id});
    }
  }
  let cityMapSorted: any = {};
  let keysSorted = Object.keys(cityMap).sort((a, b) => b < a ? 1 : -1)   //排序健名
  for (let i = 0; i < keysSorted.length; i++) {
    cityMapSorted[keysSorted[i]] = cityMap[keysSorted[i]];
  }
  cityData.push({title: 'All', key: 'All', items: [{name: '全国', key: 'All'}]})
  for (let key in cityMapSorted) {
    cityData.push({title: key, key: key, items: cityMap[key]})
  }
  return cityData
}
