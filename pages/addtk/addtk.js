const util = require("../../utils/util")
import {
  $wuxActionSheet
} from '../../dist/index'
let V = {
  flock_id: "",
}
Page({
  submit: async function () {

    let [id, name, state,defaultText, flock_id, cycle, weekday, clock, start, end] = [util.randomsForSixDigit(), this.data.taskName, this.data.state,this.data.defaultText, V.flock_id, this.data.cycle, this.data.weekday, this.data.clock, this.data.start, this.data.end]

    let sql = `insert into task values(${id},'${name}','${state}','${defaultText}',${flock_id},'${cycle}','${weekday}','${clock}','${start}','${end}',0)`;

    let result = await util.executeSQL(sql)

    wx.navigateBack({
      delta: 1,
    })
  },
  taskInput: function (e) {
    this.setData({
      taskName: e.detail.value
    })
  },
  stateInput: function (e) {
    this.setData({
      state: e.detail.value
    })
  },
  defaultTextInput:function (e) {
    this.setData({
      defaultText: e.detail.value
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
    let index = e.detail.value
    this.setData({
      clock: this.data.clockArray[index]
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
  tipOpen:function() {
    this.setData({
      tip: true,
    })
  },
  tipClose:function() {
    this.setData({
      tip: false,
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    tip:false,//是否跳出提示
    taskName: "",
    state: "",
    defaultText:"",
    cycle: "",
    weekday: "",
    clock: "",
    start: "",
    end: "",
    currentDate: "",
    weekdayArray: ['周一', '周二', '周三', '周四', '周五', '周六', '周天'],
    cycleArray: ['每天', '每周'],
    clockArray: ["00:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    V.flock_id = options.flock_id
    let date = new Date()
    let currentDate = util.formatTime(date).slice(0, 10)
    this.setData({
      currentDate: currentDate
    })
    this.tipOpen()
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