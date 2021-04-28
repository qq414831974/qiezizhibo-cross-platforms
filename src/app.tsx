// import '@tarojs/async-await'
import Taro, {Component, Config} from '@tarojs/taro'
import {Provider} from '@tarojs/redux'
// import fundebug from 'fundebug-wxjs';

import 'taro-ui/dist/style/index.scss'
import './app.scss'

import Home from './pages/home/home'

import configStore from './store/index'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

// fundebug.init({
//   apikey : 'e5371aa26208fc76913d31ac73369db89ce7e1fbc1d43306bb82444e629f0277'
// });

const store = configStore

class App extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/home/home',
      'pages/match/match',
      'pages/league/league',
      'pages/user/user',
      'pages/search/search',
      'pages/live/live',
      'pages/series/series',
      'pages/leagueManager/leagueManager',
      'pages/collection/collection',
      'pages/orders/orders',
      'pages/webview/webview',
      'pages/bet/bet',
      'pages/address/address',
      'pages/betOrders/betOrders',
      'pages/deposit/deposit',
      'pages/media/media',
      'pages/feedback/feedback',
      'pages/feedbackDetail/feedbackDetail',
      'pages/feedbackSuccess/feedbackSuccess',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '茄子TV',
      navigationBarTextStyle: 'black'
    },
    tabBar: {
      color: "#666",
      selectedColor: "#2d8cf0",
      backgroundColor: "#fafafa",
      borderStyle: 'white',
      list: [{
        pagePath: "pages/home/home",
        iconPath: "./assets/tab-bar/home.png",
        selectedIconPath: "./assets/tab-bar/home-on.png",
        text: "首页"
      }, {
        pagePath: "pages/match/match",
        iconPath: "./assets/tab-bar/football.png",
        selectedIconPath: "./assets/tab-bar/football-on.png",
        text: "比赛"
      }, {
        pagePath: "pages/league/league",
        iconPath: "./assets/tab-bar/cup.png",
        selectedIconPath: "./assets/tab-bar/cup-on.png",
        text: "赛事"
      }, {
        pagePath: "pages/user/user",
        iconPath: "./assets/tab-bar/me.png",
        selectedIconPath: "./assets/tab-bar/me-on.png",
        text: "我的"
      }]
    },
    permission: {
      "scope.userLocation": {
        "desc": "茄子TV将获得您的位置信息以获取最佳体验"
      }
    }
  }

  componentDidMount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  componentDidCatchError() {
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Home/>
      </Provider>
    )
  }
}

Taro.render(<App/>, document.getElementById('app'))
