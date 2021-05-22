import Taro from '@tarojs/taro'
import {getStorage, hasLogin, isH5} from "./utils";
import userAction from "../actions/user";
import * as global from "../constants/global";

const LIFE_CYCLE_MAP = ['willMount', 'didMount', 'didShow'];

/**
 *
 * 登录鉴权
 *
 * @param {string} [lifecycle] 需要等待的鉴权完再执行的生命周期 willMount didMount didShow
 * @returns 包装后的Component
 * 注意：使用的组件内必须有对应定义的生命周期，而且不能使用箭头函数式，
 * 例如 componentWillMount(){} 不能写成 componentWillMount = () => {} ，会劫持失败
 * 示例：
 @withLogin('didShow')
 class Index extends Component {
  componentWillMount(){
    console.log('Index willMount')
    // 需要带accessToken调用的接口等
  }

  componentDidMount(){
    console.log('Index didMount')
  }
  render() {
    console.log('Index render');
    return <View />;
  }
}
 */
function withLogin(lifecycle = 'didMount') {
  // 异常规避提醒
  if (LIFE_CYCLE_MAP.indexOf(lifecycle) < 0) {
    console.warn(
      `传入的生命周期不存在, 鉴权判断异常 ===========> $_{lifecycle}`
    );
    return Component => Component;
  }

  return function withLoginComponent(Component) {
    // 避免H5兼容异常
    if (isH5()) {
      return Component;
    }

    // 这里还可以通过redux来获取本地用户信息，在用户一次登录之后，其他需要鉴权的页面可以用判断跳过流程
    // @connect(({ user }) => ({
    //   userInfo: user.userInfo,
    // }))
    return class WithLogin extends Component {
      constructor(props) {
        super(props);
      }

      async componentWillMount() {
        if (super.componentWillMount) {
          if (lifecycle === LIFE_CYCLE_MAP[0]) {
            this.$_autoLogin().then(()=>{
              if (this.$loginCallback && typeof this.$loginCallback === 'function') {
                this.$loginCallback();
              }
            });
          }

          super.componentWillMount();
        }
      }

      async componentDidMount() {
        if (super.componentDidMount) {
          if (lifecycle === LIFE_CYCLE_MAP[1]) {
            this.$_autoLogin().then(()=>{
              if (this.$loginCallback && typeof this.$loginCallback === 'function') {
                this.$loginCallback();
              }
            });
          }

          super.componentDidMount();
        }
      }

      async componentDidShow() {
        if (super.componentDidShow) {
          if (lifecycle === LIFE_CYCLE_MAP[2]) {
            this.$_autoLogin().then(()=>{
              if (this.$loginCallback && typeof this.$loginCallback === 'function') {
                this.$loginCallback();
              }
            });
          }

          super.componentDidShow();
        }
      }

      $_autoLogin = () => {
        // ...这里是登录逻辑
        // return true;
        return new Promise(async (resolve, __reject) => {
          Taro.showLoading({title: global.LOADING_TEXT})
          if (await hasLogin()) {
            const openid = await getStorage('wechatOpenid');
            userAction.getUserInfo({openId: openid}, {
              success: () => {
                Taro.hideLoading()
                resolve(null)
              }, failed: () => {
                Taro.hideLoading()
                resolve(null)
              }
            });
          } else {
            resolve(null)
            Taro.hideLoading()
          }
        })
      }
    }
  }
}

export default withLogin;
