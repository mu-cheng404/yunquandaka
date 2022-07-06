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
    labelList: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.tid = options.tid
    V.fid = options.fid
    V.uid = getApp().globalData.user_id
    const labelList = wx.getStorageSync('labelList')
    if (labelList.length > 0) {
      this.setData({
        labelList: labelList
      })
    }
  },
  /**
   * 新建标签
   */
  async HandleCreate() {
    const that = this
    wx.showModal({
      title: "新建",
      content: "",
      editable: true,
      showCancel: true,
      placeholderText: "新的快捷内容",
      success: res => {
        const {
          confirm,
          content
        } = res;
        console.log(confirm, content, res)
        if (confirm) {
          let list = that.data.labelList //copy一份
          list.push(content)
          this.setData({ //更新页面数据
            labelList: list
          })
          util.show_toast("添加成功");
          wx.setStorageSync('labelList', list); //更新缓存
        }
      }
    })
  },
  /**
   * 点击
   * @param {*} e 
   */
  async HandleClick(e) {
    const label_id = e.currentTarget.id;
    const label_value = this.data.labelList[label_id];
    this.setData({
      content: label_value,
    })
  },
  /**
   * 删除标签
   * @param {*} e 标签id
   */
  async HandleChange(e) {
    const label_id = e.currentTarget.id;
    console.log(e)
    const that = this
    wx.showModal({
      title: '提示',
      content: `确定删除'${that.data.labelList[label_id]}'快捷内容？`,
      success: res => {
        const {
          confirm
        } = res;
        let list = that.data.labelList; //拷贝一份
        if (confirm) {
          list.splice(label_id, 1);
          console.log(list)
          that.setData({ //更新页面
            labelList: list,
          })
          util.show_toast("删除成功！"); //提示

          wx.setStorageSync('labelList', list); //更新缓存
        } else {
          //pass
        }
      }
    })

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
   */
  uploadImage: async function (tempUrl) {
    wx.showLoading({
      title: '上传图片中',
    })
    const fileList = this.data.fileList;
    let ffp = [];
    for (let i = 0; i < fileList.length; i++) {
      await wx.cloud.uploadFile({
        cloudPath: 'recordImage/' + Date.parse(new Date()) + '.jpg',
        filePath: fileList[i].url,
      }).then(res => {
        console.log(res);
        ffp.push(res.fileID);
      })
    }
    wx.hideLoading({
    })
    return ffp.join(',');
  },
  //用户选择图片
  chooseImage: async function () {



    await wx.chooseMedia({
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
  async HandleCheck() {
    const flag = await util.CheckSubcribe();
    if (flag) {
      util.show_toast("订阅成功")
    }
  },
  submit: async function () {
    
    //获取数据
    let [id, fid, tid, uid, date, time, content,duration] = [util.randomsForSixDigit(), V.fid, V.tid, V.uid, util.formatTime(new Date()).slice(0, 10), util.formatTime(new Date()).slice(11, 19), this.data.content, this.data.hourValue * 60 + this.data.minuteValue]
    //判空
    if (content == "") {
      util.show_toast("打卡内容为空", "forbidden")
      return
    }
    
    let url = await this.uploadImage();//上传照片
    console.log(url)
    //操作数据库
    //加载
    wx.showLoading({
      title: '上传数据中',
      mask: true
    })
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
  async onChange(e) {
    console.log('onChange', e)
    const {
      file,
      fileList
    } = e.detail
    this.setData({
      fileList,
    })
    // Controlled state should set fileList
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