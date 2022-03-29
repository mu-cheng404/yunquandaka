var canvas
var data = {
  time: '2021-09-26 23:58:10',
  topic: '背单词',
  picture: '../../images/example1.png',
  fushu_content: '六级'
}
var image1
Page({
  //保存到相册
  canvasToTempFilePath: function () {
    var width = this.data.canvas_width
    var height = this.data.canvas_height

    console.log("3")
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: width,
      height: height,
      destWidth: width,
      destHeight: height,
      canvas: canvas,
      success(res) {
        console.log("路径是=", res.tempFilePath)
        wx.saveImageToPhotosAlbum({ //保存图片到相册
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: "生成图片成功！",
              duration: 2000
            })
          },
          fail: function (err) {
            console.log("添加失败", err)
            if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                showCancel: false,
                success: modalSuccess => {
                  wx.openSetting({
                    success(settingdata) {
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                        wx.saveImageToPhotosAlbum({ //保存图片到相册
                          filePath: res.tempFilePath,
                          success: function () {
                            wx.showToast({
                              title: "生成图片成功！",
                              duration: 2000
                            })
                          }
                        })
                      } else {
                        console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                      }
                    }
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  //对画布进行操作
  changeCanvas: async function (ctx) {
    var width = this.data.canvas_width
    var height = this.data.canvas_height
    // 图片转为临时路径
    var promise = await new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: data.picture,
        success: (res) => {
          var imageWid = res.width
          var imageHei = res.height

          image1 = canvas.createImage()
          image1.src = res.path
          console.log("image1=", image1)
          image1.onload = function () {
            var va = width / height
            var suofang = 0.4
            ctx.save();
            ctx.translate(-(image1.width * (height / image1.height) - width) / 2, 0);
            ctx.drawImage(image1, 0, 0, image1.width * (height / image1.height), height)
            console.log('图片' + image1.height)
            ctx.restore();
          }
          resolve()
        },
        fail: (res) => {
          console.log(res)
        }
      })
    })
    var promise2 = await new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: 'cloud://wu-env-5gq7w4mm483966ef.7775-wu-env-5gq7w4mm483966ef-1306826028/important/体验版二维码.png',
        success: (res) => {
          image1 = canvas.createImage()
          image1.src = res.path

          image1.onload = function () {
            ctx.drawImage(image1, width - 70, height - 90, 60, 60)
          }
          resolve()
        },
        fail: (res) => {
          console.log(res)
        }
      })
    })
    var promise3 = await new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: 'cloud://wu-env-5gq7w4mm483966ef.7775-wu-env-5gq7w4mm483966ef-1306826028/important/logo.png',
        success: (res) => {
          image1 = canvas.createImage()
          image1.src = res.path
          image1.border
          image1.onload = function () {
            ctx.drawImage(image1, 10, 7, 40, 40)
          }
          resolve()
        },
        fail: (res) => {
          console.log(res)
        }
      })
    })
    // await Promise.all([promise, promise2])

    //画文字
    ctx.fillStyle = "white"
    ctx.font = "normal bold 15px sans-serif"
    ctx.fillText('元气打卡', 65, 30) //小程序名

    ctx.font = "normal bold 15px sans-serif"
    ctx.fillText(data.time, 10, height - 50) //时间

    ctx.font = "normal bold 15px sans-serif"
    ctx.fillText(data.topic + '·' + data.fushu_content, 10, height - 24) //主题+计划

    ctx.font = "normal bold 10px sans-serif"
    ctx.fillText('扫码加入打卡', width - 70, height - 20) //提示文字
  },
  data: {
    canvas_width: '', //画板宽度
    canvas_height: '', //画板高度
    bg: '/image/logo.jpg'
  },
  onLoad: function (options) {
    //获取系统最大屏幕高宽
    wx.getSystemInfo({
      success: (result) => {
        console.log("system=", result)
        this.setData({
          canvas_width: result.screenWidth * 0.8,
          canvas_height: result.screenHeight * 0.5,
        })
      },
    })
    //获取canvas实例
    wx.createSelectorQuery()
      .select('#canvas')
      .fields({
        node: true,
        size: true,
      })
      .exec(res => { //获取完成
        console.log("修改之前=", res[0])

        canvas = res[0].node

        var ctx = canvas.getContext('2d')

        //调整画布大小
        const dpr = wx.getSystemInfoSync().pixelRatio //像素比，一个像素的宽度与高度之比
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.log(canvas)
        console.log("修改之后=", res[0])
        // 设置 canvas 坐标原点
        // ctx.translate(width / 2, height * 2 / 3);
        this.changeCanvas(ctx)

      })
  },

})