const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
const message = require("../../utils/message")
var V = {
  tid: '',
  fid: '',
  uid: getApp().globalData.user_id,
}
Page({
  data: {
    select_date: "",
    show_select_date: "",
    currentDate: "",
    visible: '',
    id: "",
    target: {
      percent_of_bar: '',
      percent_of_circle: '',
      rest_of_day: ''
    },
    recordList: [],
    admin: "false", //是否为管理员
    // task: {
    //   "id": 196943,
    //   "name": "测试",
    //   "state": "测试",
    //   "creator": 579718,
    //   "type": "xuexi",
    //   "form": "图片",
    //   "defaultText": "1",
    //   "flock_id": 449748,
    //   "cycle": "每天",
    //   "weekday": "周一",
    //   "clock": "00:00",
    //   "start": "2022-05-09",
    //   "end": "2022-07-09",
    //   "isEnd": 0
    // }, //计划基本信息
    unfold: "false", //展开
    urlList:[],
  },
  onLoad: async function (options) {
    //接收参数
    V.tid = options.tid
    V.fid = options.fid
    V.uid = getApp().globalData.user_id
    console.log("tid=", V.tid, "fid=", V.fid, "uid=", V.uid)
  },
  onShow: async function () {
    //获取缓存，检测是否加载过
    let flag = wx.getStorageSync("loading")
    if (flag == 0) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    //获取计划基本信息并赋值（缺省）
    let target = await SQL.task_select_by_id(V.tid)
    if (target != "[]") {
      target = target && JSON.parse(target)
      this.setData({
        target: target[0]
      })
    } else {
      utils.show_toast("找不到计划！", "forbidden")
      return
    }
    //判断当前用户是否是管理员
    let admin = await SQL.flock_check_admin(V.fid, V.uid)
    this.setData({
      admin: admin
    })
    //获取打卡基本信息（缺省）  
    let recordList = await SQL.record_select_by_tid(V.tid, V.uid)
    if (recordList != '[]') {
      recordList = recordList && JSON.parse(recordList)
      this.setData({
        recordList: recordList
      })
    }
    //获取已打卡用户的头像
    await this.getOverAvatar()
    //取消加载
    //将缓存设置为1
    if (flag == 0) {
      wx.hideLoading({
        success: (res) => {},
      })
      wx.setStorageSync('loading', 1)
    }
  },
  /**
   * 获取已打卡用户的头像
   */
  async getOverAvatar(){
    let [task_id,date] = [V.tid,utils.getCurrentFormatedDate()];

    let list = await SQL.task_select_over_urlList(task_id,date);
    list = list && JSON.parse(list)

    this.setData({urlList:list})
  },
  /**
   * 用户点击设置
   */
  optionTap() {
    wx.showActionSheet({
      itemList: ['修改计划信息', '注销圈子'],
      success: res => {
        console.log(res)
        let option = res.tapIndex
        if (option == 0) {
          wx.navigateTo({
            url: `../addtk/addtk?id=${V.tid}&type=2`,
          })
        } else if (option == 1) {
          wx.showModal({
            content: "注销计划后，所有打卡数据将会被清除，请再次确定",
            cancelText: "手滑了",
            confirmText: "确定",
            confirmColor: "black",
            success: async (res) => {
              if (res.confirm) { //用户点击确定
                await SQL.task_delete(V.tid)
                //返回小队页面
                utils.show_toast("已注销")
                wx.wx.navigateBack({
                  delta: 1,
                  success: (res) => {},
                  fail: (res) => {},
                  complete: (res) => {},
                })
              } else { //用户点击取消
              }
            }
          })
        }
      }
    })
  },
  /**
   * 给打卡点赞
   * @param {*} e 
   */
  async like(e) {
    wx.showLoading({
      title: '处理中',
      mask: true
    })
    //获取数据
    let index = e.currentTarget.id
    let record = this.data.recordList[index]
    //修改页面数据
    this.setData({
      ['recordList[' + index + '].isLike']: 1,
      ['recordList[' + index + '].like_num']: this.data.recordList[index].like_num + 1,
    })
    //修改数据库
    await SQL.record_like(record.id, V.uid)
    //反馈
    wx.hideLoading({})
    utils.show_toast("点赞成功！")
    //生成点赞通知
    await message.send_like_message(V.uid, record.user_id, record.flock_id, record.task_id, record.id)
  },
  /**
   * 给打卡取消点赞
   * @param {*} e 
   */
  async cancelLike(e) {
    //获取数据
    let index = e.currentTarget.id
    let record = this.data.recordList[index]
    //修改页面数据
    this.setData({
      ['recordList[' + index + '].isLike']: 0,
      ['recordList[' + index + '].like_num']: this.data.recordList[index].like_num - 1,
    })
    //修改数据库
    await SQL.record_cancel_like(record.id, V.uid)
    //反馈
    utils.show_toast("已取消")
  },
  /**
   * 用户点击展开描述
   */
  unfold() {
    this.setData({
      unfold: !this.data.unfold
    })
  },
  //监听页面卸载
  onUnLoad() {
    //将缓存设置成 0
    wx.setStorageSync('loading', 0)

  },
  /**
   * 获取当前计划的详细信息
   * input:tid
   * process:从数据库获取
   * output:task对象
   */
  getTargetInfo: async function (id) {
    let sql = `select * from task where id=${id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    return result[0]
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
    let current = utils.getCurrentFormatedDate() //当前时间 格式：2022-03-28
    let end = targetInfo.end //计划结束时间
    let gap_of_start_and_end //总时间间隔
    let gap_of_start_and_current //已经进行的时间间隔
    let rest_of_day //剩余多少天
    let percent_of_circle //进度环百分比

    //计算
    let [sql_of_count_punched, result1, sql_of_count_all, result2] = ['', '', '', '']
    sql_of_count_punched = `select count(*) as num from record where date like '${current}%' and tid=${id}`
    sql_of_count_all = `select count(*) as num from joining as j,task as t where t.id = ${id} and j.flock_id = t.flock_id`
    result1 = await utils.executeSQL(sql_of_count_punched)
    result1 = result1 && JSON.parse(result1)
    result2 = await utils.executeSQL(sql_of_count_all)
    result2 = result2 && JSON.parse(result2)
    num_of_punched = result1[0].num //得到已打卡人数
    num_of_all = result2[0].num //得到总人数
    console.log(num_of_all, num_of_punched)
    percent_of_bar = ((num_of_punched / num_of_all) * 100).toFixed(1) //计算百分比

    gap_of_start_and_end = utils.getDiffBetweenDate(start, end)
    gap_of_start_and_current = utils.getDiffBetweenDate(start, current)
    console.log(gap_of_start_and_end, gap_of_start_and_current)
    rest_of_day = utils.getDiffBetweenDate(current, end)
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
  selectDate: function (e) {
    console.log(e.detail.value)
    this.setData({
      select_date: e.detail.value,
      show_select_date: e.detail.value.slice(5, 10)
    })

  },

  onOpen: function () {
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
  async toRecord() {
    //查询今天是不是已经大过卡了
    let flag = await SQL.task_query_today(V.tid, V.uid)
    console.log(flag)
    if (flag) {
      utils.show_toast("今天已经打过卡了，休息一下吧")
    } else {
      wx.navigateTo({
        url: `../record/record?tid=${this.data.target.id}&fid=${this.data.target.flock_id}`
      })
    }
  }
})