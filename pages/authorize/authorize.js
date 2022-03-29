const utils = require("../../utils/util")
import {
  $wuxDialog
} from '../../dist/index'
Page({
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
        sql = `insert into user values(${utils.randomsForSixDigit()},'${openid}','${userInfo.nickName}','${userInfo.avatarUrl}')`
        utils.executeSQL(sql)
        console.log("用户完成信息授权")
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
        let query = await that.queryAccess()
        // console.log(query)
        while (!query) {
          that.getSub()
          query = await that.queryAccess()
        }
        console.log("用户已经完成订阅授权")
        wx.navigateBack({
          delta: 1,
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
        sql = `insert into user values(${utils.randomsForSixDigit()},'${openid}','${userInfo.nickName}','${userInfo.avatarUrl}')`
        utils.executeSQL(sql)
        console.log("用户完成信息授权")

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
      list = res.subscriptionsSetting.itemSettings
      refer = {
        "XfpLvF_QtFsXoKcVz7sgMovDkTTW8wHhOa5mbwdiTTs": "accept",
        "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI": "accept",
        "V1M7ZJ09GIic3WyzkpRNU3XuXHaM-ORxs59YDGcPeSI": "accept"
      }
    })
    return JSON.stringify(refer) == JSON.stringify(list)
  },
  data: {
    loginFlag: "",
    subscribeFlag: ""
  },
  onLoad: async function (event) {
    let {
      loginFlag,
      subscribeFlag
    } = event
    this.setData({
      loginFlag: loginFlag,
      subscribeFlag: subscribeFlag
    })
    if (loginFlag != 1 && subscribeFlag == 1) { //用户没有登录但是订阅了
      console.log("用户没有授权信息 但是授权订阅")

    } else if (loginFlag != 1 && subscribeFlag != 1) { //用户没有登录也没有订阅
      console.log("用户没有授权信息 订阅")

    } else if (loginFlag == 1 && subscribeFlag != 1) { //用户登录了但是没有订阅
      console.log("用户授权信息 没有授权订阅")

    } else { //用户登录了也订阅了
      console.log("用户授权信息 订阅")
    }
    //没有授权就跳转到授权页面


    // let sql1 //查询用户是否存在
    // let sql2 //插入数据
    // let user_id

    // await wx.cloud.callFunction({
    //   name: "getOpenID",
    // }).then((res) => {
    //   let [id, openid, username, avatar] = [utils.randomsForSixDigit(), res.result.openid, "微信用户", "https://profile.csdnimg.cn/3/3/2/1_qq_42618566"]
    //   user_id = id;

    //   sql1 = `select id,nickName from user where openid='${openid}'`

    //   sql2 = `insert into user values(${id},'${openid}','${username}','${avatar}')`
    // })

    // let result = await utils.executeSQL(sql1) //查询数据库中是否已存在信息
    // result = result && JSON.parse(result)
    // if (result.length == 0) { //不存在
    //   //提示用户登录
    //   wx.showToast({
    //     title: 'title',
    //   })
    //   await utils.executeSQL(sql2) //插入一条
    //   console.log("是新用户，已经为其创建一条初始记录，id="+user_id)
    // } else { //存在
    //   user_id = result[0].id
    //   console.log("该用户已经登陆过 id="+user_id)
    // }

    // this.globalData.user_id = user_id;
    // this.globalData.hasUserInfo = result[0].nickName != "微信用户"
  },
})