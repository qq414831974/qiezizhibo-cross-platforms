import Taro from '@tarojs/taro'
import {formatTime} from "./utils";
// const fundebug = require('fundebug-wxjs');
export const logError = (name, action, info) => {
    let device = '';
    if (!info) {
        info = 'empty'
    }
    try {
        const deviceInfo = Taro.getSystemInfoSync() // 这替换成 taro的
        device = JSON.stringify(deviceInfo)
    } catch (e) {
        console.error('not support getSystemInfoSync api', e.message)
    }
    let time = formatTime(new Date())
    console.error(time, name, action, info, device)
    // 如果使用了 第三方日志自动上报
    // if (typeof action !== 'object') {
    // fundebug.notify(name, action, info)
    // }
    // fundebug.notifyError(info, { name, action, device, time })
    if (typeof info === 'object') {
        info = JSON.stringify(info)
    }
}