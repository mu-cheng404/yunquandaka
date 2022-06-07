const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
import {
  $wuxDialog
} from '../../dist/index'
const globalData = getApp().globalData
Page({
  data: {
    banner: ["http://ccreblog.cn/wp-content/uploads/2022/05/1.png", "http://ccreblog.cn/wp-content/uploads/2022/05/2.png", "http://ccreblog.cn/wp-content/uploads/2022/05/4.png", "http://ccreblog.cn/wp-content/uploads/2022/05/3.png"],
    currendIndex: 0,
    endIndex: 3,
    loginFlag: "",
    subscribeFlag: "",
    user_id: "",
    showButton: false,
    check:false,
  },
  /**
   * 用户点击游客访问
   */
  vistor: function () {
    //拒绝登录信息加入缓存
    wx.setStorageSync('refuse', true)
    wx.navigateBack({
      delta: 1,
    })
  },
  fanye: function (e) {
    console.log(e)
    let current = e.detail.current
    if (current == this.data.endIndex) {
      this.setData({
        showButton: true
      })
    } else {
      this.setData({
        showButton: false
      })
    }
  },
  /**
   * 修改全局变量
   */
  setGlobalData: function (params) {
    globalData.user_id = this.data.user_id
    globalData.hasUserInfo = true
  },
  radioChange(e){
    console.log(e)
    if(e.detail.value == "agree"){
      this.setData({check:true})
    }
  },
  goto(){
    wx.navigateTo({
      url: '../protocol/protocol',
    })
  },
  /**
   * 用户授权
   */
  getInfo: async function () {
    if(!this.data.check){
      utils.show_toast('请先勾选隐私政策与隐私协议','forbidden')
      return
    }
    let openid, userInfo, sql
    //弹窗获取用户信息
    wx.getUserProfile({
      desc: "获取头像和昵称信息",
      success: async (res) => {
        userInfo = res.userInfo

        //获取用户openid
        await wx.cloud.callFunction({
          name: "getOpenID"
        }).then(res => {
          openid = res.result.openid
        })
        this.setData({
          user_id: id,
        })
        //插入数据库
        let [id, nickName, avatarUrl] = [utils.randomsForSixDigit(),userInfo.nickName,userInfo.avatarUrl]
        await SQL.user_insert(id, openid, nickName, avatarUrl) 
        //初始化一些数据
        await this.initData(id)
        console.log("用户完成信息授权")
        //设置全局变量
        this.setGlobalData()
        //设置缓存
        await wx.setStorage({
          key: "user_id",
          data: id
        })
        wx.navigateBack({
          delta: 1,
        })
      },
      fail: (res) => {
        console.log("用户拒绝了信息授权")
      }
    })
  },
  /**
   * 初始化一些数据
   * @param {*} id 用户id
   */
  async initData(user_id){
    wx.showLoading({
      title: '初始化中',
    })
    //插入一个提示用的小组
    let [fid, creater_id, fname, fstate, avatarUrl, ftype] = [utils.randomsForSixDigit(),user_id,'hello！','新建在右上角|右上角设置删除该引导',globalData.logo,'组织']
    await SQL.flock_insert(fid, creater_id, fname, fstate, avatarUrl, ftype)
    //在小组内插入一个提示用的计划
    let [tid, tname, tstate, creator, ttype, tform, defaultText, flock_id, tcycle, tweekday, tclock, tstart, tend] = [utils.randomsForSixDigit(),'底部新建计划|点击头像查看成员','点击星星收藏计划',user_id,"学习",'图片','默认文本',fid,'每天','周一','08:00',utils.formatTime(new Date()).slice(0, 10),"2032-05-31"]
    await SQL.task_insert(tid, tname, tstate, creator, ttype, tform, defaultText, flock_id, tcycle, tweekday, tclock, tstart, tend)
    //在记录内插入一个提示用的打卡
    let [id,uid, date, time, content, url, duration] = [utils.randomsForSixDigit(),user_id,utils.formatTime(new Date()).slice(0, 10), utils.formatTime(new Date()).slice(11, 19),'右上角修改信息|右下角打卡 | 点击进入详情页面|详情页删除打卡','','']
    await SQL.record_insert(id, fid, tid, uid, date, time, content, url, duration)
    wx.hideLoading({
      success: (res) => {},
    })
  },
  getSub: async function () {
    let that = this
    $wuxDialog().confirm({
      resetOnClose: true,
      closable: true,
      title: '订阅',
      content: '为了良好的使用体验，请您授权以下权限，并勾选“不在提醒”',
      async onConfirm(e) {
        await wx.requestSubscribeMessage({
          tmplIds: ["XfpLvF_QtFsXoKcVz7sgMovDkTTW8wHhOa5mbwdiTTs",
            "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI",
            "V1M7ZJ09GIic3WyzkpRNU3XuXHaM-ORxs59YDGcPeSI"
          ],
        }).then(async (res) => {
          console.log("查询用户权限结果", res)
          let query = await that.queryAccess()
          if (!query) {
            that.getSub()
          }
          console.log("用户已经完成订阅授权")
          wx.navigateBack({
            delta: 1,
          })
        })

      }
    })
  },
  getInfoAndSub: async function () {
    let openid, userInfo, sql
    //弹窗获取用户信息
    wx.getUserProfile({
      desc: "获取头像和昵称信息",
      success: async (res) => {
        userInfo = res.userInfo
        //获取用户openid
        await wx.cloud.callFunction({
          name: "getOpenID"
        }).then(res => {
          openid = res.result.openid
        })
        let id = utils.randomsForSixDigit()
        sql = `insert into user values(${id},'${openid}','${userInfo.nickName}','${userInfo.avatarUrl}')`
        this.setData({
          user_id: id
        })
        utils.executeSQL(sql)
        console.log("用户完成信息授权")
        this.setGlobalData()
        this.getSub()
      },
      fail: (res) => {
        console.log("用户拒绝了信息授权")
      }
    })
  },
  queryAccess: async function () {
    let list, refer
    await wx.getSetting({
      withSubscriptions: true,
    }).then((res) => {
      console.log("用户的情况", res)
      list = res.subscriptionsSetting.itemSettings
      refer = {
        "XfpLvF_QtFsXoKcVz7sgMovDkTTW8wHhOa5mbwdiTTs": "accept",
        "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI": "accept",
        "V1M7ZJ09GIic3WyzkpRNU3XuXHaM-ORxs59YDGcPeSI": "accept"
      }
    })
    return JSON.stringify(refer) == JSON.stringify(list)
  },
  onLoad: async function () {

  },
  // onLoad: async function (event) {
  //   let {
  //     loginFlag,
  //     subscribeFlag
  //   } = event
  //   this.setData({
  //     loginFlag: loginFlag,
  //     subscribeFlag: subscribeFlag
  //   })
  //   if (loginFlag != 1 && subscribeFlag == 1) { //用户没有登录但是订阅了
  //     console.log("用户没有授权信息 但是授权订阅")

  //   } else if (loginFlag != 1 && subscribeFlag != 1) { //用户没有登录也没有订阅
  //     console.log("用户没有授权信息 订阅")

  //   } else if (loginFlag == 1 && subscribeFlag != 1) { //用户登录了但是没有订阅
  //     console.log("用户授权信息 没有授权订阅")

  //   } else { //用户登录了也订阅了
  //     console.log("用户授权信息 订阅")
  //   }
  // },

})