import Taro, {getCurrentInstance} from '@tarojs/taro'
import {View} from '@tarojs/components'
import OfficialAccountModal from "../components/official-account";

function withOfficialAccount() {

  return function demoComponent(Component) {
    class WithOfficialAccount extends Component {

      componentDidMount() {
        const router = getCurrentInstance().router;
        const option = Taro.getLaunchOptionsSync();
        let isRedirect = false;
        if (option.scene == 1047 || option.scene == 1124) {
          isRedirect = true;
        }
        if (router && router.params && router.params.page) {
          isRedirect = false;
        }
        if (router && router.params && router.params.scene) {
          const scene = decodeURIComponent(router.params.scene);
          if (scene != null) {
            const paramPage = this.getQueryVariable(scene, "page");
            if (paramPage != null) {
              isRedirect = false;
            }
          }
        }
        if (isRedirect) {
          this.setState({officalAccountOpen: true})
        }
        if (super.componentDidMount) {
          super.componentDidMount();
        }
      }

      getQueryVariable = (query, name) => {
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] == name) {
            return pair[1];
          }
        }
        return false;
      }

      onOfficalAccountClose = () => {
        this.setState({officalAccountOpen: false})
      }

      render() {
        if (!this.state.officalAccountOpen) {
          return super.render();
        }
        return <View>
          {super.render()}
          <OfficialAccountModal
            isOpened={this.state.officalAccountOpen}
            onClose={this.onOfficalAccountClose}
          />
        </View>;
      }
    }

    return WithOfficialAccount as any;
  };
}

export default withOfficialAccount;
