const utils = require("../../utils/util")
import {
  $wuxDialog
} from '../../dist/index'
const globalData = getApp().globalData
Page({
  data: {
    loginFlag: "",
    subscribeFlag: "",
    user_id: ""
  },
  /**
   * 用户点击游客访问
   */
  vistor: function(){
    //拒绝登录信息加入缓存
     wx.setStorageSync('refuse', true)
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 修改全局变量
   */
  setGlobalData: function (params) {
    globalData.user_id = this.data.user_id
    globalData.hasUserInfo = true
  },
  /**
   * 用户授权
   */
  getInfo: async function () {
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
          user_id: id,
        })
        utils.executeSQL(sql)
        console.log("用户完成信息授权")
        this.setGlobalData()
        wx.navigateBack({
          delta: 1,
        })
      },
      fail: (res) => {
        console.log("用户拒绝了信息授权")
      }
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
  onLoad:async function(){

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