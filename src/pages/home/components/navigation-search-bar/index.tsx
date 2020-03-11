import Taro, {Component} from '@tarojs/taro'
import {AtSearchBar, AtIcon, AtModal, AtModalContent, AtIndexes} from "taro-ui"
import {View, Text} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import './index.scss'
import ModalLocation from "../../../../components/modal-location";
import {getCityData} from "../../../../utils/utils";


type PageStateProps = {
  areaList: any,
}

type PageDispatchProps = {
  onCitySelect: (city, province?) => any;
  getLocation: (latitude, longitude, callbackFunc: any) => any;
}

type PageOwnProps = {
  location: { city: string, province: string },
}

type PageState = {
  searchText: string;
  cityModalOpen: boolean;
  locationShow: boolean;
  locationLoading: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface NavigationBar {
  props: IProps | any;
}

class NavigationBar extends Component<PageOwnProps | PageStateProps, PageState> {
  static defaultProps = {
    location: {city: '福州市', province: "福建省"},
    areaList: [],
  }
  onSearchChange = (value) => {
    this.setState({
      searchText: value
    })
  }
  onCityClick = () => {
    this.setState({
      cityModalOpen: true
    })
  }
  onCityClose = () => {
    this.setState({
      cityModalOpen: false
    })
  }
  onProvinceSelect = (province) => {
    this.setState({
      cityModalOpen: false
    });
    this.props.onProvinceSelect(province);
  }
  onReLocationClick = () => {
    this.setState({locationLoading: true})
    Taro.getLocation({
      success: (res) => {
        this.getLocation(res.latitude, res.longitude)
      }, fail: () => {
        this.setState({locationShow: true})
      }
    })
  }
  onLocationClose = () => {
    this.setState({locationShow: false})
  }

  onLocationCancel = () => {
    this.setState({locationShow: false})
  }

  onLocationSuccess = () => {
    this.setState({locationShow: false, locationLoading: true})
    Taro.getLocation({
      success: (res) => {
        this.getLocation(res.latitude, res.longitude)
      }, fail: () => {
        Taro.showToast({title: "获取位置信息失败", icon: "none"});
      }
    })
  }
  getLocation = (latitude, longitude) => {
    this.props.getLocation(latitude, longitude, () => {
      this.setState({locationLoading: false})
    });
  }
  onSearchClick = () => {
    Taro.navigateTo({url: "../search/search"});
  }

  render() {
    // const {isOpened, handleClose, handleCancel} = this.props;
    const cityData = getCityData(this.props.areaList);
    return (
      <View className="qz-home-navigation-bar at-row">
        <View className='qz-home-navigation-bar__left at-col at-col-1 at-col--auto'>
          <View onClick={this.onCityClick}>
            <Text
              className='qz-home-navigation-bar__left-text'>{this.props.location && this.props.location.province ? this.props.location.province : "未定位"}</Text>
            <AtIcon value='chevron-down' size='14' color='#ffffff'/>
          </View>
        </View>
        <View className='qz-home-navigation-bar__right at-col' onClick={this.onSearchClick}>
          <AtSearchBar
            value={this.state.searchText}
            onChange={this.onSearchChange}
            disabled
            className='qz-home-navigation-bar__right-search-bar'
          />
        </View>
        <AtModal isOpened={this.state.cityModalOpen} onClose={this.onCityClose} onCancel={this.onCityClose}>
          <AtModalContent>
            <View style='height:60vh'>
              <AtIndexes isShowToast={false}
                         isVibrate={false}
                         list={cityData}
                         topKey=''
                         onClick={this.onProvinceSelect}>
                <View className='qz-home-navigation-bar__city-content'>
                  <View className='qz-home-navigation-bar__city-title'>
                    <Text>当前城市：</Text>
                    <Text className='qz-home-navigation-bar__city-title-href' onClick={this.onReLocationClick}>
                      点此重新定位
                    </Text>
                  </View>
                  <View className='qz-home-navigation-bar__city'>
                    <AtIcon value='map-pin' size='18' color='#000'/>
                    <Text className='qz-home-navigation-bar__city-text'>
                      {this.state.locationLoading ? "定位中..." : (this.props.location ? this.props.location.province : "未定位")}
                    </Text>
                  </View>
                </View>
              </AtIndexes>
            </View>
          </AtModalContent>
        </AtModal>
        <ModalLocation
          isOpened={this.state.locationShow}
          handleConfirm={this.onLocationSuccess}
          handleCancel={this.onLocationCancel}
          handleClose={this.onLocationClose}/>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    areaList: state.area ? state.area.areas : {},
  }
}
export default connect(mapStateToProps)(NavigationBar)
