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
      text: '点击申请'
    }],
  },
  /**
   * 用户点击登录
   */
  async apply_to_join() {
    wx.showModal({
      content: "确认给圈子发送加入申请",
      cancelColor: 'cancelColor',
      cancelText: "手滑了",
      success: async res => {
        let confirm = res.confirm
        if (confirm) {
          let [user_id, receiver_id, flock_id] = [globalData.user_id, this.data.flock.creater_id, this.data.flock.id]
          await message.send_apply_message(user_id, receiver_id, flock_id)

          utils.showToast("已发送申请，等待管理员处理")
        }
      }
    })


  },
  /**
   * 用户点击头图修改头图
   */
  updateImage: async function () {
    var _this = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['compressed'],
      success: async res => {
        let temp = res.tempFiles[0].tempFilePath
        wx.cloud.uploadFile({
          filePath: temp,
          cloudPath: utils.genMediaPath(`flock/${V.flock_id}`, '.png'),
          success: async res => {
            let fileID = res.fileID
            console.log(fileID)
            //修改页面值
            _this.setData({
              'flock.avatarUrl': fileID
            })
            wx.showToast({
              title: '修改成功',
              icon: "success"
            })
            //修改数据库
            let sql = `update flock set avatarUrl = '${fileID}' where id = ${_this.data.flock.id}`

            await utils.executeSQL(sql)
          }
        })
      }
    })
  },
  toView: function () {
    wx.navigateTo({
      url: '../view/view?id=' + this.data.list[this.data.targetIndex].id,
    })
  },
  targetTap: function (e) {
    if (!this.data.isJoined) {
      wx.showToast({
        title: '请先加入该小队',
        icon: "error"
      })
    } else {
      let index = e.currentTarget.id
      let id = this.data.list[index].id
      wx.navigateTo({
        url: '../record/record?id=' + id,
      })
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
        cancelColor: 'cancelColor',
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
    let sql = `select task.id,task.name,task.cycle,task.type,task.form,(select nickName from user where task.creator = user.id) as creator,exists (select id from collect where task_id=task.id and user_id=${globalData.user_id}) as collect from task,participate where task.flock_id = ${V.flock_id} and task.id = participate.task_id and participate.user_id = ${globalData.user_id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    this.setData({
      list: result
    })
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
   * 查询用户加入某个小队
   * I : 用户ID、小队ID
   * p ：查询joining表
   * O ：已经加入1；
   */
  hasJoined: async function (user_id, flock_id) {
    let sql = `select id from joining where user_id = ${user_id} and flock_id=${flock_id}`
    let result = await utils.executeSQL(sql)
    if (result == '[]') {
      return 0
    } else {
      return 1
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
  /**
   * 检查是否是新用户，以及是否是访客
   */
  init: async function () {
    let {
      hasUser,
      result
    } = await this.hasUserInfo()
    if (!hasUser) { //用户是新用户
      wx.navigateTo({
        url: '../authorize/authorize',
      })
    } else { //不是新用户
      result = result && JSON.parse(result)
      globalData.user_id = result[0].id

      let hasJoin = await this.hasJoined(result[0].id, V.flock_id)
      if (!hasJoin) { //查询结果为空，用户没有加入这个小队
        let apply = await this.check_message()
        console.log(apply)
        this.setData({
          isJoined: false
        })
      } else {
        this.setData({
          isJoined: true
        })
      }
    }
  },
  /**
   * 生命周期函数--检查用户是否登录以及是访客还是成员
   */
  onLoad: async function (options) {
    V.flock_id = options.id; //获取随页面传递而来的flock_id
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    wx.showLoading({
      title: '数据加载中',
      mask:true
    })
    await this.init()
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
    wx.hideLoading({
      success: (res) => {},
    })
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
      cancelColor: 'cancelColor',
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
      cancelColor: 'cancelColor',
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