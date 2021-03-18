import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Button, Image, Swiper, SwiperItem, Navigator, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtNoticebar, AtAvatar, AtIcon, AtCurtain, AtLoadMore} from 'taro-ui'
import NavigationBar from './components/navigation-search-bar'
import qqmapjs from '../../sdk/qqmap-wx-jssdk.min.js';

import './home.scss'
import configAction from "../../actions/config";
import leagueAction from "../../actions/league";
import areaAction from "../../actions/area";
import ModalLocation from "../../components/modal-location";

import hotIcon from "../../assets/home/hot-icon.png";
import defaultLogo from "../../assets/default-logo.png";
import defaultLogoHorizontal from "../../assets/default-logo-horizontal.png";
import MatchItem from "../../components/match-item";
import withLogin from "../../utils/withLogin";
import * as global from '../../constants/global'
import withShare from "../../utils/withShare";
import Request from '../../utils/request'
import * as api from "../../constants/api";
import {getStorage} from "../../utils/utils";

// import {getStorage, hasLogin} from "../../utils/utils";

type Banner = {
  img: string,
  url: string,
  position: number
}
type Bulletin = {
  id: number,
  content: string,
  type: string,
  url: string
}
type PageStateProps = {
  config: any,
  bannerConfig: Array<Banner>,
  bulletinConfig: Array<Bulletin>,
  wechatConfig: any,
  locationConfig: any,
  leagueList: any,
  areaList: any,
  userInfo: any;
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  timerID_bulletin: any,
  locationShow: boolean,
  bulletin: Bulletin | null,
  curtain: Bulletin | null,
  curtainShow: boolean,
  loadingMore: boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Home {
  props: IProps | any;
}

@withLogin("willMount")
@withShare({})
class Home extends Component<PageOwnProps, PageState> {
  static defaultProps = {
    config: {},
    bannerConfig: [],
    wechatConfig: {},
    locationConfig: null,
  }
  bulletinIndex: number = 0;
  qqmapsdk: qqmapjs;
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
    disableScroll: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      timerID_bulletin: null,
      locationShow: false,
      bulletin: null,
      curtain: null,
      curtainShow: false,
      loadingMore: false,
    }
  }

  $loginCallback = () => {
    this.initBulletin();
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.qqmapsdk = new qqmapjs({key: "ROVBZ-JKXH6-BJUS4-MY6WU-QXI7T-QRBPL"});
    this.getAreas();
    configAction.setVisit();
    configAction.getShareSentence();
    if (this.$router.params.id && this.$router.params.page) {
      let url = '/pages/' + this.$router.params.page + '/' + this.$router.params.page + '?id=' + this.$router.params.id;
      Taro.navigateTo({
        url: url,
        fail: () => {
          Taro.switchTab({url: url})
        }
      })
    } else if (this.$router.params.page) {
      let url = '/pages/' + this.$router.params.page + '/' + this.$router.params.page;
      Taro.navigateTo({
        url: url,
        fail: () => {
          Taro.switchTab({url: url})
        }
      })
    }
  }

  componentWillUnmount() {
    this.clearTimer_bulletin();
  }

  componentDidShow() {
    // const getLocation = this.getLocation;
    const initLocation = this.initLocation;
    // const refresh = this.refresh;
    configAction.getLocationConfig().then(() => {
      if (this.props.locationConfig && this.props.locationConfig.province) {
        initLocation();
      } else {
        // Taro.getSetting({
        //   success(res) {
        //     const userLocation = res && res.authSetting ? res.authSetting["scope.userLocation"] : null;
        //     if (userLocation == null || (userLocation != null && userLocation == true)) {
        //       Taro.getLocation({
        //         success: (res) => {
        //           getLocation(res.latitude, res.longitude);
        //         }, fail: () => {
        //           Taro.showToast({title: "获取位置信息失败", icon: "none"});
        //           refresh();
        //         }
        //       })
        //     } else {
        //       initLocation();
        //     }
        //   }
        // })
        configAction.setLocationConfig({city: null, province: '全国'}).then(() => {
          initLocation();
        })
      }
    })
    // if (this.state.curtain != null) {
    //   this.setState({curtainShow: true})
    // }
  }

  componentDidHide() {
  }

  initBulletin = () => {
    configAction.getBulletinConfig({
      province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null,
      sceneType: "home"
    }).then((data) => {
      if (data && data.length > 0) {
        this.setCurtain();
        this.setBulletin(this.bulletinIndex);
        this.startTimer_bulletin();
        Taro.getSystemInfo().then(async (systemData) => {
          if (systemData.platform == 'android') {
            //android
          } else if (systemData.platform == 'ios') {
            const list  = data.map(item=>item.content)
            // } else {
            const weihu = list && list.length > 0 && (list.includes("升级维护中") || list.includes("因政策调整，iOS支付暂不可用"));Z
            if (weihu) {
              const userNo = await getStorage('userNo');
              if ((this.props.userInfo && this.props.userInfo.userNo) || userNo) {
                new Request().get(api.API_USER_ABILITY, {userNo: userNo ? userNo : this.props.userInfo.userNo}).then((ability: any) => {
                  if (ability && ability.enablePay) {
                    configAction.setPayEnabled(true);
                  } else {
                    configAction.setPayEnabled(false);
                  }
                })
              } else {
                configAction.setPayEnabled(false);
              }
            } else {
              configAction.setPayEnabled(true);
            }
          }
        })
      }
    });
  }

  startTimer_bulletin = () => {
    this.clearTimer_bulletin();
    const timerID_bulletin = setInterval(() => {
      this.bulletinIndex = this.bulletinIndex + 1;
      this.setBulletin(this.bulletinIndex);
    }, 20000)
    this.setState({timerID_bulletin: timerID_bulletin})
  }
  clearTimer_bulletin = () => {
    if (this.state.timerID_bulletin) {
      clearInterval(this.state.timerID_bulletin)
      this.setState({timerID_bulletin: null})
    }
  }
  setBulletin = (index) => {
    if (this.props.bulletinConfig) {
      let bulletin: Array<Bulletin> = [];
      for (let key in this.props.bulletinConfig) {
        if (this.props.bulletinConfig[key].curtain != true) {
          bulletin.push(this.props.bulletinConfig[key])
        }
      }
      const num = index % bulletin.length;
      this.setState({bulletin: bulletin[num]})
    }
  }
  setCurtain = () => {
    for (let key in this.props.bulletinConfig) {
      if (this.props.bulletinConfig[key].curtain == true) {
        this.setState({curtain: this.props.bulletinConfig[key], curtainShow: true})
      }
    }
  }
  refresh = () => {
    Taro.showLoading({title: global.LOADING_TEXT})
    this.getBannerConfig().then(() => {
      leagueAction.getLeagueList_clear();
      leagueAction.getLeagueList({
        pageSize: 10,
        pageNum: 1,
        leagueType: 3,
        sortField: "sortIndex",
        sortOrder: "desc",
        country: "中国",
        province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null,
        matchNum: 2,
      }).then(() => {
        Taro.hideLoading();
      }).catch(() => {
        Taro.hideLoading();
        Taro.showToast({title: "获取比赛信息失败", icon: "none"});
      });
    });
  }
  nextPage = () => {
    if (this.state.loadingMore) {
      return;
    }
    this.setState({loadingMore: true})
    leagueAction.getLeagueList_add({
      pageSize: 10,
      pageNum: this.props.leagueList.current + 1,
      leagueType: 3,
      sortField: "sortIndex",
      sortOrder: "desc",
      country: "中国",
      province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null,
      matchNum: 2,
    }).then(() => {
      this.setState({loadingMore: false})
    })
  }

  // 小程序上拉加载
  onReachBottom() {
    this.nextPage();
  }

  getAreas = () => {
    areaAction.getAreas();
  }
  initLocation = async () => {
    configAction.getLocationConfig().then(data => {
      if (data.province) {
        this.setState({locationShow: false})
        this.refresh();
      }
    })
  }
  getLocation = (latitude, longitude, callbackFunc: any = null) => {
    this.qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: (res) => {
        if (res && res.result) {
          const city = res.result.address_component.city;
          const province = res.result.address_component.province;
          configAction.setLocationConfig({city: city, province: province}).then(() => {
            this.initLocation();
            callbackFunc && callbackFunc();
          })
        }
      },
      fail: (reason) => {
        console.log(reason);
        Taro.showToast({title: "获取位置信息失败,请手动选择", icon: "none"});
        callbackFunc && callbackFunc();
      }
    })
  }
  getBannerConfig = () => {
    return configAction.getBannerConfig({
      province: this.props.locationConfig && this.props.locationConfig.province != '全国' ? this.props.locationConfig.province : null,
    });
  }
  onProvinceSelect = (province) => {
    configAction.setLocationConfig({province: province.name}).then(() => {
      this.initLocation();
    })
  }
  onLocationClose = () => {
    this.setState({locationShow: false})
  }

  onLocationCancel = () => {
    this.setState({locationShow: false})
  }

  onLocationSuccess = () => {
    this.setState({locationShow: false})
    Taro.getLocation({
      success: (res) => {
        this.getLocation(res.latitude, res.longitude)
      }, fail: () => {
        Taro.showToast({title: "获取位置信息失败", icon: "none"});
      }
    })
  }
  onLeagueMoreClick = () => {
    Taro.switchTab({url: '../league/league'})
  }
  onLeagueItemClick = (item) => {
    if (item.isParent) {
      Taro.navigateTo({url: `../series/series?id=${item.id}`});
    } else {
      Taro.navigateTo({url: `../leagueManager/leagueManager?id=${item.id}`});
    }
  }
  onMatchItemClick = (item) => {
    // Taro.navigateTo({url: `../bet/bet?id=${5026}`});
    // Taro.navigateTo({url: `../live/live?id=1385`});
    Taro.navigateTo({url: `../live/live?id=${item.id}`});
  }
  onMatchItemBetClick = (item) => {
    Taro.navigateTo({url: `../bet/bet?id=${item.id}`});
  }
  onNoticeBarClick = (bulletin: Bulletin) => {
    if (bulletin.type == 'website') {
      Taro.navigateTo({url: `../webview/webview?url=${encodeURIComponent(bulletin.url)}`});
    } else if (bulletin.type == 'page') {
      Taro.navigateTo({url: bulletin.url});
    }
  }
  onCurtainClose = () => {
    this.setState({curtainShow: false})
  }
  handleCurtainClick = () => {
    const curtain = this.state.curtain;
    if (curtain) {
      if (curtain.type == 'website') {
        Taro.navigateTo({url: `../webview/webview?url=${encodeURIComponent(curtain.url)}`});
      } else if (curtain.type == 'page') {
        Taro.navigateTo({url: curtain.url});
      }
    }
  }

  render() {
    const {leagueList = {}, locationConfig} = this.props
    let loadingmoreStatus: any = "more";
    if (this.state.loadingMore) {
      loadingmoreStatus = "loading";
    } else if (leagueList == null || leagueList.records == null || leagueList.records.length <= 0 || leagueList.total <= leagueList.records.length) {
      loadingmoreStatus = "noMore"
    }
    return (
      <ScrollView scrollY onScrollToLower={this.onReachBottom} className='qz-home-content'>
        <View className='qz-home-top'>
          {this.state.bulletin && this.state.bulletin.content ?
            <View className='qz-home-notice-content' onClick={this.onNoticeBarClick.bind(this, this.state.bulletin)}>
              <AtNoticebar className='qz-home-notice-content-bar' icon='volume-plus' marquee>
                {this.state.bulletin.content}
              </AtNoticebar>
            </View> : null}
          <NavigationBar
            location={locationConfig}
            onProvinceSelect={this.onProvinceSelect}
            getLocation={this.getLocation}/>
        </View>
        <View className='qz-home-bg'>
          <View className='qz-home-content-bg'>
            <Image className='qz-home-content-bg-img' src={defaultLogoHorizontal}/>
          </View>
          <View className='qz-home-content-bg-bottom'/>
        </View>
        <View
          className={`qz-home-banner ${this.state.bulletin && this.state.bulletin.content ? "qz-home-banner__s_n" : "qz-home-banner_s"}`}>
          <Swiper
            className='qz-home-banner__swiper'
            indicatorColor='#999'
            indicatorActiveColor='#333'
            circular
            indicatorDots
            autoplay>
            {this.props.bannerConfig.map((item) => {
              if (item.url === "contactUs") {
                return <SwiperItem key={item.position} className="qz-home-banner__swiper-item">
                  <Button className="qz-home-banner__swiper-item-button" open-type="contact">
                    <Image className="qz-home-banner__swiper-item-img" src={item.img}/>
                  </Button>
                </SwiperItem>
              }
              return <Navigator url={item.url}>
                <SwiperItem key={item.position} className="qz-home-banner__swiper-item">
                  <Image className="qz-home-banner__swiper-item-img" src={item.img}/>
                </SwiperItem>
              </Navigator>
            })}
          </Swiper>
        </View>
        {leagueList.records ?
          <View className='qz-home-league'>
            <View className='qz-home-league-title' onClick={this.onLeagueMoreClick}>
              <Text className='qz-home-league-title-desc'>热门赛事</Text>
              <Text className='qz-home-league-title-more'>{`查看更多赛事>`}</Text>
            </View>
            <View className='qz-home-league-content'>
              <View
                className={`qz-home-league-content__inner ${leagueList.records.length <= 3 ? "qz-home-league-content__inner-center" : ""}`}>
                {leagueList.records.map((item) => {
                  return <View key={item.id} className="qz-home-league-item"
                               onClick={this.onLeagueItemClick.bind(this, item)}>
                    <Image src={hotIcon} className="qz-home-league-item-icon"/>
                    <View className="qz-home-league-item-avatar">
                      <AtAvatar circle
                                size="large"
                                image={item.headImg}/>
                    </View>
                    <Text className="qz-home-league-item-name">
                      {item.shortname ? item.shortname : item.name}
                    </Text>
                  </View>
                })}
              </View>
            </View>
          </View> : null}
        {leagueList.records && leagueList.records.map((item) => {
          if (item.matchs == null || (item.matchs != null && item.matchs.length == 0)) {
            return <View/>;
          }
          return (
            <View key={item.id} className="qz-home-league-detail">
              <View className='qz-home-league-detail-content'>
                <View className='qz-home-league-detail-title' onClick={this.onLeagueItemClick.bind(this, item)}>
                  <AtAvatar size="small" circle image={item.headImg ? item.headImg : defaultLogo}/>
                  <Text className='qz-home-league-detail-title-desc'>
                    {/*{item.shortname ? item.shortname : item.name}*/}
                    {item.name}
                  </Text>
                </View>
                <View className='qz-home-league-detail-content__inner'>
                  {item.matchs && item.matchs.map((match) => (
                    <MatchItem key={match.id} matchInfo={match}
                               onBetClick={this.onMatchItemBetClick.bind(this, match)}
                               onClick={this.onMatchItemClick.bind(this, match)}/>
                  ))}
                </View>
                <View className='qz-home-league-detail-bottom' onClick={this.onLeagueItemClick.bind(this, item)}>
                  <Text className='qz-home-league-detail-bottom-text'>查看更多比赛</Text>
                  <View className='qz-home-league-detail-bottom-arrow'>
                    <AtIcon value="chevron-right" size="18"/>
                  </View>
                </View>
              </View>
            </View>)
        })}
        <AtLoadMore status={loadingmoreStatus} loadingText="加载中..." onClick={this.nextPage}/>
        <ModalLocation
          isOpened={this.state.locationShow}
          handleConfirm={this.onLocationSuccess}
          handleCancel={this.onLocationCancel}
          handleClose={this.onLocationClose}
        />
        <AtCurtain
          isOpened={this.state.curtainShow}
          onClose={this.onCurtainClose}
        >
          <Image
            mode="widthFix"
            src={this.state.curtain ? this.state.curtain.content : ""}
            onClick={this.handleCurtainClick}
          />
        </AtCurtain>
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    config: state.config,
    bannerConfig: state.config ? state.config.bannerConfig : [],
    wechatConfig: state.config ? state.config.wechatConfig : {},
    locationConfig: state.config ? state.config.locationConfig : null,
    bulletinConfig: state.config ? state.config.bulletinConfig : null,
    leagueList: state.league ? state.league.leagueList : {},
    areaList: state.area ? state.area.areas : {},
    shareSentence: state.config ? state.config.shareSentence : [],
    userInfo: state.user.userInfo,
  }
}
export default connect(mapStateToProps)(Home)
