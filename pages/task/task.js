const util = require("../../utils/util")
var globalData = getApp().globalData
var V = {
  task_id: '',
}
Page({
  /**
   * 获取当前计划的详细信息
   * input:task_id
   * process:从数据库获取
   * output:task对象
   */
  getTargetInfo: async function (id) {
    let sql = `select * from task where id=${id}`
    let result = await util.executeSQL(sql)
    result = result && JSON.parse(result)
    return result[0]
  },
  /**
   * 获取该计划下的打卡数据
   * input:计划id
   * process:从数据库中获取打卡信息
   * output:record 对象数组
   */
  getRecordList: async function (id) {
    let sql = `select u.nickName,u.avatarUrl,r.content,r.date,r.time,r.url from record as r,punch as p,user as u where r.task_id = ${id} and r.id = p.record_id and p.user_id = u.id order by r.date desc,r.time desc`
    let result = await util.executeSQL(sql)
    result = result && JSON.parse(result)
    return result
  },
  /**
   * 获取进度条和进度环信息
   * input：id, targetInfo
   * process: 计算打卡人数百分比，计算剩余时间
   * output: percent_of_bar, percent_of_circle, rest_of_day
   */
  getProgressInfo: async function (id, targetInfo) {
    //定义进度条所需变量
    let num_of_punched //已打卡人数
    let num_of_all //总人数
    let percent_of_bar //进度条百分比
    //定义进度环所需变量
    let start = targetInfo.start //计划开始时间 格式：2022-03-28 
    let current = util.getCurrentFormatedDate() //当前时间 格式：2022-03-28
    let end = targetInfo.end //计划结束时间
    let gap_of_start_and_end //总时间间隔
    let gap_of_start_and_current //已经进行的时间间隔
    let rest_of_day //剩余多少天
    let percent_of_circle //进度环百分比

    //计算
    let [sql_of_count_punched, result1, sql_of_count_all, result2] = ['', '', '', '']
    sql_of_count_punched = `select count(*) as num from record where date like '${current}%' and task_id=${id}`
    sql_of_count_all = `select count(*) as num from joining as j,task as t where t.id = ${id} and j.flock_id = t.flock_id`
    result1 = await util.executeSQL(sql_of_count_punched)
    result1 = result1 && JSON.parse(result1)
    result2 = await util.executeSQL(sql_of_count_all)
    result2 = result2 && JSON.parse(result2)
    num_of_punched = result1[0].num //得到已打卡人数
    num_of_all = result2[0].num //得到总人数
    console.log(num_of_all, num_of_punched)
    percent_of_bar = ((num_of_punched / num_of_all) * 100).toFixed(1) //计算百分比

    gap_of_start_and_end = util.getDiffBetweenDate(start, end)
    gap_of_start_and_current = util.getDiffBetweenDate(start, current)
    console.log(gap_of_start_and_end, gap_of_start_and_current)
    rest_of_day = util.getDiffBetweenDate(current, end)
    percent_of_circle = (1 - gap_of_start_and_current / gap_of_start_and_end) * 100 //计算百分比

    return {
      percent_of_bar: percent_of_bar,
      percent_of_circle: percent_of_circle,
      rest_of_day: rest_of_day
    }
  },
  /**
   * 时间选择器
   */
  selectDate:function(e){
    console.log(e.detail.value)
    this.setData({
      select_date:e.detail.value,
      show_select_date:e.detail.value.slice(5,10)
    })

  },
  data: {
    select_date:"",
    show_select_date:"",
    currentDate:"",
    visible:'',
    id: "",
    target: {
      percent_of_bar: '',
      percent_of_circle: '',
      rest_of_day: ''
    },
    recordList: []
  },
  onLoad: async function (options) {
    V.task_id = options.id
    let date = new Date()
    let currentDate = util.formatTime(date).slice(0, 10)
    this.setData({
      select_date: currentDate,
      id: V.task_id
    })
  },
  onShow: async function () {
    
    let targetInfo = await this.getTargetInfo(V.task_id)

    this.setData({
      target: targetInfo
    })
    wx.setNavigationBarTitle({
      title: this.data.target.name,
    })
    let recordList = await this.getRecordList(V.task_id)
    this.setData({
      recordList: recordList
    })

    let {
      percent_of_bar,
      percent_of_circle,
      rest_of_day
    } = await this.getProgressInfo(V.task_id, this.data.target)
    console.log(percent_of_circle, percent_of_bar)
    this.setData({
      'target.percent_of_bar': percent_of_bar,
      'target.percent_of_circle': percent_of_circle,
      'target.rest_of_day': rest_of_day
    })
  },
  onOpen:function() {
    console.log("sad")
    this.setData({
      visible: true,
    })
  },
  onClose() {
    this.setData({
      visible: false,
    })
  },
})