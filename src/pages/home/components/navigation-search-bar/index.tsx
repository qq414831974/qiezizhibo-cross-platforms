import Taro, {Component} from '@tarojs/taro'
import {AtSearchBar} from "taro-ui"
import {View} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import './index.scss'


type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {
}

type PageState = {
  searchText: string;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface NavigationBar {
  props: IProps | any;
}

class NavigationBar extends Component<PageOwnProps | PageStateProps, PageState> {
  static defaultProps = {
  }
  onSearchChange = (value) => {
    this.setState({
      searchText: value
    })
  }
  onSearchClick = () => {
    Taro.navigateTo({url: "../search/search"});
  }

  render() {
    // const {isOpened, handleClose, handleCancel} = this.props;
    return (
      <View className="qz-home-navigation-bar">
        <View className='qz-home-navigation-bar__right' onClick={this.onSearchClick}>
          <AtSearchBar
            value={this.state.searchText}
            onChange={this.onSearchChange}
            disabled
            className='qz-home-navigation-bar__right-search-bar'
          />
        </View>
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
