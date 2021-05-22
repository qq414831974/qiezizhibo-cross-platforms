import Taro from '@tarojs/taro'
import {Component} from 'react'
import {AtIcon, AtModal, AtModalContent, AtIndexes} from "taro-ui"
import {View, Text} from '@tarojs/components'
import {connect} from 'react-redux'

import './index.scss'
import ModalLocation from "../../../../components/modal-location";
import {getCityData} from "../../../../utils/utils";

type PageStateProps = {
  areaList: any,
}

type PageDispatchProps = {
  getLocation: (latitude, longitude, callbackFunc: any) => any;
  onClose: any;
  onCancel: any;
}

type PageOwnProps = {
  location: { city: string, province: string },
  show: boolean;
  onProvinceSelect: any;
}

type PageState = {
  searchText: string;
  locationShow: boolean;
  locationLoading: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface LocationSelecter {
  props: IProps;
}

class LocationSelecter extends Component<IProps, PageState> {
  static defaultProps = {
    location: {city: '福州市', province: "福建省"},
    areaList: [],
    show: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      searchText: "",
      locationShow: false,
      locationLoading: false,
    }
  }

  onProvinceSelect = (province) => {
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

  render() {
    const cityData = getCityData(this.props.areaList);
    return (
      <View>
        <AtModal isOpened={this.props.show} onClose={this.props.onClose} onCancel={this.props.onCancel}>
          <AtModalContent>
            <View style='height:60vh'>
              <AtIndexes isShowToast={false}
                         isVibrate={false}
                         list={cityData}
                         topKey=''
                         onClick={this.onProvinceSelect}>
                <View className='qz-user-location__city-content'>
                  <View className='qz-user-location__city-title'>
                    <Text>当前城市：</Text>
                    <Text className='qz-user-location__city-title-href' onClick={this.onReLocationClick}>
                      点此重新定位
                    </Text>
                  </View>
                  <View className='qz-user-location__city'>
                    <AtIcon value='map-pin' size='18' color='#000'/>
                    <Text className='qz-user-location__city-text'>
                      {this.state.locationLoading ? "定位中..." : (this.props.location && this.props.location.province ? this.props.location.province : "未定位")}
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
export default connect(mapStateToProps)(LocationSelecter)
