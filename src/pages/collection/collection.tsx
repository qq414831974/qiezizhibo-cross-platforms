import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtActivityIndicator} from "taro-ui"
import {connect} from '@tarojs/redux'

import './collection.scss'
import {getStorage} from "../../utils/utils";
import MatchList from "./components/match-list";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  collectList: any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Collection {
  props: IProps;
}

class Collection extends Component<PageOwnProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '收藏',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getCollectionList();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }

  getCollectionList = async () => {
    this.setState({loading: true})
    const collectMatch = await getStorage('collectMatch')
    if (collectMatch == null) {
      this.setState({
        collectList: [],
        loading: false
      });
    } else {
      let list: Array<any> = []
      for (let key in collectMatch) {
        if (collectMatch[key]) {
          list.push(collectMatch[key])
        }
      }
      this.setState({
        collectList: list,
        loading: false
      });
    }
  }

  render() {
    const {collectList} = this.state

    if (this.state.loading) {
      return <View className="qz-collection-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }

    return (
      <View className='qz-collection-content'>
        {collectList && collectList.length > 0 ? (
          <MatchList
            matchList={collectList}
            loading={this.state.loading}/>
        ) : null}
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(Collection)
