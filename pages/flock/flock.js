const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
const message = require("../../utils/message")
let V = {
  flock_id: "",
}
const globalData = getApp().globalData
const sliderWidth = 96
Page({
  /**
   * 页面的初始数据
   */
  data: {
    admin: false,
    unfold: "false",
    flock: '',
    current: [],
    right: [{
        text: '编辑',
        style: 'background-color: #ddd; color: white',
      },
      {
        text: '打卡',
        style: 'background-color: #F4333C; color: white',
      }
    ],
    hintMsg: {
      title: "空空如也",
      text: "现在前去打卡吧",
      visible: true
    },
    avatarList: [],
    targetIndex: 0,
    targetInfo: [{
      recordList: [],
      progress: {
        percent: "",
        text: ""
      },
      circle: {
        percent: "",
        text: ""
      },
    }],
    isJoined: false,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    buttons: [{
      text: '点击加入'
    }],
    refresh: false, //下拉刷新
    list: [],
    options_admin: ['修改小组信息', '注销小组'],
    options: ['退出小组'],
  },
  /**
   * 生命周期函数
   */
  onLoad: async function (options) {
    console.log("onload")
    V.flock_id = options.id; //获取随页面传递而来的flock_id
    let admin = await SQL.flock_check_admin(V.flock_id, globalData.user_id)
    this.setData({
      admin: admin
    })
  },
  onUnload: async function (options) {
    wx.setStorageSync('loading', 0)
    console.log("缓存已清除")
    let login = await utils.verifyLogin()
    if (!login) {
      wx.navigateTo({
        url: '../authorize/authorize',
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let loadFlag = wx.getStorageSync("loading")
    console.log("拿到缓存", loadFlag)
    if (!loadFlag) { //没有显示过加载中 flag = 0
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    let login = await utils.verifyLogin()

    this.setData({
      pixelRatio: globalData.systeminfo.pixelRatio,
      windowHeight: globalData.systeminfo.windowHeight,
      windowWidth: globalData.systeminfo.windowWidth,
      tabBarHeight: globalData.tabBarHeight
    })
    if (login) {
      //查询是否是成员
      let joinFlag = await SQL.flock_check_member(V.flock_id, globalData.user_id)
      this.setData({
        isJoined: joinFlag
      })
    } else {
      wx.navigateTo({
        url: '../authorize/authorize',
      })
    }
    console.log("onshow")

    let result = await SQL.flock_select_by_id(V.flock_id)
    result = result && JSON.parse(result)
    if (result.length == 0) {
      utils.show_toast("圈子不存在", 'forbidden')
    } else {
      this.setData({
        flock: result[0]
      })
      await this.getTaskList(); //获取target列表
      await this.getAvatarList(); //获取头像列表
    }
    if (!loadFlag) { //没有显示过加载中
      wx.hideLoading({
        success: (res) => {},
      })
      wx.setStorageSync('loading', 1) //将标志设置成1
      console.log("将缓存设置成", 1)
    }
  },
  optionTap() {
    let [admin, options, options_admin] = [this.data.admin, this.data.options, this.data.options_admin]
    wx.showActionSheet({
      itemList: admin ? options_admin : options,
      success: res => {
        let option = res.tapIndex
        if (admin) {
          if (option == 0) {
            wx.navigateTo({
              url: `../init/init?type=2&id=${V.flock_id}`,
            })
          } else if (option == 1) {
            wx.showModal({
              content: "注销圈子后，所有的信息将会被清除，请再次确定",
              confirmText: "确定",
              cancelText: "手滑了",
              confirmColor: "black",
              success: async (res) => {
                if (res.confirm) { //用户点击确定
                  await SQL.flock_delete(V.flock_id)
                  utils.show_toast('注销成功')
                  wx.switchTab({
                    url: '../home/home',
                  })
                }
              }
            })
          }
        } else {
          if (option == 0) {
            wx.showModal({
              content: "退出圈子后，您的所有信息将会被清除，请再次点击确定",
              confirmText: "确定",
              cancelText: "手滑了",
              confirmColor: "black",
              success: async (res) => {
                if (res.confirm) { //用户点击确定
                  let [flock_id, user_id] = [V.flock_id, globalData.user_id]
                  await SQL.flock_quit(flock_id, globalData.user_id)
                  //返回主页面
                  utils.show_toast("退出成功！")
                  wx.switchTab({
                    url: '../home/home',
                  })
                }
              }
            })
          } else {

          }
        }
      }
    })
  },
  /**
   * 处理用户点击展开或者收起
   */
  unfold() {
    this.setData({
      unfold: !this.data.unfold
    })
  },
  /**
   * 下拉刷新被触发
   * @param {*} e 
   */
  async refresh() {
    this.setData({
      refresh: true
    })
    console.log("refresh")
    await this.getTaskList()
    this.setData({
      refresh: false
    })
  },
  /**
   * 下拉刷新被复位
   */
  async restore() {
    console.log("restore")
  },
  /**
   * 下拉刷新被终止
   */
  async abort() {
    console.log("abort")
  },
  /**
   * 直接加入
   */
  async to_join() {
    //处理
    let that = this
    wx.showLoading({
      title: '申请中',
      mask: true
    })
    //添加数据
    let [user_id, flock_id] = [globalData.user_id, V.flock_id]
    await SQL.joining_insert(user_id, flock_id)
    wx.hideLoading({
      success: async res => {},
    })
    utils.show_toast("加入成功")
    //渲染页面
    await this.onShow()
  },
  /**
   * 用户点击登录
   */
  async apply_to_join() {
    //检查是否申请过
    let flock = this.data.flock
    let [sender_id, receiver_id, flock_id, task_id] = [globalData.user_id, flock.creater_id, flock.id, ""]
    let res = await SQL.message_check_hasSend_and_state(sender_id, receiver_id, flock_id, task_id)
    if (res) { //已经发送过通知了
      if (res == "未处理") {
        utils.show_toast("已经发送申请，管理员正在处理中", 'forbidden')
        return
      } else if (res == "拒绝") {
        console.log("拒绝拒绝")
        wx.showModal({
          content: "管理员拒绝了你的申请，是否重新发送申请",
          cancelText: '取消',
          confirmText: "再次发送",
          success: async res => {
            let confirm = res.confirm
            if (confirm) {
              //获取message_id
              let message_id = await SQL.message_select_id(sender_id, receiver_id, flock_id, task_id)
              //删除旧消息
              await SQL.message_delete_by_id(message_id)
              //发送新消息
              await message.send_apply_message(sender_id, receiver_id, flock_id)
              utils.showToast("已发送申请，等待管理员处理")
            } else {}
          }
        })
      }
    } else { //第一次发送
      wx.showModal({
        content: "确认给圈子发送加入申请",
        cancelText: "下次吧",
        success: async res => {
          let confirm = res.confirm
          if (confirm) {
            let [user_id, receiver_id, flock_id] = [globalData.user_id, this.data.flock.creater_id, this.data.flock.id]
            await message.send_apply_message(user_id, receiver_id, flock_id)
            utils.showToast("已发送申请，等待管理员处理")
          }
        }
      })
    }

  },
  /**
   * 用户预览头像
   */
  async previewImage() {
    wx.previewImage({
      urls: [this.data.flock.avatarUrl],
    })
  },

  toView: function () {
    wx.navigateTo({
      url: '../view/view?id=' + this.data.list[this.data.targetIndex].id,
    })
  },
  targetTap: function (e) {
    if (!this.data.isJoined) {
      utils.show_toast("点击右上角加入小组之后查看计划详情",'forbidden')
    }
  },
  getSettingOftarget: async function (index) {
    if (this.data.list.length != 0) {
      //获取进度条数据
      let target = this.data.list[index]
      let id = target.id
      let all = this.data.avatarList.length //总人数
      let current = utils.getCurrentFormatedDate() //今日已打卡人数
      let sql1 = `select count(*) as num from record where date like '${current}%' and task_id=${id}`
      let result1 = await utils.executeSQL(sql1)
      result1 = result1 && JSON.parse(result1)
      result1 = result1[0].num
      let res = (result1 / all) * 100 //相除
      let end = target.end //计算总时间
      let start = target.start
      let Gap = utils.getDiffBetweenDate(start, end)
      let gap = utils.getDiffBetweenDate(current, end) //计算还剩下多少天
      console.log(Gap + ' ' + gap)
      let res2 = (1 - gap / Gap) * 100 //计算百分比
      this.setData({ //渲染数据
        ['targetInfo[' + index + '].progress.percent']: res,
        ['targetInfo[' + index + '].progress.text']: target.cycle == "每天" ? "今天" : "本周",
        ['targetInfo[' + index + '].circle.percent']: res2,
        ['targetInfo[' + index + '].circle.text']: gap
      })
      //获取打卡数据
    }
  },
  toOption: function () {
    wx.navigateTo({
      url: '../options/options?flock_id=' + V.flock_id,
    })
  },

  /**
   * 收藏计划
   */
  collect: async function (e) {
    console.log(e)
    let index = e.currentTarget.id
    let task = this.data.list[index]
    let flag = task.collect
    if (flag == 1) { //用户已收藏
      wx.showModal({
        content: "是否取消收藏，取消后在主页将不可见",
        success: res => {
          if (res.confirm) { //用户点击确定
            let sql = `delete from collect where task_id = ${task.id} and user_id = ${globalData.user_id}`
            utils.executeSQL(sql)

            this.setData({
              ['list[' + index + '].collect']: 0
            })
            utils.show_toast('已取消')
          } else { //用户点击取消

          }
        }
      })
    } else { //用户未收藏


      //数据库添加收藏记录
      let sql = `insert into collect(task_id,user_id) values(${task.id},${globalData.user_id})`
      utils.executeSQL(sql)

      //修改list的collect值
      this.setData({
        ['list[' + index + '].collect']: 1
      })

      utils.show_toast('已收藏，将在主页展示')

    }
  },

  /**
   * 获取头像列表
   */
  getAvatarList: async function () {
    let sql = `select avatarUrl from user,joining where joining.user_id = user.id and joining.flock_id = ${V.flock_id}`
    let result = await utils.executeSQL(sql);
    result = result && JSON.parse(result)
    console.log(result)
    this.setData({
      avatarList: result
    })
  },
  /**
   * 获取团队所有目标
   */
  getTaskList: async function () {
    let result = await SQL.task_select_by_fid_uid(V.flock_id, globalData.user_id)
    if (result != '[]') {
      result = result && JSON.parse(result)
      this.setData({
        list: result
      })
    }
  },
  /**
   * 切换目标
   */
  switchTarget: async function (e) {
    let id = e.detail.value
    console.log(this.data.targetInfo[id])
    if (this.data.targetInfo[id] == undefined) {
      await this.getRecordList(id);
      await this.getSettingOftarget(id)
    }
    this.setData({
      targetIndex: id
    })

  },
  onClick(e) {
    let type = e.detail.index
    let index = e.detail.data
    console.log("我点击了")
    console.log(e.detail)
    let id = this.data.list[index].id
    if (type == 0) {
      wx.navigateTo({
        url: `../target/target?id=${id}`,
      })
    } else if (type == 1) {
      wx.navigateTo({
        url: `../record/record?id=${id}`,
      })
    }
  },
  /**
   * 查询用户是否存在
   */
  hasUserInfo: async function () {
    let openid = await wx.cloud.callFunction({
      name: "getOpenID"
    })
    openid = openid.result.openid
    let sql = `select id from user where openid='${openid}'`
    let result = await utils.executeSQL(sql)
    if (result == "[]") { //结果为空，说明该用户是新用户
      return {
        hasUser: 0,
        result: result
      }
    } else {
      return {
        hasUser: 1,
        result: result
      }
    }
  },
  /**
   * 检查是否已经申请过
   */
  async check_message() {
    let sql = `select exists(id) from message where sender_id=${globalData.user_id} and url='../task/task?id=${this.data.flock.id}'`
    let res = await utils.executeSQL(sql)
    res = res && JSON.parse(res)
    console.log(res)
  },
  onShareAppMessage: function (res) {
    if (res.from == "button") {
      console.log(res.target)
    }
    return {
      title: "快来加入我的小组",
    }
  },
  joinTap: async function () {
    wx.showModal({
      text: '再确认一下',
      content: "再确认一下",
      success: async res => {
        console.log(res)
        if (res.confirm) { //用户点击确认
          await this.datahandle() //数据添加到数据库
          wx.showToast({ //加入成功
            title: '加入成功',
          })
          this.setData({
            isJoined: true
          })
        } else {

        }
      }
    })
  },
  applyToJoin: async function () {
    wx.showModal({
      content: "再次确认",
      success: async res => {
        if (res.confirm) {
          let user_id = globalData.user_id
          let sql = `insert into joining(user_id,flock_id) values(${user_id},${this.data.flock.id})`
          await utils.executeSQL(sql)
          wx.showToast({
            title: '您已成功加入！',
          })
        } else {

        }
      },
    })
  },
})