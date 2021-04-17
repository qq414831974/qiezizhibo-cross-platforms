import Taro from '@tarojs/taro';

const defalutPath = 'pages/home/home';
const defalutTitle = '茄子TV';

/*
@withShare({
    title: '可设置分享标题',
    imageUrl: '可设置分享图片路径',
    path: '可设置分享路径'
})
class Index extends Component {

  // $setSharePath = () => '可设置分享路径(优先级最高)'

  // $setShareTitle = () => '可设置分享标题(优先级最高)'

  // $setShareImageUrl = () => '可设置分享图片路径(优先级最高)'

  // $setOnShareCallback = () => '可设置分享图片路径(优先级最高)'

  render() {
     return <View />
  }
}
 */
type optsType = {
  title?: string,
  imageUrl?: any,
  path?: any
}

function withShare(opts: optsType) {

  return function demoComponent(Component) {

    class WithShare extends Component {
      componentWillMount() {
        Taro.showShareMenu({
          menus: ['shareAppMessage', 'shareTimeline'],
          withShareTicket: true
        });

        if (super.componentWillMount) {
          super.componentWillMount();
        }
      }

      // 点击分享的那一刻会进行调用
      onShareAppMessage() {

        let {title = defalutTitle, imageUrl = null, path = defalutPath} = opts;

        // 从继承的组件获取配置
        if (this.$setSharePath && typeof this.$setSharePath === 'function') {
          path = this.$setSharePath();
        }

        // 从继承的组件获取配置
        if (this.$setShareTitle && typeof this.$setShareTitle === 'function') {
          title = this.$setShareTitle();
        }

        // 从继承的组件获取配置
        if (
          this.$setShareImageUrl &&
          typeof this.$setShareImageUrl === 'function'
        ) {
          imageUrl = this.$setShareImageUrl();
        }

        if (!path) {
          path = defalutPath;
        }

        // 每条分享都补充用户的分享id
        // 如果path不带参数，分享出去后解析的params里面会带一个{''： ''}
        // const sharePath = `${path}&shareFromUser=${userInfo.shareId}`;

        // 从继承的组件获取配置
        if (this.$setOnShareCallback && typeof this.$setOnShareCallback === 'function') {
          const callback = this.$setOnShareCallback;
          setTimeout(() => {
            callback();
          }, 5000)
        }

        return {
          title: title || defalutTitle,
          path: path,
          imageUrl: imageUrl,

        };
      }

      onShareTimeline() {

        let {title = defalutTitle, imageUrl = null, path = defalutPath} = opts;

        // 从继承的组件获取配置
        if (this.$setSharePath && typeof this.$setSharePath === 'function') {
          path = this.$setSharePath();
        }

        // 从继承的组件获取配置
        if (this.$setShareTitle && typeof this.$setShareTitle === 'function') {
          title = this.$setShareTitle();
        }

        // 从继承的组件获取配置
        if (
          this.$setShareImageUrl &&
          typeof this.$setShareImageUrl === 'function'
        ) {
          imageUrl = this.$setShareImageUrl();
        }

        if (!path) {
          path = defalutPath;
        }

        // 每条分享都补充用户的分享id
        // 如果path不带参数，分享出去后解析的params里面会带一个{''： ''}
        // const sharePath = `${path}&shareFromUser=${userInfo.shareId}`;

        // 从继承的组件获取配置
        if (this.$setOnShareCallback && typeof this.$setOnShareCallback === 'function') {
          const callback = this.$setOnShareCallback;
          setTimeout(() => {
            callback();
          }, 5000)
        }

        path = path.indexOf("?") > 0 ? path.split("?")[1] : null;
        return {
          title: title || defalutTitle,
          query: path,
          imageUrl: imageUrl,
        };
      }

      render() {
        return super.render();
      }
    }

    return WithShare as any;
  };
}

export default withShare;
