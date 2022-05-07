const util = require("../../utils/util")
const SQL = require("../../utils/sql")
const globalData = getApp().globalData
import {
  $wuxActionSheet
} from '../../dist/index'
let V = {
  flock_id: "",
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tip: false, //是否跳出提示
    taskName: "",
    state: "",
    defaultText: "",
    type: "",
    form: "",
    cycle: "每天",
    weekday: "周一",
    clock: "00:00",
    start: "",
    end: "",
    tag: "",
    currentDate: "",
    typeArray: ['学习', '日常', '运动', '活动' ],
    formArray: ['图片', '文字', '图片+文字'],
    weekdayArray: ['周一', '周二', '周三', '周四', '周五', '周六', '周天'],
    cycleArray: ['每天', '每周'],
    clockArray: ["00:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    V.flock_id = options.id
    let date = new Date()
    let currentDate = util.formatTime(date).slice(0, 10)
    this.setData({
      currentDate: currentDate
    })
    this.tipOpen()
  },
  /**
   * 创建
   */
  submit: async function () {
    
    let [id, name, state, creator, type, form, defaultText, flock_id, cycle, weekday, clock, start, end] = [util.randomsForSixDigit(), this.data.taskName, this.data.state, globalData.user_id, this.data.type, this.data.form, this.data.defaultText, V.flock_id, this.data.cycle, this.data.weekday, this.data.clock, this.data.start, this.data.end]
    await SQL.task_insert(id, name, state, creator, type, form, defaultText, flock_id, cycle, weekday, clock, start, end)
    util.show_toast('创建成功!将前往计划主页')

    setTimeout(() => {
      wx.redirectTo({
        url: '../task/task?id='+id,
      })
    }, 1000);
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
  defaultTextInput: function (e) {
    this.setData({
      defaultText: e.detail.value
    })
  },
  typePickerChange: async function (e) {
    let index = e.detail.value
    this.setData({
      type: this.data.typeArray[index]
    })
  },
  formPickerChange: async function (e) {
    let index = e.detail.value
    this.setData({
      form: this.data.formArray[index]
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
    let tag = util.getDiffBetweenDate(this.data.start, value)
    console.log(tag, typeof (tag))
    this.setData({
      end: value,
      tag: tag
    })
  },
  tipOpen: function () {
    this.setData({
      tip: true,
    })
  },
  tipClose: function () {
    this.setData({
      tip: false,
    })
  },
})