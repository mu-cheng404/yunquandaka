const globalData = getApp().globalData
const utils = require('../../utils/util')
const SQL = require('../../utils/sql')
var V = {
  flock_id: '',
  task_id: ''
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
    type: "", //成员类型 1 圈子 0 计划
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.flock_id = options.flock_id
    console.log(options.task_id)
    this.setData({
      type: options.task_id == ""?1:0
    })
    if (this.data.type == 1) {
      await this.getAndSetFlockMemberInfo()
    } else {
      V.task_id = options.task_id
      await this.getAndSetTaskMemberInfo()
    }
    console.log(V.flock_id, V.task_id, '---------------------')
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
   * 获取计划成员列表信息
   */
  async getAndSetTaskMemberInfo() {
    let list = await SQL.task_select_member(V.task_id)
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
    let _this = this
    wx.showModal({
      content: "踢出后将清除ta的所有数据，请再次确认",
      cancelColor: 'cancelColor',
      cancelText: "手滑了",
      success: async res => {
        let confirm = res.confirm
        if (confirm) {
          if (V.task_id) {
            await SQL.flock_quit(V.flock_id, user.id)

          } else {
            await SQL.task_quit(user_id, V.task_id)
            await _this.getAndSetTaskMemberInfo()
            utils.show_toast('已踢出')
          }
        } else [

        ]
      }
    })
  },
  /**
   * 查询当前用户是否为管理员
   */
  async checkAdmin() {
    let admin
    if (this.data.type == 1) {
      admin = await SQL.flock_select_amdin(V.flock_id)
      admin = admin && JSON.parse(admin)
      admin = admin[0].creater_id
    } else {
      admin = await SQL.task_select_amdin(V.task_id)
      admin = admin && JSON.parse(admin)
      admin = admin[0].creator
    }
    console.log(admin,'-----------------------------')
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