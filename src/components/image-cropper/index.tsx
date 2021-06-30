import Taro from '@tarojs/taro';
import {Component} from 'react'
import {View, Canvas, Image} from '@tarojs/components'
import './index.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {
  //图片路径
  imgSrc: string,
  //裁剪框宽度高度
  height: number,
  width: number,
  //裁剪框最小尺寸
  min_height?: number,
  min_width?: number,
  //裁剪框最大尺寸
  max_height?: number,
  max_width?: number,
  //裁剪框禁止拖动
  disable_height?: boolean,
  disable_width?: boolean,
  //锁定裁剪框比例
  disable_ratio?: boolean,
  //生成的图片尺寸相对剪裁框的比例
  export_scale?: number,
  quality?: number,
  //最小缩放比
  min_scale?: number,
  max_scale?: number,
  //是否禁用旋转
  disable_rotate?: boolean,
  //是否限制移动范围(剪裁框只能在图片内)
  limit_move?: boolean,
  onImageLoaded?: any,
  onTapcut?: any,
  onLoad?: any,
}

type PageState = {
  el: string, //暂时无用
  info: any,
  MOVE_THROTTLE: any, //触摸移动节流settimeout
  MOVE_THROTTLE_FLAG: boolean, //节流标识
  INIT_IMGWIDTH: number | string | null, //图片设置尺寸,此值不变（记录最初设定的尺寸）
  INIT_IMGHEIGHT: number | string | null, //图片设置尺寸,此值不变（记录最初设定的尺寸）
  TIME_BG: any, //背景变暗延时函数
  TIME_CUT_CENTER: any,
  _touch_img_relative: any, //鼠标和图片中心的相对位置
  _flag_cut_touch: boolean, //是否是拖动裁剪框
  _hypotenuse_length: number, //双指触摸时斜边长度
  _flag_img_endtouch: boolean, //是否结束触摸
  _flag_bright: boolean, //背景是否亮
  _canvas_overflow: boolean, //canvas缩略图是否在屏幕外面
  _canvas_width: number,
  _canvas_height: number,
  origin_x: number, //图片旋转中心
  origin_y: number, //图片旋转中心
  _cut_animation: boolean, //是否开启图片和裁剪框过渡
  _img_top: number, //图片上边距
  _img_left: number, //图片左边距
  //图片旋转角度
  angle: number,
  //图片缩放比
  scale: number,
  cut_top: number | null,
  cut_left: number | null,
  imageObject: any,
  _imgSrc: any,
  _ctx: any,
  //裁剪框宽度高度
  _height: number,
  _width: number,
  //图片高度宽度
  img_height: number | null,
  img_width: number | null,
  //canvas边距（不设置默认不显示）
  canvas_top: number | null,
  canvas_left: number | null,
  CUT_START: any,
  _cut_animation_time: any,
  _limit_move: boolean,
  watch: any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ImageCropper {
  props: IProps;
}

class ImageCropper extends Component<IProps, PageState> {

  static defaultProps = {
    //图片路径
    imgSrc: null,
    //裁剪框宽度高度
    height: 200,
    width: 200,
    //裁剪框最小尺寸
    min_height: 100,
    min_width: 100,
    //裁剪框最大尺寸
    max_height: 300,
    max_width: 300,
    //裁剪框禁止拖动
    disable_height: false,
    disable_width: false,
    //锁定裁剪框比例
    disable_ratio: false,
    //生成的图片尺寸相对剪裁框的比例
    export_scale: 3,
    quality: 1,
    //图片旋转角度
    //最小缩放比
    min_scale: 0.5,
    max_scale: 2,
    //是否禁用旋转
    disable_rotate: false,
    //是否限制移动范围(剪裁框只能在图片内)
    onImageLoaded: null,
    onTapcut: null,
    onLoad: null,
  }

  constructor(props) {
    super(props)
    const systemInfo = Taro.getSystemInfoSync()
    this.state = {
      el: 'image-cropper', //暂时无用
      info: systemInfo,
      MOVE_THROTTLE: null, //触摸移动节流settimeout
      MOVE_THROTTLE_FLAG: true, //节流标识
      INIT_IMGWIDTH: 0, //图片设置尺寸,此值不变（记录最初设定的尺寸）
      INIT_IMGHEIGHT: 0, //图片设置尺寸,此值不变（记录最初设定的尺寸）
      TIME_BG: null, //背景变暗延时函数
      TIME_CUT_CENTER: null,
      _touch_img_relative: [{
        x: 0,
        y: 0
      }], //鼠标和图片中心的相对位置
      _flag_cut_touch: false, //是否是拖动裁剪框
      _hypotenuse_length: 0, //双指触摸时斜边长度
      _flag_img_endtouch: false, //是否结束触摸
      _flag_bright: true, //背景是否亮
      _canvas_overflow: true, //canvas缩略图是否在屏幕外面
      _canvas_width: 200,
      _canvas_height: 200,
      origin_x: 0.5, //图片旋转中心
      origin_y: 0.5, //图片旋转中心
      _cut_animation: false, //是否开启图片和裁剪框过渡
      _img_top: systemInfo.windowHeight / 2, //图片上边距
      _img_left: systemInfo.windowWidth / 2, //图片左边距
      angle: 0,
      scale: 1,
      cut_top: null,
      cut_left: null,
      imageObject: null,
      _imgSrc: null,
      _ctx: null,
      _height: 200,
      _width: 200,
      //图片高度宽度
      img_height: null,
      img_width: null,
      //canvas边距（不设置默认不显示）
      canvas_top: null,
      canvas_left: null,
      CUT_START: null,
      _cut_animation_time: null,
      _limit_move: false,
      watch: {
        //监听截取框宽高变化
        _width: (value, that) => {
          if (value < that.props.min_width) {
            that.setState({
              _width: that.props.min_width
            });
          }
          that._computeCutSize();
        },
        _height: (value, that) => {
          if (value < that.props.min_height) {
            that.setState({
              _height: that.props.min_height
            });
          }
          that._computeCutSize();
        },
        angle: (_value, that) => {
          //停止居中裁剪框，继续修改图片位置
          that._moveStop();
          if (that.state._limit_move) {
            if (that.state.angle % 90) {
              that.setState({
                angle: Math.round(that.state.angle / 90) * 90
              });
              return;
            }
          }
        },
        _cut_animation: (value, that) => {
          //开启过渡300毫秒之后自动关闭
          clearTimeout(that.state._cut_animation_time);
          if (value) {
            const _cut_animation_time = setTimeout(() => {
              that.setState({
                _cut_animation: false
              });
            }, 300)
            that.setState({_cut_animation_time: _cut_animation_time})
          }
        },
        _limit_move: (value, that) => {
          if (value) {
            if (that.state.angle % 90) {
              that.setState({
                angle: Math.round(that.state.angle / 90) * 90
              });
            }
            that._imgMarginDetectionScale(() => {
              !that.state._canvas_overflow && that._draw();
            });
          }
        },
        canvas_top: (_value, that) => {
          that._canvasDetectionPosition();
        },
        canvas_left: (_value, that) => {
          that._canvasDetectionPosition();
        },
        _imgSrc: (_value, that) => {
          that.pushImg();
        },
        cut_top: (_value, that) => {
          that._cutDetectionPosition();
          if (that.state._limit_move) {
            !that.state._canvas_overflow && that._draw();
          }
        },
        cut_left: (_value, that) => {
          that._cutDetectionPosition();
          if (that.state._limit_move) {
            !that.state._canvas_overflow && that._draw();
          }
        }
      }
    }
  }

  componentDidMount() {
    //初始化canvas
    const _ctx = Taro.createCanvasContext("image-cropper", this);
    this.setState({
      info: Taro.getSystemInfoSync(),
      INIT_IMGWIDTH: this.state.img_width,
      INIT_IMGHEIGHT: this.state.img_height,
      _canvas_height: this.props.height,
      _canvas_width: this.props.width,
      _height: this.props.height,
      _width: this.props.width,
      _imgSrc: this.props.imgSrc,
      _limit_move: this.props.limit_move,
      _ctx: _ctx
    }, () => {
      //根据开发者设置的图片目标尺寸计算实际尺寸
      this._initImageSize();
      //设置裁剪框大小>设置图片尺寸>绘制canvas
      this._computeCutSize();
      //检查裁剪框是否在范围内
      this._cutDetectionPosition();
      //检查canvas是否在范围内
      this._canvasDetectionPosition();
      //初始化完成
      this.props.onLoad && this.props.onLoad({
        cropper: this
      });
      this.observe(["_width", "_height", "_imgSrc"]);
    })
  }

  getImg = (getCallback) => {
    this._draw(() => {
      Taro.canvasToTempFilePath({
        width: this.state._width * this.props.export_scale,
        height: Math.round(this.state._height * this.props.export_scale),
        destWidth: this.state._width * this.props.export_scale,
        destHeight: Math.round(this.state._height) * this.props.export_scale,
        fileType: 'png',
        quality: this.props.quality,
        canvasId: this.state.el,
        success: (res) => {
          getCallback({
            url: res.tempFilePath,
            width: this.state._width * this.props.export_scale,
            height: this.state._height * this.props.export_scale
          });
        }
      }, this)
    });
  }
  /**
   * 设置剪裁框和图片居中
   */
  setCutCenter = () => {
    let cut_top = (this.state.info.windowHeight - this.state._height) * 0.5;
    let cut_left = (this.state.info.windowWidth - this.state._width) * 0.5;
    //顺序不能变
    this.setState({
      _img_top: this.state._img_top - this.state.cut_top + cut_top,
      cut_top: cut_top, //截取的框上边距
      _img_left: this.state._img_left - this.state.cut_left + cut_left,
      cut_left: cut_left, //截取的框左边距
    }, () => {
      this.observe(["cut_top", "cut_left"]);
    });
  }


  _setCutCenter = () => {
    let cut_top = (this.state.info.windowHeight - this.state._height) * 0.5;
    let cut_left = (this.state.info.windowWidth - this.state._width) * 0.5;
    this.setState({
      cut_top: cut_top, //截取的框上边距
      cut_left: cut_left, //截取的框左边距
    }, () => {
      this.observe(["cut_top", "cut_left"]);
    });
  }

  /**
   * 加载（更换）图片
   */
  pushImg = () => {
    // getImageInfo接口传入 src: '' 会导致内存泄漏
    if (!this.state._imgSrc) return;
    Taro.getImageInfo({
      src: this.state._imgSrc,
    }).then(res => {
      this.setState({imageObject: res}, () => {
        //计算最后图片尺寸
        this._imgComputeSize(() => {
          //图片非本地路径需要换成本地路径
          if (this.state._imgSrc.search(/tmp/) == -1) {
            this.setState({
              _imgSrc: res.path
            }, () => {
              this._observe("_imgSrc")
            });
          }

          if (this.state._limit_move) {
            //限制移动，不留空白处理
            this._imgMarginDetectionScale(() => {
              this._draw();
            });
          } else {
            this._draw();
          }
        });
      });
    }).catch(_err => {
      this.setState({
        _imgSrc: ''
      }, () => {
        this._observe("_imgSrc")
      });
    });
  }


  imageLoad = (_e) => {
    setTimeout(() => {
      this.props.onImageLoaded && this.props.onImageLoaded(this.state.imageObject);
    }, 1000)
  }


  /**
   * 根据开发者设置的图片目标尺寸计算实际尺寸
   */
  _initImageSize = () => {
    //处理宽高特殊单位 %>px
    if (this.state.INIT_IMGWIDTH && typeof this.state.INIT_IMGWIDTH == "string" && this.state.INIT_IMGWIDTH.indexOf("%") != -1) {
      let width = this.state.INIT_IMGWIDTH.replace("%", "");
      const imageWidth = this.state.info.windowWidth / 100 * width;
      this.setState({INIT_IMGWIDTH: imageWidth, img_width: imageWidth})
    }
    if (this.state.INIT_IMGHEIGHT && typeof this.state.INIT_IMGHEIGHT == "string" && this.state.INIT_IMGHEIGHT.indexOf("%") != -1) {
      let height = this.state.INIT_IMGHEIGHT.replace("%", "");
      const imageHeight = this.state.info.windowHeight / 100 * height;
      this.setState({INIT_IMGHEIGHT: imageHeight, img_height: imageHeight})
    }
  }
  /**
   * 检测剪裁框位置是否在允许的范围内(屏幕内)
   */
  _cutDetectionPosition = () => {
    let _cutDetectionPositionTop = () => {
        //检测上边距是否在范围内
        if (this.state.cut_top < 0) {
          this.setState({
            cut_top: 0
          }, () => {
            this._observe("cut_top");
          });
        }
        if (this.state.cut_top > this.state.info.windowHeight - this.state._height) {
          this.setState({
            cut_top: this.state.info.windowHeight - this.state._height
          }, () => {
            this._observe("cut_top");
          });
        }
      },
      _cutDetectionPositionLeft = () => {
        //检测左边距是否在范围内
        if (this.state.cut_left < 0) {
          this.setState({
            cut_left: 0
          }, () => {
            this._observe("cut_left");
          });
        }
        if (this.state.cut_left > this.state.info.windowWidth - this.state._width) {
          this.setState({
            cut_left: this.state.info.windowWidth - this.state._width
          }, () => {
            this._observe("cut_top");
          });
        }
      };
    //裁剪框坐标处理（如果只写一个参数则另一个默认为0，都不写默认居中）
    if (this.state.cut_top == null && this.state.cut_left == null) {
      this._setCutCenter();
    } else if (this.state.cut_top != null && this.state.cut_left != null) {
      _cutDetectionPositionTop();
      _cutDetectionPositionLeft();
    } else if (this.state.cut_top != null && this.state.cut_left == null) {
      _cutDetectionPositionTop();
      this.setState({
        cut_left: (this.state.info.windowWidth - this.state._width) / 2
      }, () => {
        this._observe("cut_left");
      });
    } else if (this.state.cut_top == null && this.state.cut_left != null) {
      _cutDetectionPositionLeft();
      this.setState({
        cut_top: (this.state.info.windowHeight - this.state._height) / 2
      }, () => {
        this._observe("cut_top");
      });
    }
  }

  /**
   * 检测canvas位置是否在允许的范围内(屏幕内)如果在屏幕外则不开启实时渲染
   * 如果只写一个参数则另一个默认为0，都不写默认超出屏幕外
   */
  _canvasDetectionPosition = () => {
    if (this.state.canvas_top == null && this.state.canvas_left == null) {
      this.setState({
        _canvas_overflow: false,
        canvas_top: -5000,
        canvas_left: -5000
      }, () => {
        this.observe(["canvas_top", "canvas_left"]);
      });
    } else if (this.state.canvas_top != null && this.state.canvas_left != null) {
      if (this.state.canvas_top < -this.state._height || this.state.canvas_top > this.state.info.windowHeight) {
        this.setState({
          _canvas_overflow: true,
        });
      } else {
        this.setState({
          _canvas_overflow: false,
        });
      }
    } else if (this.state.canvas_top != null && this.state.canvas_left == null) {
      this.setState({
        canvas_left: 0
      }, () => {
        this._observe("canvas_left");
      });
    } else if (this.state.canvas_top == null && this.state.canvas_left != null) {
      this.setState({
        canvas_top: 0
      }, () => {
        this._observe("canvas_top");
      });
      if (this.state.canvas_left < -this.state._width || this.state.canvas_left > this.state.info.windowWidth) {
        this.setState({
          _canvas_overflow: true,
        });
      } else {
        this.setState({
          _canvas_overflow: false,
        });
      }
    }
  }


  /**
   * 图片边缘检测-位置
   */
  _imgMarginDetectionPosition = (_scale?, callback?) => {
    if (!this.state._limit_move) return;
    let left = this.state._img_left;
    let top = this.state._img_top;
    const scale = _scale || this.state.scale;
    let img_width = this.state.img_width;
    let img_height = this.state.img_height;
    if (this.state.angle / 90 % 2) {
      img_width = this.state.img_height;
      img_height = this.state.img_width;
    }
    left = this.state.cut_left + img_width * scale / 2 >= left ? left : this.state.cut_left + img_width * scale / 2;
    left = this.state.cut_left + this.state._width - img_width * scale / 2 <= left ? left : this.state.cut_left + this.state._width - img_width * scale / 2;
    top = this.state.cut_top + img_height * scale / 2 >= top ? top : this.state.cut_top + img_height * scale / 2;
    top = this.state.cut_top + this.state._height - img_height * scale / 2 <= top ? top : this.state.cut_top + this.state._height - img_height * scale / 2;
    this.setState({
      _img_left: left,
      _img_top: top,
      scale: scale
    }, () => {
      callback && callback()
    })
  }


  /**
   * 图片边缘检测-缩放
   */
  _imgMarginDetectionScale = (callback?) => {
    if (!this.state._limit_move) return;
    let scale = this.state.scale;
    let img_width = this.state.img_width;
    let img_height = this.state.img_height;
    if (this.state.angle / 90 % 2) {
      img_width = this.state.img_height;
      img_height = this.state.img_width;
    }
    if (img_width * scale < this.state._width) {
      scale = this.state._width / img_width;
    }
    if (img_height * scale < this.state._height) {
      scale = Math.max(scale, this.state._height / img_height);
    }
    this._imgMarginDetectionPosition(scale, callback);
  }


  /**
   * 计算图片尺寸
   */
  _imgComputeSize = (callback) => {
    let img_width = this.state.img_width,
      img_height = this.state.img_height;
    if (!this.state.INIT_IMGHEIGHT && !this.state.INIT_IMGWIDTH) {
      //默认按图片最小边 = 对应裁剪框尺寸
      img_width = this.state.imageObject.width;
      img_height = this.state.imageObject.height;
      if (img_width / img_height > this.state._width / this.state._height) {
        img_height = this.state._height;
        img_width = this.state.imageObject.width / this.state.imageObject.height * img_height;
      } else {
        img_width = this.state._width;
        img_height = this.state.imageObject.height / this.state.imageObject.width * img_width;
      }
    } else if (this.state.INIT_IMGHEIGHT && !this.state.INIT_IMGWIDTH) {
      img_width = this.state.imageObject.width / this.state.imageObject.height * this.state.INIT_IMGHEIGHT;
    } else if (!this.state.INIT_IMGHEIGHT && this.state.INIT_IMGWIDTH) {
      img_height = this.state.imageObject.height / this.state.imageObject.width * this.state.INIT_IMGWIDTH;
    }
    this.setState({
      img_width: img_width,
      img_height: img_height
    }, () => {
      callback && callback()
    });
  }

  //改变截取框大小
  _computeCutSize = () => {
    if (this.state._width > this.state.info.windowWidth) {
      this.setState({
        _width: this.state.info.windowWidth,
      }, () => {
        this._observe("_width");
      });
    } else if (this.state._width + this.state.cut_left > this.state.info.windowWidth) {
      this.setState({
        cut_left: this.state.info.windowWidth - this.state.cut_left,
      }, () => {
        this._observe("cut_left");
      });
    }
    if (this.state._height > this.state.info.windowHeight) {
      this.setState({
        _height: this.state.info.windowHeight,
      }, () => {
        this._observe("_height");
      });
    } else if (this.state._height + this.state.cut_top > this.state.info.windowHeight) {
      this.setState({
        cut_top: this.state.info.windowHeight - this.state.cut_top,
      }, () => {
        this._observe("cut_top");
      });
    }
    !this.state._canvas_overflow && this._draw();
  }


  //开始触摸
  _start = (event) => {
    this.setState({_flag_img_endtouch: false});
    if (event.touches.length == 1) {
      let _touch_img_relative = this.state._touch_img_relative;
      //单指拖动
      _touch_img_relative[0] = {
        x: (event.touches[0].clientX - this.state._img_left),
        y: (event.touches[0].clientY - this.state._img_top)
      }
      this.setState({_touch_img_relative: _touch_img_relative})
    } else {
      //双指放大
      let width = Math.abs(event.touches[0].clientX - event.touches[1].clientX);
      let height = Math.abs(event.touches[0].clientY - event.touches[1].clientY);
      let _touch_img_relative = this.state._touch_img_relative;
      let _hypotenuse_length = this.state._hypotenuse_length;
      _touch_img_relative = [{
        x: (event.touches[0].clientX - this.state._img_left),
        y: (event.touches[0].clientY - this.state._img_top)
      }, {
        x: (event.touches[1].clientX - this.state._img_left),
        y: (event.touches[1].clientY - this.state._img_top)
      }];
      _hypotenuse_length = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
      this.setState({_touch_img_relative: _touch_img_relative, _hypotenuse_length: _hypotenuse_length})
    }
    !this.state._canvas_overflow && this._draw();
  }


  _move_throttle = () => {
    //安卓需要节流
    if (this.state.info.platform == 'android') {
      clearTimeout(this.state.MOVE_THROTTLE);
      let MOVE_THROTTLE = this.state.MOVE_THROTTLE;
      MOVE_THROTTLE = setTimeout(() => {
        this.setState({MOVE_THROTTLE_FLAG: true})
      }, 1000 / 40)
      this.setState({MOVE_THROTTLE: MOVE_THROTTLE})
      return MOVE_THROTTLE;
    } else {
      this.setState({MOVE_THROTTLE_FLAG: true})
    }
  }

  _move = (event) => {
    if (this.state._flag_img_endtouch || !this.state.MOVE_THROTTLE_FLAG) return;
    this.setState({MOVE_THROTTLE_FLAG: false})
    this._move_throttle();
    this._moveDuring();
    if (event.touches.length == 1) {
      //单指拖动
      let left = (event.touches[0].clientX - this.state._touch_img_relative[0].x),
        top = (event.touches[0].clientY - this.state._touch_img_relative[0].y);
      //图像边缘检测,防止截取到空白
      this.setState({_img_left: left, _img_top: top})

      this._imgMarginDetectionPosition();
      this.setState({
        _img_left: this.state._img_left,
        _img_top: this.state._img_top
      });
    } else {
      //双指放大
      let width = (Math.abs(event.touches[0].clientX - event.touches[1].clientX)),
        height = (Math.abs(event.touches[0].clientY - event.touches[1].clientY)),
        hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)),
        scale = this.state.scale * (hypotenuse / this.state._hypotenuse_length),
        current_deg = 0;
      const {min_scale = 0.5, max_scale = 2} = this.props

      scale = scale <= min_scale ? min_scale : scale;
      scale = scale >= max_scale ? max_scale : scale;
      //图像边缘检测,防止截取到空白
      this.setState({scale: scale});
      this._imgMarginDetectionScale();
      //双指旋转(如果没禁用旋转)
      let _touch_img_relative = [{
        x: (event.touches[0].clientX - this.state._img_left),
        y: (event.touches[0].clientY - this.state._img_top)
      }, {
        x: (event.touches[1].clientX - this.state._img_left),
        y: (event.touches[1].clientY - this.state._img_top)
      }];
      if (!this.props.disable_rotate) {
        let first_atan = 180 / Math.PI * Math.atan2(_touch_img_relative[0].y, _touch_img_relative[0].x);
        let first_atan_old = 180 / Math.PI * Math.atan2(this.state._touch_img_relative[0].y, this.state._touch_img_relative[0].x);
        let second_atan = 180 / Math.PI * Math.atan2(_touch_img_relative[1].y, _touch_img_relative[1].x);
        let second_atan_old = 180 / Math.PI * Math.atan2(this.state._touch_img_relative[1].y, this.state._touch_img_relative[1].x);
        //当前旋转的角度
        let first_deg = first_atan - first_atan_old,
          second_deg = second_atan - second_atan_old;
        if (first_deg != 0) {
          current_deg = first_deg;
        } else if (second_deg != 0) {
          current_deg = second_deg;
        }
      }
      this.setState({
        _touch_img_relative: _touch_img_relative,
        _hypotenuse_length: Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
      })
      //更新视图
      this.setState({
        angle: this.state.angle + current_deg,
        // scale: this.state.scale
      }, () => {
        this._observe("angle");
      });
    }
    !this.state._canvas_overflow && this._draw();
  }


  //结束操作
  _end = (_event) => {
    this.setState({_flag_img_endtouch: true})
    this._moveStop();
  }


  //点击中间剪裁框处理
  _click = (event) => {
    this._draw(() => {
      let x = event.detail ? event.detail.x : event.touches[0].clientX;
      let y = event.detail ? event.detail.y : event.touches[0].clientY;
      if ((x >= this.state.cut_left && x <= (this.state.cut_left + this.state._width)) && (y >= this.state.cut_top && y <= (this.state.cut_top + this.state._height))) {
        //生成图片并回调
        const {export_scale = 3} = this.props;
        Taro.canvasToTempFilePath({
          width: this.state._width * export_scale,
          height: Math.round(this.state._height * export_scale),
          destWidth: this.state._width * export_scale,
          destHeight: Math.round(this.state._height) * export_scale,
          fileType: 'png',
          quality: this.props.quality,
          canvasId: this.state.el,
          success: (res) => {
            this.props.onTapcut && this.props.onTapcut({
              url: res.tempFilePath,
              width: this.state._width * export_scale,
              height: this.state._height * export_scale
            });
          }
        }, this)
      }
    });
  }

  //渲染
  _draw = (callback?) => {
    const {export_scale = 3} = this.props;
    if (!this.state._imgSrc) return;
    let draw = () => {
      //图片实际大小
      let img_width = this.state.img_width * this.state.scale * export_scale;
      let img_height = this.state.img_height * this.state.scale * export_scale;
      //canvas和图片的相对距离
      const xpos = this.state._img_left - this.state.cut_left;
      const ypos = this.state._img_top - this.state.cut_top;
      //旋转画布
      this.state._ctx.translate(xpos * export_scale, ypos * export_scale);
      this.state._ctx.rotate(this.state.angle * Math.PI / 180);
      this.state._ctx.drawImage(this.state._imgSrc, -img_width / 2, -img_height / 2, img_width, img_height);
      this.state._ctx.draw(false, () => {
        callback && callback();
      });
    }
    if (this.state._ctx.width != this.state._width || this.state._ctx.height != this.state._height) {
      //优化拖动裁剪框，所以必须把宽高设置放在离用户触发渲染最近的地方
      this.setState({
        _canvas_height: this.state._height,
        _canvas_width: this.state._width,
      }, () => {
        //延迟40毫秒防止点击过快出现拉伸或裁剪过多
        setTimeout(() => {
          draw();
        }, 40);
      });
    } else {
      draw();
    }
  }

  //裁剪框处理
  _cutTouchMove = (e) => {
    if (this.state._flag_cut_touch && this.state.MOVE_THROTTLE_FLAG) {
      if (this.props.disable_ratio && (this.props.disable_width || this.props.disable_height)) return;
      //节流
      this.setState({MOVE_THROTTLE_FLAG: false})
      this._move_throttle();
      let width = this.state._width,
        height = this.state._height,
        cut_top = this.state.cut_top,
        cut_left = this.state.cut_left,
        size_correct = () => {
          width = width <= this.props.max_width ? width >= this.props.min_width ? width : this.props.min_width : this.props.max_width;
          height = height <= this.props.max_height ? height >= this.props.min_height ? height : this.props.min_height : this.props.max_height;
        },
        size_inspect = () => {
          if ((width > this.props.max_width || width < this.props.min_width || height > this.props.max_height || height < this.props.min_height) && this.props.disable_ratio) {
            size_correct();
            return false;
          } else {
            size_correct();
            return true;
          }
        };
      height = this.state.CUT_START.height + ((this.state.CUT_START.corner > 1 && this.state.CUT_START.corner < 4 ? 1 : -1) * (this.state.CUT_START.y - e.touches[0].clientY));
      switch (this.state.CUT_START.corner) {
        case 1:
          width = this.state.CUT_START.width + this.state.CUT_START.x - e.touches[0].clientX;
          if (this.props.disable_ratio) {
            height = width / (this.state._width / this.state._height)
          }
          if (!size_inspect()) return;
          cut_left = this.state.CUT_START.cut_left - (width - this.state.CUT_START.width);
          break
        case 2:
          width = this.state.CUT_START.width + this.state.CUT_START.x - e.touches[0].clientX;
          if (this.props.disable_ratio) {
            height = width / (this.state._width / this.state._height)
          }
          if (!size_inspect()) return;
          cut_top = this.state.CUT_START.cut_top - (height - this.state.CUT_START.height)
          cut_left = this.state.CUT_START.cut_left - (width - this.state.CUT_START.width)
          break
        case 3:
          width = this.state.CUT_START.width - this.state.CUT_START.x + e.touches[0].clientX;
          if (this.props.disable_ratio) {
            height = width / (this.state._width / this.state._height)
          }
          if (!size_inspect()) return;
          cut_top = this.state.CUT_START.cut_top - (height - this.state.CUT_START.height);
          break
        case 4:
          width = this.state.CUT_START.width - this.state.CUT_START.x + e.touches[0].clientX;
          if (this.props.disable_ratio) {
            height = width / (this.state._width / this.state._height)
          }
          if (!size_inspect()) return;
          break
      }
      if (!this.props.disable_width && !this.props.disable_height) {
        this.setState({
          _width: width,
          cut_left: cut_left,
          _height: height,
          cut_top: cut_top,
        }, () => {
          this.observe(["_width", "_height", "cut_top", "cut_left"]);
        })
      } else if (!this.props.disable_width) {
        this.setState({
          _width: width,
          cut_left: cut_left
        }, () => {
          this.observe(["_width", "cut_left"]);
        })
      } else if (!this.props.disable_height) {
        this.setState({
          _height: height,
          cut_top: cut_top
        }, () => {
          this.observe(["_height", "cut_top"]);
        })
      }
      this._imgMarginDetectionScale();
    }
  }
  _cutTouchStart = (e) => {
    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;
    let cutbox_top4 = this.state.cut_top + this.state._height - 30;
    let cutbox_bottom4 = this.state.cut_top + this.state._height + 20;
    let cutbox_left4 = this.state.cut_left + this.state._width - 30;
    let cutbox_right4 = this.state.cut_left + this.state._width + 30;

    let cutbox_top3 = this.state.cut_top - 30;
    let cutbox_bottom3 = this.state.cut_top + 30;
    let cutbox_left3 = this.state.cut_left + this.state._width - 30;
    let cutbox_right3 = this.state.cut_left + this.state._width + 30;

    let cutbox_top2 = this.state.cut_top - 30;
    let cutbox_bottom2 = this.state.cut_top + 30;
    let cutbox_left2 = this.state.cut_left - 30;
    let cutbox_right2 = this.state.cut_left + 30;

    let cutbox_top1 = this.state.cut_top + this.state._height - 30;
    let cutbox_bottom1 = this.state.cut_top + this.state._height + 30;
    let cutbox_left1 = this.state.cut_left - 30;
    let cutbox_right1 = this.state.cut_left + 30;
    if (currentX > cutbox_left4 && currentX < cutbox_right4 && currentY > cutbox_top4 && currentY < cutbox_bottom4) {
      this._moveDuring();
      this.setState({
        _flag_cut_touch: true,
        _flag_img_endtouch: true,
        CUT_START: {
          width: this.state._width,
          height: this.state._height,
          x: currentX,
          y: currentY,
          corner: 4
        }
      })
    } else if (currentX > cutbox_left3 && currentX < cutbox_right3 && currentY > cutbox_top3 && currentY < cutbox_bottom3) {
      this._moveDuring();
      this.setState({
        _flag_cut_touch: true,
        _flag_img_endtouch: true,
        CUT_START: {
          width: this.state._width,
          height: this.state._height,
          x: currentX,
          y: currentY,
          cut_top: this.state.cut_top,
          cut_left: this.state.cut_left,
          corner: 3
        }
      })
    } else if (currentX > cutbox_left2 && currentX < cutbox_right2 && currentY > cutbox_top2 && currentY < cutbox_bottom2) {
      this._moveDuring();
      this.setState({
        _flag_cut_touch: true,
        _flag_img_endtouch: true,
        CUT_START: {
          width: this.state._width,
          height: this.state._height,
          cut_top: this.state.cut_top,
          cut_left: this.state.cut_left,
          x: currentX,
          y: currentY,
          corner: 2
        }
      })
    } else if (currentX > cutbox_left1 && currentX < cutbox_right1 && currentY > cutbox_top1 && currentY < cutbox_bottom1) {
      this._moveDuring();
      this.setState({
        _flag_cut_touch: true,
        _flag_img_endtouch: true,
        CUT_START: {
          width: this.state._width,
          height: this.state._height,
          cut_top: this.state.cut_top,
          cut_left: this.state.cut_left,
          x: currentX,
          y: currentY,
          corner: 1
        }
      })
    }
  }

  _cutTouchEnd = (_e) => {
    this._moveStop();
    this.setState({_flag_cut_touch: false})
  }

  //停止移动时需要做的操作
  _moveStop = () => {
    //清空之前的自动居中延迟函数并添加最新的
    clearTimeout(this.state.TIME_CUT_CENTER);
    const TIME_CUT_CENTER = setTimeout(() => {
      //动画启动
      if (!this.state._cut_animation) {
        this.setState({
          _cut_animation: true
        }, () => {
          this._observe("_cut_animation");
        });
      }
      this.setCutCenter();
    }, 1000)
    this.setState({TIME_CUT_CENTER: TIME_CUT_CENTER})
    //清空之前的背景变化延迟函数并添加最新的
    clearTimeout(this.state.TIME_BG);
    const TIME_BG = setTimeout(() => {
      if (this.state._flag_bright) {
        this.setState({
          _flag_bright: false
        });
      }
    }, 2000)
    this.setState({TIME_BG: TIME_BG})
  }

  //移动中
  _moveDuring = () => {
    //清空之前的自动居中延迟函数
    clearTimeout(this.state.TIME_CUT_CENTER);
    //清空之前的背景变化延迟函数
    clearTimeout(this.state.TIME_BG);
    //高亮背景
    if (!this.state._flag_bright) {
      this.setState({
        _flag_bright: true
      });
    }
  }
  observe = (keys: Array<string>) => {
    keys.forEach(v => {
      this._observe(v);
    })
  }
  _observe = (v) => {
    this.state.watch[v] && this.state.watch[v](this.state[v], this);
  }

  _preventTouchMove = () => {
  }

  render() {
    return <View className='image-cropper' onTouchMove={this._preventTouchMove}>
      <View className='main'
            onTouchEnd={this._cutTouchEnd}
            onTouchStart={this._cutTouchStart}
            onTouchMove={this._cutTouchMove}
            onClick={this._click}>
        <View className='content'>
          <View className={`content_top bg_gray ${this.state._flag_bright ? "" : "bg_black"}`}
                style={{
                  height: `${this.state.cut_top}px`,
                  transitionProperty: `${this.state._cut_animation ? '' : 'background'}`
                }}/>
          <View className='content_middle' style={{height: `${this.state._height}px`}}>
            <View className={`content_middle_left bg_gray ${this.state._flag_bright ? "" : "bg_black"}`}
                  style={{
                    width: `${this.state.cut_left}px`,
                    transitionProperty: `${this.state._cut_animation ? '' : 'background'}`
                  }}/>
            <View className='content_middle_middle'
                  style={{
                    width: `${this.state._width}px`,
                    height: `${this.state._height}px`,
                    transitionDuration: '.3s',
                    transitionProperty: `${this.state._cut_animation ? '' : 'background'}`
                  }}>
              <View className="border border-top-left"/>
              <View className="border border-top-right"/>
              <View className="border border-right-top"/>
              <View className="border border-right-bottom"/>
              <View className="border border-bottom-right"/>
              <View className="border border-bottom-left"/>
              <View className="border border-left-bottom"/>
              <View className="border border-left-top"/>
            </View>
            <View className={`content_middle_right bg_gray ${this.state._flag_bright ? "" : "bg_black"}`}
                  style={{transitionProperty: `${this.state._cut_animation ? '' : 'background'}`}}/>
          </View>
          <View className={`content_bottom bg_gray ${this.state._flag_bright ? "" : "bg_black"}`}
                style={{transitionProperty: `${this.state._cut_animation ? '' : 'background'}`}}/>
        </View>
        <Image onLoad={this.imageLoad} onTouchStart={this._start} onTouchMove={this._move} onTouchEnd={this._end}
               style={{
                 width: `${this.state.img_width ? this.state.img_width + 'px' : 'auto'}`,
                 height: `${this.state.img_height ? this.state.img_height + 'px' : 'auto'}`,
                 transform: `translate3d(${this.state._img_left - this.state.img_width / 2}px,${this.state._img_top - this.state.img_height / 2}px,0) scale(${this.state.scale}) rotate(${this.state.angle}deg)`,
                 transitionDuration: `${this.state._cut_animation ? ".4" : "0"}s`
               }}
               className='img'
               src={this.state._imgSrc}/>
      </View>
      <Canvas canvasId='image-cropper'
              disableScroll
              style={{
                width: `${this.state._canvas_width * this.props.export_scale}px`,
                height: `${this.state._canvas_height * this.props.export_scale}px`,
                left: `${this.state.canvas_left}px`,
                top: `${this.state.canvas_top}px`
              }}
              className='image-cropper-canvas'/>
    </View>
  }
}

export default ImageCropper
