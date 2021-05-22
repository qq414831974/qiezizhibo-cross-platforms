import {Component} from 'react'
import {View} from '@tarojs/components'
import {AtLoadMore} from "taro-ui"
import {connect} from 'react-redux'

import './collection.scss'
import {getStorage} from "../../utils/utils";
import MatchList from "./components/match-list";
import NavBar from "../../components/nav-bar";

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean;
  collectList: any;
  total: number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Collection {
  props: IProps;
}

class Collection extends Component<IProps, PageState> {
  navRef: any = null;

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      collectList: null,
      total: 0,
    }
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
        loading: false,
        total: list.length
      });
    }
  }

  render() {
    const {collectList, total, loading} = this.state

    let loadingmoreStatus: any = "more";
    if (loading) {
      loadingmoreStatus = "loading";
    } else if (collectList == null || collectList.length <= 0 || total <= collectList.length) {
      loadingmoreStatus = "noMore"
    }

    return (
      <View className='qz-collection-content'>
        <NavBar
          title='我的收藏'
          back
          ref={ref => {
            this.navRef = ref;
          }}
        />
        {collectList && collectList.length > 0 ? (
          <MatchList
            matchList={collectList}
            loading={this.state.loading}/>
        ) : null}
        <AtLoadMore status={loadingmoreStatus} loadingText="加载中..." noMoreText="没有更多了"/>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}
export default connect(mapStateToProps)(Collection)
