const globalData = getApp().globalData
const utils = require('../../utils/util')
const SQL = require('../../utils/sql')
var V = {
  flock_id: '',
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    admin: false,
    adminID: '',
    active: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.flock_id = options.flock_id
    await this.getAndSetFlockMemberInfo()
    await this.checkAdmin()
  },
  /**
   * 获取圈子成员列表信息
   */
  async getAndSetFlockMemberInfo() {
    let list = await SQL.flock_select_member(V.flock_id)
    list = list && JSON.parse(list)
    this.setData({
      list: list
    })
  },
  
  /**
   * 用户点击踢出成员
   * @param {*} e 
   */

  async kick_out(e) {
    let index = e.currentTarget.id
    let user = this.data.list[index]
    console.log(user)
    let _this = this
    wx.showModal({
      title:"提示",
      content: "点击确定踢掉ta",
      success: async res => {
        let confirm = res.confirm
        if (confirm) {
          wx.showLoading({
            title: '处理中',
            mask: true
          })
          await SQL.flock_quit(V.flock_id, user.id)
          await _this.getAndSetFlockMemberInfo()
          wx.hideLoading({
            success: (res) => {
              utils.show_toast('已踢出')
            },
          })
        } else {}
      }
    })
  },
  /**
   * 查询当前用户是否为管理员
   */
  async checkAdmin() {
    let admin
    admin = await SQL.flock_select_amdin(V.flock_id)
    admin = admin && JSON.parse(admin)
    admin = admin[0].creater_id
    this.setData({
      adminID: admin,
      admin: admin == globalData.user_id
    })
  },
  dianjiguanli() {
    this.setData({
      active: !this.data.active
    })
  }
})