const utils = require("../../utils/util")
const message = require("../../utils/message")
const SQL = require("../../utils/sql")
var V = {
  id: "",
  uid: getApp().globalData.user_id
}
Page({
  data: {
    info: {}, //用户基本信息
    exp: "", //基本信息
    remarkList: [],
    value: "", //实时输入的评论 
    admin: false,
  },
  async onLoad(options) {
    //获取数据
    V.id = options.id
    //获取基本信息
    let res = await SQL.record_select_by_id(V.id, V.uid)
    if (res == "[]") {
      utils.show_toast("找不到帖子!", "forbidden")
    } else {
      //加载
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      res = res && JSON.parse(res)
      this.setData({
        record: res[0],
        admin: res[0].user_id == V.uid
      })
      await this.getUserProfile()
      await this.getRemarkList()
      wx.hideLoading({})
    }
  },
  /**
   * 用户点击预览图片
   */
  previewImage() {
    console.log("预览图片")
    wx.previewImage({
      urls: [this.data.exp.url],
      current: this.data.exp.url
    })
  },
  /**
   * 用户点击分享
   */
  share() {
    utils.show_toast("点击右上角分享", 'text')
  },
  /**
   * 用户删除评论
   */
  async delete_remark(e) {
    let index = e.currentTarget.id
    let remark = this.data.remarkList[index]
    wx.showModal({
      content: "确定删除",
      success: async res => {
        let confirm = res.confirm
        if (confirm) {
          this.setData({
            ['record.remark_num']: this.data.record.remark_num - 1
          })
          await SQL.remark_delete(remark.id)
          utils.show_toast("删除成功")
          await this.getRemarkList()
        } else {

        }
      }

    })
  },
  /**
   * 用户点击删除帖子
   */
  async delete_exp() {
    wx.showModal({
      content: "确定删除",
      success: async res => {
        let confirm = res.confirm
        if (confirm) {
          await SQL.experience_delete(this.data.exp.id)
          utils.show_toast("删除成功")
          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            })
          }, 1000);
        } else {

        }
      }
    })
  },
  /**
   * 获取个人基本信息
   */
  async getUserProfile() {
    let sql = `select avatarUrl from user where id = ${V.uid}`
    let res = await utils.executeSQL(sql)
    res = res && JSON.parse(res)
    this.setData({
      info: res[0]
    })
  },
  /**
   * 获取评论列表
   */
  async getRemarkList() {
    let res = await SQL.remark_select(V.id, V.uid)
    res = res && JSON.parse(res)
    this.setData({
      remarkList: res
    })
  },
  async record_like(e) {
    let record = this.data.record
    //修改页面值
    this.setData({
      ['record.isLike']: 1,
      ['record.like_num']: record.like_num + 1,
    })
    //修改数据库
    wx.showLoading({
      title: '处理中',
      mask: true
    })
    await SQL.record_like(record.id, V.uid)
    //生成点赞通知
    await message.send_like_message(V.uid,record.user_id, record.id)
    wx.hideLoading({})
    utils.show_toast("点赞成功！")
  },
  async record_cancelLike(e) {
    let record = this.data.record
    //修改页面值
    this.setData({
      ['record.isLike']: 0,
      ['record.like_num']: record.like_num - 1,
    })
    //修改数据库
    await SQL.record_cancel_like(record.id, V.uid)
    //反馈
    utils.show_toast("已取消！")
  },
  async remark_like(e) {
    console.log(e)
    let index = e.currentTarget.id
    let remark = this.data.remarkList[index]
    //修改页面值
    this.setData({
      ['remarkList[' + index + '].isLike']: 1,
      ['remarkList[' + index + '].like_num']: remark.like_num + 1,
    })
    //修改数据库
    await SQL.remark_like(remark.id, V.uid)
    //生成点赞通知
    await message.send_like_message(V.uid, remark.user_id, this.data.record.id)
    //反馈
    utils.show_toast("点赞成功！")
  },
  async remark_cancelLike(e) {
    console.log(e)
    let index = e.currentTarget.id
    let remark = this.data.remarkList[index]
    //修改页面值
    this.setData({
      ['remarkList[' + index + '].isLike']: 0,
      ['remarkList[' + index + '].like_num']: remark.like_num - 1,
    })
    //修改数据库
    await SQL.remark_cancel_like(remark.id, V.uid)
    //反馈
    utils.show_toast("已取消")
  },
  /**
   * 用户输入评论
   */
  async remark_input(e) {
    let value = e.detail.value
    this.setData({
      value: value
    })
  },
  /**
   * 提交评论
   */
  async commit_remark() {
    //修改页面信息
    this.setData({
      ['record.remark_num']: this.data.record.remark_num + 1
    })
    //插入评论信息
    let [user_id, record_id, time, content] = [V.uid, this.data.record.id, utils.formatTime(new Date()), this.data.value]
    wx.showLoading({
      title: '提交数据中',
      mask: true
    })
    await SQL.remark_insert(user_id, record_id, time, content);

    //页面刷新数据
    await this.getRemarkList()

    //生成通知
    await message.send_remark_message(V.uid, this.data.record.user_id, this.data.record.id)
    wx.hideLoading({})
    utils.show_toast('评论成功')
  }
})