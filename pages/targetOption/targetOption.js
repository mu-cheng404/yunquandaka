const utils = require("../../utils/util")
const sql = require("../../utils/sql")
const app = getApp()
var V = {
  id: ""
}
Page({
  data: {
    adjust: false,
    valueOfName: "",
    valueOfState: "",
    flag: true,
    admin: false,
    info: ""
  },
  onLoad: async function (options) {
    V.id = options.id
    await this.getInitTargetInfo()
    this.setData({
      id:V.id,
      admin: await sql.task_check_amdin(V.id, app.globalData.user_id)
    })
  },
  toMember: function () {
    wx.navigateTo({
      url: `../members/members?flock_id=${this.data.info.flock_id}&task_id=${this.data.info.id}`,
    })
  },
  /**
   * 退出计划
   */
  quitTask: function () {
    //提醒用户
    wx.showModal({
      content: "退出该计划后，您的所有打卡数据将会被清除，点击确定退出",
      cancelColor: 'cancelColor',
      cancelText: "手滑了",
      confirmText: "确定",
      confirmColor: "black",
      success: async (res) => {
        if (res.confirm) { //用户点击确定
          let [user_id, task_id] = [app.globalData.user_id, V.id]
          await sql.task_quit(user_id, task_id)
          //返回小队页面
          wx.navigateBack({
            delta: 2,
          })
        } else { //用户点击取消

        }
      }
    })
  },
  /**
   * 注销计划
   */
  async logoutTarget() {
    wx.showModal({
      content: "退出该计划后，您的所有打卡数据将会被清除，点击确定退出",
      cancelColor: 'cancelColor',
      cancelText: "手滑了",
      confirmText: "确定",
      confirmColor: "black",
      success: async (res) => {
        if (res.confirm) { //用户点击确定
          await sql.task_delete(V.id)
          //返回小队页面
          utils.show_toast("已注销,将返回圈子主页")
          setTimeout(() => {
            wx.redirectTo({
              url: `../flock/flock?id=${this.data.info.flock_id}`,
            })
          }, 1000);
        } else { //用户点击取消
        }
      }
    })
  },
  onChangeOfNameInput(e) {
    this.setData({
      valueOfName: e.detail.value,
      flag: false
    })
  },
  onChangeOfStateInput(e) {
    this.setData({
      valueOfState: e.detail.value,
      flag: false
    })
  },
  submit: async function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //更新数据库里flock的信息
    let [task_id, name, state] = [V.id, this.data.valueOfName, this.data.valueOfState]
    await sql.task_update(task_id, name, state)
    //收回adjust状态
    this.setData({
      adjust: !this.data.adjust
    })
    wx.hideLoading({
      success: (res) => {},
    })
    utils.show_toast("修改成功！")
  },
  adjust: function () {
    this.setData({
      adjust: !this.data.adjust
    })
  },

  getInitTargetInfo: async function () {
    let sql = `select * from task where id=${V.id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    console.log(result)
    this.setData({
      valueOfName: result[0].name,
      valueOfState: result[0].state,
      info: result[0]
    })
  },

})