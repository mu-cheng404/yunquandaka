const util = require('../../utils/util')
const SQL = require('../../utils/sql')
const isTel = (value) => !/^1[34578]\d{9}$/.test(value)
const app = getApp()
var V = {
  fid: "",
  type: "",
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "https://pic4.zhimg.com/v2-a983007c6b9bbf2bf63dfb1c460a973f_r.jpg?source=1940ef5c",
    initUrl: "https://pic4.zhimg.com/v2-a983007c6b9bbf2bf63dfb1c460a973f_r.jpg?source=1940ef5c",
    valueOfName: "",
    valueOfState: "",
    type: "",
    typeArray: ['班级', '宿舍', '伙伴', '社团', '组织']
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.type = options.type
    this.setData({
      pageType: V.type
    })
    if (V.type == 1) { //新建

    } else { //修改
      V.fid = options.id
      let flock = await SQL.flock_select_by_id(V.fid)
      flock = flock && JSON.parse(flock)
      flock = flock[0]
      this.setData({
        id: flock.id,
        avatarUrl: flock.avatarUrl,
        initUrl: flock.avatarUrl,
        valueOfName: flock.name,
        valueOfState: flock.state,
        type: flock.type,
      })
    }
  },
  submit: async function () {
    let [id, creater_id, name, state, avatarUrl, type] = [V.type == 1 ? util.randomsForSixDigit() : this.data.id, app.globalData.user_id, this.data.valueOfName, this.data.valueOfState, this.data.avatarUrl, this.data.type]
    //判空处理
    if (name.length > 8) {
      util.show_toast("名称限制在八个字以内！", 'fobidden')
      return
    }
    if (name == "") {
      util.show_toast('名称不能为空！', 'fobidden')
      return
    }
    if (state == "") {
      util.show_toast('签名不能为空！', 'fobidden')
      return
    }
    if (type == "") {
      util.show_toast('类别不能为空！', 'fobidden')
      return
    }
    //创建
    wx.showLoading({
      title: '处理中',
    })
    if (this.data.initUrl != this.data.avatarUrl) {
      await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          filePath: this.data.avatarUrl,
          cloudPath: util.genMediaPath(`flock/${id}`, '.png'),
          success: async res => {
            console.log("上传成功")
            let fileID = res.fileID
            avatarUrl = fileID
            resolve("成功")
          },
          fail: async res => {
            console.error
            reject(res)
          }
        })
      })
    }
    if (V.type == 1) {
      await SQL.flock_insert(id, creater_id, name, state, avatarUrl, type)
    } else {
      await SQL.flock_update(id, name, state, type, avatarUrl)
    }
    wx.hideLoading({
      success: (res) => {
        util.show_toast("成功")
      },
    })
    //路由
    if (V.type == 1) {
      wx.redirectTo({
        url: '../flock/flock?id=' + id,
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },
  /**
   * 选择类别
   */
  typeChange: function (e) {
    this.setData({
      type: this.data.typeArray[e.detail.value]
    })
  },


  /**
   * 上传图片
   */
  updateImage: async function () {
    var _this = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['compressed'],
      success: async res => {
        let temp = res.tempFiles[0].tempFilePath
        _this.setData({
          avatarUrl: temp,
        })
      }
    })
  },
  // 输入框
  onChangeOfNameInput(e) {
    this.setData({
      valueOfName: e.detail.value,
    })
  },
  onChangeOfStateInput(e) {
    this.setData({
      valueOfState: e.detail.value,
    })
  },
  onFocus(e) {
    this.setData({
      error: isTel(e.detail.value),
    })
    console.log('onFocus', e)
  },
  onBlur(e) {
    this.setData({
      error: isTel(e.detail.value),
    })
    console.log('onBlur', e)
  },
  onConfirm(e) {
    console.log('onConfirm', e)
  },
  onClear(e) {
    console.log('onClear', e)
    this.setData({
      error: true,
      value: '',
    })
  },
  onError() {
    wx.showModal({
      title: 'Please enter 11 digits',
      showCancel: !1,
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})