const wxCharts = require("../../utils/wxcharts.js"); //相对路径
const utils = require("../../utils/util")
const sql = require("../../utils/sql")
var V = {
  id: ""
}
Page({

  data: {
    imageWidth: 0,
    height: '',
    list: [],
  },
  onLoad: async function (options) {
    V.id = options.id
    let screen = this.getSystemInfo()
    console.log(screen)
    this.setData({
      height: screen.height
    })
    let info = await this.getInfo()
    this.createCharts(screen, info)

    //获取当天的时间轴数据
    let date = utils.getCurrentFormatedDate()
    this.setData({
      date: date
    })
    await this.getandSetTimeLineData(date)

  },
  onShow: function () {

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
    let res = await sql.task_charts_message(V.id, dayList)
    console.log(dayList,res)
    res = res && JSON.parse(res)
    let rate = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < dayList.length; i++) {
      for (let j = 0; j < res.length||0; j++) {
        console.log(dayList[i] == res[j].date, dayList[0], res[j].date, typeof (res[j].date))
        if (dayList[i] == "'" + res[j].date + "'") {
          rate[i] = res[j].rate
          break
        } else {
          rate[i] = 0
        }
      }
    }
    console.log(rate)
    return {
      dayList: dayList,
      rate: rate
    }
  },
  async getandSetTimeLineData(date) {
    let list = await sql.task_time_line(V.id, date)
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