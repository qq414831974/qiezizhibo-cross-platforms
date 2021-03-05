import Taro, {Component, Config} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {AtActivityIndicator} from "taro-ui"
import {connect} from '@tarojs/redux'
import defaultLogo from '../../assets/default-logo.png'

import './series.scss'
import LeagueItem from "../../components/league-item";
import leagueAction from "../../actions/league";
import withShare from "../../utils/withShare";

type PageStateProps = {
  leagueList: any;
  league: any;
  locationConfig: { city: string, province: string }
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  searchText: string;
  loadingmore: boolean;
  loading: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Series {
  props: IProps;
}

@withShare({})
class Series extends Component<PageOwnProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '茄子TV',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
  }
  $setSharePath = () => `/pages/home/home?id=${this.getParamId()}&page=series`

  componentWillMount() {
  }

  componentDidMount() {
    this.getParamId() && this.getLeagueList(this.getParamId());
  }

  componentWillUnmount() {
  }

  componentDidShow() {
    console.log("componentDidShow")
  }

  componentDidHide() {
  }
  getParamId = () =>{
    let id;
    if(this.$router.params){
      if(this.$router.params.id == null){
        id = this.$router.params.scene
      }else{
        id = this.$router.params.id
      }
    }else{
      return null;
    }
    return id;
  }
  onLeagueItemClick = (item) => {
    if (item.isParent) {
      Taro.navigateTo({url: `../series/series?id=${item.id}`});
    } else {
      Taro.navigateTo({url: `../leagueManager/leagueManager?id=${item.id}`});
    }
  }
  getLeagueList = (id) => {
    this.setState({loading: true})
    Promise.all([
      leagueAction.getLeagueSeriesLeagues({pageNum: 1, pageSize: 100, seriesId: id}),
      leagueAction.getLeagueInfo({id: id})
    ]).then(() => {
      this.setState({loading: false})
    });
  }

  render() {
    const {leagueList, league} = this.props

    if (this.state.loading) {
      return <View className="qz-series-loading"><AtActivityIndicator mode="center" content="加载中..."/></View>
    }

    return (
      <View className='qz-series-content'>
        <View className='qz-series-content-header'>
          {league &&
          <View className='qz-series-content-header-container'>
            <Image className="img"
                   src={league.headImg ? league.headImg : defaultLogo}/>
            <View className='text'>{league.shortName ? league.shortName : league.name}</View>
          </View>
          }
        </View>
        {leagueList.records && leagueList.records.length > 0 ? (
          <View className='qz-series__result-content'>
            <View className='qz-series__result-content__inner'>
              {leagueList.records.map((item) => (
                <LeagueItem key={item.id} leagueInfo={item} onClick={this.onLeagueItemClick.bind(this, item)}/>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    leagueList: state.league.seriesLeagues,
    league: state.league.league,
    locationConfig: state.config.locationConfig
  }
}
export default connect(mapStateToProps)(Series)
