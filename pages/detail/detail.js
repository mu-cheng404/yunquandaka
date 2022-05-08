const globalData = getApp().globalData
const utils = require("../../utils/util")
const message = require("../../utils/message")
const SQL = require("../../utils/sql")
var V = {
  id: ""
}
Page({
  data: {
    info: {}, //用户基本信息
    exp: "", //基本信息
    remarkList: [],
    value: "", //实时输入的评论 
    own: false,
  },
  async onLoad(options) {
    V.id = options.id
    let res = await SQL.experience_select_by_id(V.id, globalData.user_id)
    if (res == "[]") {
      utils.show_toast("找不到帖子!", "forbidden")
    } else {
      res = res && JSON.parse(res)
      let info = await this.getUserProfile()
      this.setData({
        info: info
      })
      this.setData({
        exp: res[0],
        own: res[0].writter_id == globalData.user_id
      })
      await this.getRemarkList()
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
    utils.show_toast("请点击右上角分享", 'text')
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
    let sql = `select avatarUrl from user where id = ${globalData.user_id}`
    let res = await utils.executeSQL(sql)
    res = res && JSON.parse(res)
    return res[0]
  },
  /**
   * 获取评论列表
   */
  async getRemarkList() {
    let res = await SQL.remark_select(V.id, globalData.user_id)
    res = res && JSON.parse(res)
    this.setData({
      remarkList: res
    })
  },
  async exp_like(e) {
    let exper = this.data.exp
    //修改页面值
    this.setData({
      ['exp.isLike']: 1,
      ['exp.num_of_like']: exper.num_of_like + 1,
    })
    //修改数据库
    let sql = `insert into liking(exper_id,user_id,time,type) values( ${exper.id},${globalData.user_id},'${utils.formatTime(new Date())}',1)`
    await utils.executeSQL(sql)
    //生成点赞通知
    await message.send_like_message(globalData.user_id, exper.writter_id, exper.id)
  },
  async exp_cancelLike(e) {
    let exper = this.data.exp
    //修改页面值
    this.setData({
      ['exp.isLike']: 0,
      ['exp.num_of_like']: exper.num_of_like - 1,
    })
    //修改数据库
    let sql = `delete from liking where user_id = ${globalData.user_id} and exper_id = ${exper.id}`
    await utils.executeSQL(sql)
  },
  async remark_like(e) {
    console.log(e)
    let index = e.currentTarget.id
    let remark = this.data.remarkList[index]
    //修改页面值
    this.setData({
      ['remarkList[' + index + '].isLike']: 1,
      ['remarkList[' + index + '].num_of_like']: remark.num_of_like + 1,
    })
    //修改数据库
    let sql = `insert into liking(exper_id,remark_id,user_id,time,type) values(${this.data.exp.id}, ${remark.id},${globalData.user_id},'${utils.formatTime(new Date())}',0)`
    await utils.executeSQL(sql)
    //生成点赞通知
    await message.send_like_message(globalData.user_id, remark.user_id, this.data.exp.id)
  },
  async remark_cancelLike(e) {
    console.log(e)
    let index = e.currentTarget.id
    let remark = this.data.remarkList[index]
    //修改页面值
    this.setData({
      ['remarkList[' + index + '].isLike']: 0,
      ['remarkList[' + index + '].num_of_like']: remark.num_of_like - 1,
    })
    //修改数据库
    let sql = `delete from liking where user_id = ${globalData.user_id} and remark_id = ${remark.id}`
    await utils.executeSQL(sql)
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
    
    //插入评论信息
    let [user_id, exper_id, time, content] = [globalData.user_id, this.data.exp.id, utils.formatTime(new Date()), this.data.value]
    await SQL.remark_insert(user_id, exper_id, time, content);
    //页面刷新数据
    await this.getRemarkList()

    this.setData({
      ['exp.num_of_remark']: this.data.exp.num_of_like + 1
    })
    //生成通知
    await message.send_remark_message(globalData.user_id, this.data.exp.writter_id, this.data.exp.id)
    utils.show_toast('评论成功')
  }
})