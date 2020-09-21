import Taro, {Component} from '@tarojs/taro'
// import {connect} from '@tarojs/redux'
import {View, ScrollView, Text, Image} from '@tarojs/components'
import {AtInput, AtButton, AtActivityIndicator} from 'taro-ui'
import './index.scss'
import noperson from '../../../../assets/no-person.png';

// import matchAction from "../../../../actions/match";

type PageStateProps = {
  comments: [];
}

type PageDispatchProps = {
  nextPage: any;
}

type PageOwnProps = {
  matchInfo: any;
  userInfo: any;
  loading: boolean;
  intoView?: string;
  sendMessage: any;
  isIphoneX: boolean;
}

type PageState = {
  textInput: string;
  scrolling: boolean;
  messageSending: boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ChattingRoom {
  props: IProps | any;
}

class ChattingRoom extends Component<PageOwnProps | any, PageState> {
  static defaultProps = {}

  handleChatInputChange = (value) => {
    this.setState({
      textInput: value
    })
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value
  }
  handleSendMessage = () => {
    if (this.state.textInput == null || this.state.textInput.trim() == '') {
      return;
    }
    this.setState({messageSending: true})
    this.props.sendMessage(this.state.textInput).then(() => {
      this.setState({
        textInput: '',
        messageSending: false
      })
    })
  }
  onChatScroll = () => {
    if (this.state.scrolling) {
      return;
    }
    this.setState({scrolling: true})
    this.props.nextPage().then(() => {
      this.setState({scrolling: false})
    });
  }
  getCommentsList = (comments) => {
    return comments.sort((item1, item2) => {
      const date1 = new Date(item1.date).getTime();
      const date2 = new Date(item2.date).getTime();
      return date1 > date2 ? 1 : (date1 == date2 ? 0 : -1)
    });
  }

  render() {
    const {comments = [], loading = false, intoView = ''} = this.props
    return (
      <View className={`qz-chatting-room ${this.props.isIphoneX ? "qz-chatting-room-iphoneX" : ""}`}>
        <ScrollView scrollY={loading ? false : true} className="qz-chatting-room__chat-content"
                    scrollIntoView={intoView}
                    upper-threshold={20}
                    onScrollToUpper={this.onChatScroll}>
          {loading && <View className="qz-chatting-room__loading">
            <AtActivityIndicator mode="center" content="加载中..."/>
          </View>}
          <View className="qz-chatting-room__chat-content__container">
            <View className="qz-chatting-room__chat-item-hint">
              直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约直播公约
            </View>
            {this.getCommentsList(comments).map((item: any) => (
              item.user && item.user.userNo === this.props.userInfo.userNo ?
                <View key={`message-${item.id}`}
                      id={`message-${item.id}`}
                      className="qz-chatting-room__chat-item qz-chatting-room__chat-item-right">
                  <View className="qz-chatting-room__chat-text-container">
                    <View className="qz-chatting-room__chat-text__text">
                      {/*<Text>{`message-${index}`}</Text>*/}
                      <Text>{item.content}</Text>
                    </View>
                  </View>
                  <View className="qz-chatting-room__chat-avatar-container">
                    <View className="qz-chatting-room__chat-avatar__avatar">
                      <Image src={item.user.avatar ? item.user.avatar : noperson}/>
                    </View>
                    <View className="qz-chatting-room__chat-avatar__name">
                      <Text className="qz-chatting-room__chat-avatar__name-text">
                        {item.user ? item.user.name : "已注销"}
                      </Text>
                    </View>
                  </View>
                </View>
                :
                <View key={`message-${item.id}`}
                      id={`message-${item.id}`}
                      className="qz-chatting-room__chat-item qz-chatting-room__chat-item-left">
                  <View className="qz-chatting-room__chat-avatar-container">
                    <View className="qz-chatting-room__chat-avatar__avatar">
                      <Image src={item.user.avatar ? item.user.avatar : noperson}/>
                    </View>
                    <View className="qz-chatting-room__chat-avatar__name">
                      <Text className="qz-chatting-room__chat-avatar__name-text">
                        {item.user ? item.user.name : "已注销"}
                      </Text>
                    </View>
                  </View>
                  <View className="qz-chatting-room__chat-text-container">
                    <View className="qz-chatting-room__chat-text__text">
                      {/*<Text>{`message-${index}`}</Text>*/}
                      <Text>{item.content}</Text>
                    </View>
                  </View>
                </View>
            ))}
          </View>
        </ScrollView>
        <View
          className="qz-chatting-room__chat-bottom-bar">
          <AtInput
            name="chatInput"
            clear
            type='text'
            disabled={this.state.messageSending}
            value={this.state.textInput}
            onChange={this.handleChatInputChange}
            onConfirm={this.handleSendMessage}
            confirmType='发送'
            adjustPosition
            border={false}
            className='qz-input-no-padding'
          >
            <View className="qz-chatting-room__chat-bottom-bar-button">
              <AtButton type="primary" size="small" loading={this.state.messageSending}
                        onClick={this.handleSendMessage}>发送</AtButton>
            </View>
          </AtInput>
        </View>
      </View>
    )
  }
}

// const mapStateToProps = (state) => {
//   return {
//     // comments: state.match.comment.list,
//     // matchInfo: this.props.matchInfo,
//     // userInfo: this.props.userInfo,
//   }
// }
export default ChattingRoom
