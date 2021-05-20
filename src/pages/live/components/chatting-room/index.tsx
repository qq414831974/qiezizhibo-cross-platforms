import Taro, {Component} from '@tarojs/taro'
// import {connect} from '@tarojs/redux'
import {Image, ScrollView, Text, View} from '@tarojs/components'
import {AtActivityIndicator, AtButton, AtInput} from 'taro-ui'
import './index.scss'
import noperson from '../../../../assets/no-person.png';
import * as global from "../../../../constants/global";
import {getExpInfoByExpValue} from "../../../../utils/utils";

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
  expInfo: any;
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
    this.props.nextPage && this.props.nextPage().then(() => {
      this.setState({scrolling: false})
    });
  }
  getCommentsList = (comments) => {
    //   let commentList: Array<any> = comments.sort((item1, item2) => {
    //   const date1 = new Date(item1.date).getTime();
    //   const date2 = new Date(item2.date).getTime();
    //   return date1 > date2 ? 1 : (date1 == date2 ? 0 : -1)
    // });
    // if(commentList.length > 10){
    //   commentList = commentList.slice(0,10)
    // }
    return comments;
  }
  getGiftOrder = (content) => {
    return JSON.parse(content);
  }

  render() {
    const {comments = [], loading = false, intoView = ''} = this.props
    return (
      <View className='qz-chatting-room' style={this.props.isIphoneX ? this.props.tabContainerStyleIphoneX : this.props.tabContainerStyle}>
        <ScrollView scrollY={loading ? false : true}
                    className="qz-chatting-room__chat-content"
                    style={this.props.isIphoneX ? this.props.tabScrollStyleIphoneX : this.props.tabScrollStyle}
                    scrollIntoView={intoView}
                    upper-threshold={20}
                    onScrollToUpper={this.onChatScroll}>
          {loading && <View className="qz-chatting-room__loading">
            <AtActivityIndicator mode="center" content="加载中..."/>
          </View>}
          <View
            className="qz-chatting-room__chat-content__container"
            style={this.props.isIphoneX ? this.props.tabScrollStyleIphoneX : this.props.tabScrollStyle}
          >
            <View className="qz-chatting-room__chat-item-hint">
              茄子TV禁止任何传播违法、违规、低俗等信息的行为，一经发现将予以封禁处理。请勿轻信以任何方式的私下交易等行为，以防人身或财产损失。
            </View>
            {this.getCommentsList(comments).map((item: any) => (
              item.broadcast ?
                <View key={`message-${item.id}`}
                      id={`message-${item.id}`}
                      className="qz-chatting-room__chat-item qz-chatting-room__chat-item-center">
                  <Text className="qz-chatting-room__chat-text__broadcast">{item.content}</Text>
                </View> :
                (item.user && item.user.userNo === this.props.userInfo.userNo ?
                    <View key={`message-${item.id}`}
                          id={`message-${item.id}`}
                          className="qz-chatting-room__chat-item qz-chatting-room__chat-item-right">
                      <View className="qz-chatting-room__chat-text-container">
                        {item.isBroadcast ?
                          <View className="qz-chatting-room__chat-text__text">
                            <View
                              className="qz-chatting-room__chat-text__text-content">{`送给${this.getGiftOrder(item.content).targetName}`}
                              <Image className="qz-chatting-room__chat-text__text-image"
                                     src={this.getGiftOrder(item.content).giftHeadImg}/>
                              x{this.getGiftOrder(item.content).giftNumber}
                            </View>
                          </View>
                          :
                          <View className="qz-chatting-room__chat-text__text">
                            {/*<Text>{`message-${index}`}</Text>*/}
                            <Text className="qz-chatting-room__chat-text__text-content">{item.content}</Text>
                          </View>}
                      </View>
                      <View className="qz-chatting-room__chat-avatar-container">
                        <View className="qz-chatting-room__chat-avatar__avatar">
                          <Image src={item.user.avatar ? item.user.avatar : noperson}/>
                          {item.user.userExp?
                            <View className='level'
                                  style={{backgroundColor: global.LEVEL_COLOR[Math.floor(getExpInfoByExpValue(this.props.expInfo, item.user.userExp.exp).level / 10)]}}>
                              Lv.{getExpInfoByExpValue(this.props.expInfo, item.user.userExp.exp).level}
                            </View>
                            : null}
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
                          {item.user.userExp?
                            <View className='level'
                                  style={{backgroundColor: global.LEVEL_COLOR[Math.floor(getExpInfoByExpValue(this.props.expInfo, item.user.userExp.exp).level / 10)]}}>
                              Lv.{getExpInfoByExpValue(this.props.expInfo, item.user.userExp.exp).level}
                            </View>
                            : null}
                        </View>
                        <View className="qz-chatting-room__chat-avatar__name">
                          <Text className="qz-chatting-room__chat-avatar__name-text">
                            {item.user ? item.user.name : "已注销"}
                          </Text>
                        </View>
                      </View>
                      <View className="qz-chatting-room__chat-text-container">
                        {item.isBroadcast ?
                          <View className="qz-chatting-room__chat-text__text">
                            <View
                              className="qz-chatting-room__chat-text__text-content">{`送给${this.getGiftOrder(item.content).targetName}`}
                              <Image className="qz-chatting-room__chat-text__text-image"
                                     src={this.getGiftOrder(item.content).giftHeadImg}/>
                              x{this.getGiftOrder(item.content).giftNumber}
                            </View>
                          </View>
                          :
                          <View className="qz-chatting-room__chat-text__text">
                            {/*<Text>{`message-${index}`}</Text>*/}
                            <Text className="qz-chatting-room__chat-text__text-content">{item.content}</Text>
                          </View>}
                      </View>
                    </View>
                )))}
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
            confirmType='send'
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
