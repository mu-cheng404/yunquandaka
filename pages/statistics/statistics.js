const wxCharts = require("../../utils/wxcharts.js"); //相对路径
const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
var V = {
  id: ""
}
Page({

  data: {
    imageWidth: 0,
    height: '',
    list: [],
    percent: "",
    rest: "",
  },
  onLoad: async function (options) {
    V.id = options.id
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //获取页面信息
    let screen = this.getSystemInfo()
    console.log(screen)
    this.setData({
      height: screen.height
    })
    let info = await this.getInfo()

    this.createCharts(screen, info)
    //取消加载
    //将缓存设置为1
    wx.hideLoading({
      success: (res) => {},
    })
    //获取进度
    await this.getProcess()
    //获取当天的时间轴数据
    let date = utils.getCurrentFormatedDate()
    this.setData({
      date: date
    })
    await this.getandSetTimeLineData(date)

  },
  onUnload: function () {
    wx.setStorageSync('statloading', 1)
  },
  onShow: function () {

  },
  async getProcess() {
    let targetInfo = await SQL.task_select_by_id(V.id)
    targetInfo = targetInfo && JSON.parse(targetInfo)
    targetInfo = targetInfo[0]
    let id = targetInfo.id
    //定义进度环所需变量
    let start = targetInfo.start //计划开始时间 格式：2022-03-28 
    let current = utils.getCurrentFormatedDate() //当前时间 格式：2022-03-28
    let end = targetInfo.end //计划结束时间
    let gap_of_start_and_end //总时间间隔
    let gap_of_start_and_current //已经进行的时间间隔
    let rest_of_day //剩余多少天
    let percent_of_circle //进度环百分比 

    //计算
    let [sql_of_count_punched, result1, sql_of_count_all, result2] = ['', '', '', '']
    sql_of_count_punched = `select count(*) as num from record where date like '${current}%' and task_id=${id}`
    sql_of_count_all = `select count(*) as num from joining as j,task as t where t.id = ${id} and j.flock_id = t.flock_id`
    result1 = await utils.executeSQL(sql_of_count_punched)
    result1 = result1 && JSON.parse(result1)
    result2 = await utils.executeSQL(sql_of_count_all)
    result2 = result2 && JSON.parse(result2)



    gap_of_start_and_end = utils.getDiffBetweenDate(start, end)
    gap_of_start_and_current = utils.getDiffBetweenDate(start, current)
    console.log(gap_of_start_and_end, gap_of_start_and_current)
    rest_of_day = utils.getDiffBetweenDate(current, end)
    if (gap_of_start_and_end <= gap_of_start_and_current) {
      percent_of_circle = 0
    } else {
      percent_of_circle = (1 - gap_of_start_and_current / gap_of_start_and_end) * 100 //计算百分比
    }
    this.setData({
      percent: percent_of_circle,
      rest: rest_of_day
    })
  },
  /**
   * 绘制图表
   * @param {*} screen 系统屏幕宽高
   */
  createCharts(screen, info) {
    console.log(screen)
    new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: info.dayList,
      series: [{
        name: '打卡率',
        data: info.rate,
        format: function (val) {
          return val.toFixed(2) + '%';
        }
      }],
      yAxis: {
        title: '打卡率 (%)',
        format: function (val) {
          return val + "%";
        },
        min: 0,
        max: 100
      },
      width: screen.width,
      height: screen.height * 0.4
    });
  },
  /**
   * 获取系统信息
   */
  getSystemInfo() {
    let screen
    wx.getSystemInfo({
      success: (result) => {
        screen = result.safeArea
      },
      fail: (res) => {
        return "出错了"
      },
      complete: (res) => {

      },
    })
    return screen
  },
  /**
   * 获取数据
   */
  async getInfo() {
    //获取时间列表
    let dayList = utils.getWeekDate()
    let res = await SQL.task_charts_message(V.id, dayList)
    console.log(dayList, res)
    res = res && JSON.parse(res)
    let rate = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < dayList.length; i++) {
      for (let j = 0; j < res.length || 0; j++) {
        console.log(dayList[i] == res[j].date, dayList[0], res[j].date, typeof (res[j].date))
        if (dayList[i] == "'" + res[j].date + "'") {
          rate[i] = res[j].rate
          break
        } else {
          rate[i] = 0
        }
      }
      dayList[i] = dayList[i].slice(6, 11)
    }
    console.log(rate)
    return {
      dayList: dayList,
      rate: rate
    }
  },
  async getandSetTimeLineData(date) {
    let list = await SQL.task_time_line(V.id, date)
    if (list == '[]') {
      list = []
      console.log(list.length)
    } else {
      list = list && JSON.parse(list)
    }
    console.log(list, typeof (list))
    this.setData({
      list: list
    })
  },
  /**
   * 用户选择日期
   * @param {*} e 页面传值
   */
  async changeDate(e) {
    console.log(e)
    let date = e.detail.value
    this.setData({
      date: date
    })
    await this.getandSetTimeLineData(date)
  },
})