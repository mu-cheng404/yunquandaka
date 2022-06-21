const wxCharts = require("../../utils/wxcharts.js"); //相对路径
const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
var globalData = getApp().globalData
var V = {
  id: "",
  uid: "",
}
Page({

  data: {
    admin: false,
    task: {},
    imageWidth: 0,
    height: '',
    list: [],
    percent: "",
    rest: "",
    unOverList: [],
    overList: [],
    currentDate: "", //当天日期
    current: 'tab1',
    tabs: [{
        key: 'tab1',
        title: '图表',
      },
      {
        key: 'tab2',
        title: '时间轴',
      },
      {
        key: 'tab3',
        title: '未打卡',
      }
    ],
    windowHeight: 0,
  },

  onLoad: async function (options) {
    V.id = options.id
    V.uid = getApp().globalData.user_id
    //判断项目种类
    let task = await SQL.task_select_by_id(V.id)
    task = task && JSON.parse(task)
    this.setData({
      taskType: task[0].cycle
    })
    console.log("计划周期是" + task[0].cycle)
    //获取当前日期
    let current = utils.getCurrentFormatedDate()
    this.setData({
      currentDate: current
    })
    if (this.data.taskType == '周') { //周期为周的话，定位
      let myDate = new utils.myDate()
      this.setData({
        locate: myDate.locateWeek(current)
      })
    }
    //获取屏幕
    let {
      windowHeight,
      windowWidth
    } = await wx.getSystemInfo()
    this.setData({
      windowHeight: windowHeight - windowWidth / 750 * 100,
      windowWidth: windowWidth,
    })
    //查询是否未管理员
    await this.checkAdmin()
    //获取已打卡人数
    await this.GetData(current);
  },
  /**
   * 根据日期获取数据
   * @param {*} date 日期
   */
  async GetData(date) {
    //获取已打卡人数
    await this.getOverList(date);
    //获取未打卡人数
    await this.getUnOverList(date);
    //获取图表数据
    await this.getAndSetCharts();
    //获取打卡时间轴
    await this.getandSetTimeLineData(date);
  },
  /**
   * 日计划选择日期
   */
  async HandleDate(e) {
    console.log(e)
    const sDate = e.detail.value;
    this.setData({ //更新页面
      currentDate: sDate,
    })
    await this.GetData(sDate);//获取数据
  },
  /**
   * 周计划选择start
   */
  async HandleStart(e) {
    const sDate = e.detail.value;
    this.setData({
      'locate.start': sDate,
    })
    await this.GetData(sDate);//重新获取数据
  },
  /**
   * 周计划选择end
   */
  async HandleEnd(e) {
    const sDate = e.detail.value;
    this.setData({
      'locate.end': sDate,
    })
    await this.GetData(sDate);//重新获取数据
  },
  async checkAdmin() {
    let admin = await SQL.task_check_amdin(V.id, V.uid)
    this.setData({
      admin: admin
    })
  },
  /**
   * 获取第三个tab的数据
   */
  async getAndSetCharts() {
    //画饼图
    new wxCharts({
      animation: true, //是否有动画
      canvasId: 'pieCanvas',
      type: 'pie',
      series: [{
        name: '已打卡',
        data: this.data.overList.length,
      }, {
        name: '未打卡',
        data: this.data.unOverList.length,
      }],
      width: this.data.windowWidth,
      height: 300,
      dataLabel: true,
    });
    // // 画柱状图
    // new wxCharts({
    //   canvasId: 'lineCanvas',
    //   type: 'line',
    //   categories: info.dayList,
    //   series: [{
    //     name: '打卡率',
    //     data: info.rate,
    //     format: function (val) {
    //       return val.toFixed(2) + '%';
    //     }
    //   }],
    //   yAxis: {
    //     title: '打卡率 (%)',
    //     format: function (val) {
    //       return val + "%";
    //     },
    //     min: 0,
    //     max: 100
    //   },
    //   width: this.data.windowWidth,
    //   height: 300
    // });
  },
  onUnload: function () {
    wx.setStorageSync('statloading', 1)
  },
  onShow: function () {

  },
  // async getProcess() {
  //   let targetInfo = await SQL.task_select_by_id(V.id)
  //   targetInfo = targetInfo && JSON.parse(targetInfo)
  //   targetInfo = targetInfo[0]
  //   let id = targetInfo.id
  //   //定义进度环所需变量
  //   let start = targetInfo.start //计划开始时间 格式：2022-03-28 
  //   let current = utils.getCurrentFormatedDate() //当前时间 格式：2022-03-28
  //   let end = targetInfo.end //计划结束时间
  //   let gap_of_start_and_end //总时间间隔
  //   let gap_of_start_and_current //已经进行的时间间隔
  //   let rest_of_day //剩余多少天
  //   let percent_of_circle //进度环百分比 

  //   //计算
  //   let [sql_of_count_punched, result1, sql_of_count_all, result2] = ['', '', '', '']
  //   sql_of_count_punched = `select count(*) as num from record where date like '${current}%' and task_id=${id}`
  //   sql_of_count_all = `select count(*) as num from joining as j,task as t where t.id = ${id} and j.flock_id = t.flock_id`
  //   result1 = await utils.executeSQL(sql_of_count_punched)
  //   result1 = result1 && JSON.parse(result1)
  //   result2 = await utils.executeSQL(sql_of_count_all)
  //   result2 = result2 && JSON.parse(result2)



  //   gap_of_start_and_end = utils.getDiffBetweenDate(start, end)
  //   gap_of_start_and_current = utils.getDiffBetweenDate(start, current)
  //   console.log(gap_of_start_and_end, gap_of_start_and_current)
  //   rest_of_day = utils.getDiffBetweenDate(current, end)
  //   if (gap_of_start_and_end <= gap_of_start_and_current) {
  //     percent_of_circle = 0
  //   } else {
  //     percent_of_circle = (1 - gap_of_start_and_current / gap_of_start_and_end) * 100 //计算百分比
  //   }
  //   this.setData({
  //     percent: percent_of_circle,
  //     rest: rest_of_day
  //   })
  // },

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
   * 查询某一天未打卡人数
   * @param {*} date 日期
   */
  async getUnOverList(date) {
    let list
    if (this.data.taskType == '日') {
      list = await SQL.user_select_task_uncover_day(V.id, date)
    } else {
      list = await SQL.user_select_task_uncover_week(V.id, this.data.locate.start, this.data.locate.end)
    }
    list = list && JSON.parse(list)
    this.setData({
      unOverList: list,
      ['tabs[2].title']: `${this.data.tabs[2].title.slice(0,3)}(${list.length})`
    })
  },
  /**
   * 查询某一天已打卡人数
   */
  async getOverList(date) {
    let list
    if (this.data.taskType == '日') {
      list = await SQL.user_select_task_cover_day(V.id, date)
    } else {
      list = await SQL.user_select_task_cover_week(V.id, this.data.locate.start, this.data.locate.end)
    }
    list = list && JSON.parse(list)
    this.setData({
      overList: list,
      ['tabs[1].title']: `${this.data.tabs[1].title.slice(0,3)}(${list.length})`

    })
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
  /**
   * 获取时间轴数据
   * @param {*} date 
   */
  async getandSetTimeLineData(date) {
    let list
    if (this.data.taskType == '日') {
      list = await SQL.task_time_line_day(V.id, date)
    } else {
      list = await SQL.task_time_line_week(V.id, this.data.locate.start, this.data.locate.end)
    }
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
    await this.getUnOverList(date)
  },
  async remind(e) {
    let toUser = e.currentTarget.id;
    wx.showLoading({
      title: '处理中',
      mask: true
    })
    //发送提醒信息
    let message = await utils.send_unover_justify(V.id, toUser)
    wx.hideLoading({})
    console.log(message)
    if (message == 'success') {
      utils.show_toast("发送成功")
    } else {
      utils.show_toast("发送失败，可能是对方没有开启订阅权限")
    }
  },
  onTabsChange(e) {
    console.log('onTabsChange', e)
    const {
      key
    } = e.detail
    const index = this.data.tabs.map((n) => n.key).indexOf(key)

    this.setData({
      key,
      index,
    })
  },
  onSwiperChange(e) {
    console.log('onSwiperChange', e)
    const {
      current: index,
      source
    } = e.detail
    const {
      key
    } = this.data.tabs[index]

    if (!!source) {
      this.setData({
        key,
        index,
      })
    }
  },
})