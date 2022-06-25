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
    admin: false, //是否为管理员
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
    // }, //项目基本信息
    unfold: true, //展开
    urlList: [],
    join: false,
    xiaozubutton: false,
    bottomLoading: false,
    bottomNone: false,
    notice: '',//通告
  },
  onLoad: async function (options) {
    //接收参数
    V.tid = options.tid
    V.fid = options.fid
    V.uid = getApp().globalData.user_id
    console.log("tid=", V.tid, "fid=", V.fid, "uid=", V.uid)
  },
  onShow: async function () {
    //检查是否从广场跳转
    let pages = getCurrentPages()
    if (pages[0].route == 'pages/square/square') {
      this.setData({
        xiaozubutton: "true"
      })
    }
    //获取缓存，检测是否加载过
    let flag = wx.getStorageSync("loading")
    if (flag == 0) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    await new Promise((resolve, reject) => {
      //集中力量办大事
      utils.CheckLogin(); //守卫登录态
      this.getJoin(); //获取加入态
      this.getAdmin(); //获取身份
      this.getBaseInfo(); //获取项目基本信息并赋值（缺省）
      this.getRList(); //获取打卡基本信息（缺省）
      resolve();
    })
    //取消加载
    //将缓存设置为1
    if (flag == 0) {
      wx.hideLoading({
        success: (res) => {},
      })
      wx.setStorageSync('loading', 1)
    }
  },
  async getAdmin() {
    let admin = await SQL.flock_check_admin(V.fid, V.uid); //判断当前用户是否是管理员
    this.setData({
      admin: admin
    });
  },
  async getJoin() {
    //获取加入态
    let join = await SQL.joining_query(V.fid, V.uid); //获取当前用户是否加入小组
    this.setData({
      join: join
    })
  },
  async getRList() {
    //获取20条打卡记录
    let recordList = await SQL.record_select_by_tid_limit_20(V.tid, V.uid);
    if (recordList != '[]') {
      recordList = recordList && JSON.parse(recordList)
      this.setData({
        recordList: recordList
      })
    }
  },
  async onReachBottom() {
    //触底获取更多打卡记录
    const nlength = this.data.recordList.length;
    if (!this.data.bottomLoading) {
      this.setData({
        bottomLoading: true,
      })
    }
    let list = await SQL.record_select_by_tid_more(V.tid, V.uid, nlength);
    if (list == '[]') {
      this.setData({
        bottomNone: true,
        bottomLoading: false,
      })
      return
    } else {
      list = list && JSON.parse(list);
      setTimeout(() => {
        this.setData({
          recordList: this.data.recordList.concat(list),
          bottomLoading: false
        })
      }, 500);
    }
  },
  async getBaseInfo() {
    //获取基本信息
    let target = await SQL.task_select_by_id(V.tid)
    if (target != "[]") {
      target = target && JSON.parse(target);
      const notice = await SQL.flock_select_notice(target[0].flock_id);
      console.log(notice)
      this.setData({
        target: target[0],
        notice: notice
      })
    } else {
      utils.show_toast("找不到项目！", "forbidden")
      return
    }
  },
  toCal() {
    if (this.data.join) {
      wx.navigateTo({
        url: `../calendar/calendar?id=${this.data.target.id}`,
      })
    } else {
      utils.show_toast("您不是该小组成员！", 'forbidden')
    }
  },
  /**
   * 获取已打卡用户的头像
   */
  async getOverAvatar() {
    let [task_id, date] = [V.tid, utils.getCurrentFormatedDate()];
    let list = await SQL.task_select_over_urlList(task_id, date);
    list = list && JSON.parse(list)
    this.setData({
      urlList: list
    })
  },
  /**
   * 用户点击设置
   */
  optionTap() {
    wx.showActionSheet({
      itemList: ['修改项目信息', '注销项目'],
      success: res => {
        console.log(res)
        let option = res.tapIndex
        if (option == 0) {
          wx.navigateTo({
            url: `../addtk/addtk?id=${V.tid}&type=2`,
          })
        } else if (option == 1) {
          wx.showModal({
            title: "提示",
            content: "注销后，所有数据将会被清除，请再次确定",
            success: async (res) => {
              if (res.confirm) { //用户点击确定
                await SQL.task_delete(V.tid)
                //返回小队页面
                const page = getCurrentPages();//页面栈
                const flockPage = page[page.length - 2];//上一个页面
                let list = flockPage.data.list;//拿到项目列表
                console.log(list);
                const index = list.findIndex(task => task.id == this.data.target.id);//找到当前项目在数组里的下标
                console.log("找到了",index);
                list.splice(index,1);
                flockPage.setData({list: list});//提前修改
                utils.show_toast("已注销")

                wx.navigateBack({
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
    let start = targetInfo.start //项目开始时间 格式：2022-03-28 
    let current = utils.getCurrentFormatedDate() //当前时间 格式：2022-03-28
    let end = targetInfo.end //项目结束时间
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
    if (this.data.join) {
      wx.navigateTo({
        url: `../record/record?tid=${this.data.target.id}&fid=${this.data.target.flock_id}`
      })

    } else {
      utils.show_toast("您不是该小组成员！", 'forbidden')
    }

  },
})