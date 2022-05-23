const util = require("../../utils/util")
const SQL = require("../../utils/sql")
let V = {
  tid: "",
  fid: "",
  uid: "",
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    fileList: '',
    info: {},
    content: "",
    hour: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    hourValue: "",
    minute: ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
    minuteValue: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.tid = options.tid
    V.fid = options.fid
    V.uid = getApp().globalData.user_id
  },
  hourChange(e) {
    console.log(e)
    let idx = e.detail.value
    this.setData({
      hourValue: idx
    })
  },
  minuteChange(e) {
    console.log(e)
    let idx = e.detail.value
    this.setData({
      minuteValue: idx
    })
  },
  /**
   * 上传图片
   * @param {*} tempUrl 图片临时链接
   */
  uploadImage: async function (tempUrl) {
    const date = util.formatTime(new Date())
    let fileList
    await wx.cloud.uploadFile({
      cloudPath: V.user_id + " userImage/" + date,
      filePath: tempUrl,
    }).then(res => {
      console.log(res, typeof (res))
      fileList = res.fileID
    })
    return fileList
  },
  //用户选择图片
  chooseImage: async function () {
    await wx.chooseImage({
      count: 1,
    }).then(async (res) => {
      let tempUrl = res.tempFilePaths[0]
      this.setData({
        tempFilePath: tempUrl
      })
      await this.uploadImage(tempUrl)
    })
  },
  _contentInput: function (e) {
    let value = e.detail.value;
    this.setData({
      content: value
    })
  },
  submit: async function () {
    //获取数据
    let [id, fid, tid, uid, date, time, content, url, duration] = [util.randomsForSixDigit(), V.fid, V.tid, V.uid, util.formatTime(new Date()).slice(0, 10), util.formatTime(new Date()).slice(11, 19), this.data.content, '', this.data.hourValue + 'h' + this.data.minuteValue + 'm']
    //判空
    if (content == "") {
      util.show_toast("打卡内容为空", "forbidden")
      return
    }
    if (this.data.fileList != '') {
      url = await this.uploadImage(this.data.fileList[0].url)
    }
    //加载
    wx.showLoading({
      title: '上传数据中',
      mask: true
    })
    //操作数据库
    await SQL.record_insert(id, fid, tid, uid, date, time, content, url, duration)
    //停止加载
    wx.hideLoading({})
    //完成提示
    util.show_toast("打卡成功!")
    //路由
    wx.navigateBack({
      delta: 1,
    })
  },
  onChange(e) {
    console.log('onChange', e)
    const {
      file,
      fileList
    } = e.detail
    if (file.status === 'uploading') {
      this.setData({
        progress: 0,
      })
      wx.showLoading()
    } else if (file.status === 'done') {
      this.setData({
        imageUrl: file.url,
      })
    }

    // Controlled state should set fileList
    this.setData({
      fileList
    })
  },
  onSuccess(e) {
    console.log('onSuccess', e)
  },
  onFail(e) {
    console.log('onFail', e)
  },
  onComplete(e) {
    console.log('onComplete', e)
    wx.hideLoading()
  },
  onProgress(e) {
    console.log('onProgress', e)
    this.setData({
      progress: e.detail.file.progress,
    })
  },
  onPreview(e) {
    console.log('onPreview', e)
    const {
      file,
      fileList
    } = e.detail
    wx.previewImage({
      current: file.url,
      urls: fileList.map((n) => n.url),
    })
  },
  onRemove(e) {

  },
})