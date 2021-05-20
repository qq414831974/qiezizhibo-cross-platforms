import Taro, {ENV_TYPE} from '@tarojs/taro';

export const isInteger = (num) => {
  return typeof num == "number" && num % 1 == 0;
}
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
export const formatTimeSecond = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
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
export const getTimeDifference = (time, isChinese?) => {
  let diff = '';
  let diff_hour_minute_sencod = '';
  let day = '';
  let time_diff;
  time_diff = Date.parse(time) - new Date().getTime(); //时间差的毫秒数

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
  const dayHours = Math.floor(leave1 / (3600 * 1000)) + (days > 0 ? days * 24 : 0);
  if (hours > 0) {
    // diff += hours + '小时';
    diff += (hours < 10 ? "0" + hours.toString() : hours) + (isChinese ? '时' : ':');
  } else {
    if (diff !== '') {
      // diff += hours + '小时';
      diff += (hours < 10 ? "0" + hours.toString() : hours) + (isChinese ? '时' : ':');
    }
  }
  if (dayHours > 0) {
    // diff += hours + '小时';
    diff_hour_minute_sencod += (dayHours < 10 ? "0" + dayHours.toString() : dayHours) + (isChinese ? '时' : ':');
  } else {
    if (diff !== '') {
      // diff += hours + '小时';
      diff_hour_minute_sencod += (dayHours < 10 ? "0" + dayHours.toString() : dayHours) + (isChinese ? '时' : ':');
    }
  }
  //计算相差分钟数
  const leave2 = leave1 % (3600 * 1000);
  const minutes = Math.floor(leave2 / (60 * 1000));
  if (minutes > 0) {
    // diff += minutes + '分';
    diff += (minutes < 10 ? "0" + minutes.toString() : minutes) + (isChinese ? '分' : ':');
    diff_hour_minute_sencod += (minutes < 10 ? "0" + minutes.toString() : minutes) + (isChinese ? '分' : ':');
  } else {
    if (diff !== '') {
      // diff += minutes + '分';
      diff += (minutes < 10 ? "0" + minutes.toString() : hours) + (isChinese ? '分' : ':');
      diff_hour_minute_sencod += (minutes < 10 ? "0" + minutes.toString() : hours) + (isChinese ? '分' : ':');
    }
  }
  //计算相差秒数
  const leave3 = leave2 % (60 * 1000);
  const seconds = Math.round(leave3 / 1000);
  if (seconds > 0) {
    // diff += seconds + '秒';
    diff += (seconds < 10 ? "0" + seconds.toString() : seconds) + (isChinese ? '秒' : '');
    diff_hour_minute_sencod += (seconds < 10 ? "0" + seconds.toString() : seconds) + (isChinese ? '秒' : '');
  } else {
    if (diff !== '') {
      // diff += seconds + '秒';
      diff += (seconds < 10 ? "0" + seconds.toString() : seconds) + (isChinese ? '秒' : '');
      diff_hour_minute_sencod += (seconds < 10 ? "0" + seconds.toString() : seconds) + (isChinese ? '秒' : '');
    }
  }
  return {
    diffDay: day,
    diffTime: diff,
    diffDayTime: diff_hour_minute_sencod,
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
  if (data['accessToken'] && data['refreshToken']) {
    return Promise.all([Taro.setStorage({key: 'accessToken', data: data['accessToken'] || null}),
      Taro.setStorage({key: 'refreshToken', data: data['refreshToken'] || null}),
    ]);
  }
  if (data['wechatOpenid']) {
    return Promise.all([
      Taro.setStorage({key: 'wechatOpenid', data: data['wechatOpenid'] || null})
    ]);
  }
  if (data['userNo']) {
    return Promise.all([
      Taro.setStorage({key: 'userNo', data: data['userNo'] || null})
    ]);
  }
  return Promise.all([Taro.setStorage({key: 'accessToken', data: data['accessToken'] || null}),
    Taro.setStorage({key: 'refreshToken', data: data['refreshToken'] || null}),
    Taro.setStorage({key: 'wechatOpenid', data: data['wechatOpenid'] || null}),
    Taro.setStorage({key: 'userNo', data: data['userNo'] || null})
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
    Taro.setStorage({key: 'userNo', data: null}),
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
    const provinceKey = cityArray[i].provinceKey;
    if (province && province.trim() != "") {
      if (cityMap[provinceKey] == null) {
        cityMap[provinceKey] = [];
      }
      cityMap[provinceKey].push({'name': province, 'key': cityArray[i].id});
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

export const getYuan = (fen: number): any => {
  if (fen == null) {
    return 0;
  }
  let yuan = (fen / 100).toFixed(2);
  return Number(yuan);
}
export const getJiao = (fen: number): any => {
  let jiao = (fen / 10).toFixed(2);
  return Number(jiao);
}

export const random = (lower, upper) => {
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}
/**
 * js数组实现权重概率分配，支持数字比模式(支持2位小数)和百分比模式(不支持小数，最后一个元素多退少补)
 * @param  Array  arr  js数组，参数类型[Object,Object,Object……]
 * @return  Array      返回一个随机元素，概率为其weight/所有weight之和，参数类型Object
 */
export const random_weight = (arr: Array<any>) => {
  //参数arr元素必须含有weight属性，参考如下所示
  //var arr=[{name:'1',weight:1.5},{name:'2',weight:2.5},{name:'3',weight:3.5}];
  //var arr=[{name:'1',weight:'15%'},{name:'2',weight:'25%'},{name:'3',weight:'35%'}];
  //求出最大公约数以计算缩小倍数，perMode为百分比模式
  if (arr == null || arr.length == 0) {
    return null;
  }
  let per;
  let maxNum = 0;
  let perMode = false;
  //自定义Math求最小公约数方法
  let gcd = function (a, b) {
    let min = Math.min(a, b);
    let max = Math.max(a, b);
    let result = 1;
    if (a === 0 || b === 0) {
      return max;
    }
    for (let i = min; i >= 1; i--) {
      if (min % i === 0 && max % i === 0) {
        result = i;
        break;
      }
    }
    return result;
  };

  //使用clone元素对象拷贝仍然会造成浪费，但是使用权重数组对应关系更省内存
  let weight_arr: Array<any> = [];
  for (let i = 0; i < arr.length; i++) {
    if ('undefined' != typeof (arr[i].weight)) {
      if (arr[i].weight.toString().indexOf('%') !== -1) {
        per = Math.floor(arr[i].weight.toString().replace('%', ''));
        perMode = true;
      } else {
        per = Math.floor(arr[i].weight * 100);
      }
    } else {
      per = 0;
    }
    weight_arr[i] = per;
    maxNum = gcd(maxNum, per);
  }
  //数字比模式，3:5:7，其组成[0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2]
  //百分比模式，元素所占百分比为15%，25%，35%
  let index: Array<any> = [];
  let total = 0;
  let len = 0;
  if (perMode) {
    for (let i = 0; i < arr.length; i++) {
      //len表示存储arr下标的数据块长度，已优化至最小整数形式减小索引数组的长度
      len = weight_arr[i];
      for (let j = 0; j < len; j++) {
        //超过100%跳出，后面的舍弃
        if (total >= 100) {
          break;
        }
        index.push(i);
        total++;
      }
    }
    //使用最后一个元素补齐100%
    while (total < 100) {
      index.push(arr.length - 1);
      total++;
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      //len表示存储arr下标的数据块长度，已优化至最小整数形式减小索引数组的长度
      len = weight_arr[i] / maxNum;
      for (let j = 0; j < len; j++) {
        index.push(i);
      }
      total += len;
    }
  }
  //随机数值，其值为0-11的整数，数据块根据权重分块
  let rand = Math.floor(Math.random() * total);
  // console.log(index);
  // console.log(rand);
  return arr[index[rand]];
}
export const getExpInfoByExpValue = (expInfoList, expValue) => {
  for (let expInfo of expInfoList) {
    if (expValue >= expInfo.minExp && expValue < expInfo.maxExp) {
      return expInfo;
    }
  }
  return expInfoList[0];
}
export const isFunction = (value) => {
  return typeof value === 'function';
}
