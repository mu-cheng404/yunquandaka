const util = require("../../utils/util")
import {
  $wuxActionSheet
} from '../../dist/index'
let V = {
  flock_id: "",
}
Page({
  submit: async function () {

    let [id, name, state, cycle, weekday, clock, start, end] = [this.data.id, this.data.taskName, this.data.state, this.data.cycle, this.data.weekday, this.data.clock, this.data.start, this.data.end]

    let sql = `update task set name='${name}',state='${state}',cycle='${cycle}',weekday='${weekday}',clock='${clock}',start='${start}',end='${end}' where id = ${id}`;

    console.log(sql)
    let result = await util.executeSQL(sql)

    wx.navigateBack({
      delta: 1,
    })
  },
  taskInput: function (e) {
    this.setData({
      valueOfTask: e.detail.value
    })
  },
  stateInput: function (e) {
    this.setData({
      valueOfState: e.detail.value
    })
  },
  cyclePickerChange: async function (e) {
    let index = e.detail.value
    this.setData({
      cycle: this.data.cycleArray[index]
    })
  },
  weekdayPickerChange: async function (e) {
    let index = e.detail.value
    this.setData({
      weekday: this.data.weekdayArray[index]
    })
  },
  clockPickerChange: function (e) {
    let value = e.detail.value
    this.setData({
      clock: value
    })
  },
  startPickerChange: function (e) {
    let value = e.detail.value
    this.setData({
      start: value
    })
  },
  endPickerChange: function (e) {
    let value = e.detail.value
    this.setData({
      end: value
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    taskName: "",
    state: "",
    cycle: "",
    weekday: "",
    clock: "",
    start: "",
    end: "",
    currentDate: "",
    weekdayArray: ['周一', '周二', '周三', '周四', '周五', '周六', '周天'],
    cycleArray: ['每天', '每周'],
  },
  getFlockInfo: async function () {
    let sql = `select * from task where id=${V.id}`

    let result = await util.executeSQL(sql)
    result = result && JSON.parse(result)
    console.log(result)
    result = result[0]
    this.setData({
      id:result.id,
      taskName: result.name,
      state: result.state,
      cycle: result.cycle,
      weekday: result.weekday,
      clock: result.clock,
      start: result.start,
      end: result.end,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.id = options.id
    await this.getFlockInfo()

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

  },


})