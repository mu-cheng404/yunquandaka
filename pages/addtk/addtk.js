const util = require("../../utils/util")
const SQL = require("../../utils/sql")
const message = require("../../utils/message")
const globalData = getApp().globalData
import {
  $wuxActionSheet
} from '../../dist/index'
let V = {
  flock_id: "",
  task_id: "",
  type: "", //判断是新建页还是修改页
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: "",
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
    typeArray: ['学习', '日常', '运动', '活动'],
    formArray: ['图片', '文字', '图片+文字'],
    weekdayArray: ['周一', '周二', '周三', '周四', '周五', '周六', '周天'],
    cycleArray: ['每天', '每周'],
    clockArray: ["00:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    list: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log(options,)
    V.type = options.type
    if (V.type == 1) {
      console.log("onload")
      V.flock_id = options.id
      let date = new Date()

      let currentDate = util.formatTime(date).slice(0, 10)
      this.setData({
        flock_id: V.flock_id,
        currentDate: currentDate,
        pageType: V.type
      })
    } else { //修改页
      V.task_id = options.id
      let task = await SQL.task_select_by_id(V.task_id);
      task = task && JSON.parse(task)
      task = task[0]
      this.setData({
        pageType: V.type,
        id: task.id,
        taskName: task.name,
        state: task.state,
        defaultText: task.defaultText,
        type: task.type,
        form: task.form,
        start: task.start,
        end: task.end,

      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {

  },
  /**
   * 挨个儿发送消息
   * @param {*} task_id 
   */
  async sendMessage(task_id) {
    for (let i = 0; i < this.data.list.length; i++) {
      let [sender_id, receiver_id, flock_id] = [globalData.user_id, this.data.list[i].id, V.flock_id]
      await message.send_invitation_message(sender_id, receiver_id, flock_id, task_id)
    }
  },
  /**
   * 创建
   */
  submit: async function () {
    //获取数据
    let [id, name, state, creator, type, form, defaultText, flock_id, cycle, weekday, clock, start, end] = [V.type == 1 ? util.randomsForSixDigit() : this.data.id, this.data.taskName, this.data.state, globalData.user_id, this.data.type, this.data.form, this.data.defaultText, V.flock_id, this.data.cycle, this.data.weekday, this.data.clock, this.data.start, this.data.end]
    //判空处理
    if (name == "") {
      util.show_toast("名称不能为空！", "forbidden")
      return
    }
    if(name.length >6){
      util.show_toast("名称不能超过6个字")
      return
    }
    if (state == "") {
      util.show_toast("描述不能为空！", "forbidden")
      return
    }
    if (type == "") {
      util.show_toast("请选择计划类型！", "forbidden")
      return
    }
    if (form == "") {
      util.show_toast("请选择建议打卡形式！", "forbidden")
      return
    }
    if (start == "") {
      util.show_toast("请选择计划开始时间！", "forbidden")
      return
    }
    if (end == "") {
      util.show_toast("请选择结束时间！", "forbidden")
      return
    }
    if (start == end) {
      util.show_toast("开始时间和结束时间至少相隔一天！", "forbidden")
      return
    }
    //处理
    wx.showLoading({
      title: '提交数据中',
    })
    if (V.type == 1) {
      await SQL.task_insert(id, name, state, creator, type, form, defaultText, flock_id, cycle, weekday, clock, start, end)
    }else{
      await SQL.task_update_2(id, name, state, type, form, defaultText, start, end)
    }
    wx.hideLoading({
      success: (res) => {
        util.show_toast("成功!")
      },
    })
    //路由
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