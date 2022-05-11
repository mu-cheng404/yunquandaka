const globalData = getApp().globalData
const utils = require("../../utils/util")
const message = require("../../utils/message")
const SQL = require("../../utils/sql")
var V = {
  loaded: false
}
Page({
  /**
   * 页面数据
   */
  data: {
    searchResult: {},
    value: "",
    current: 'tab1',
    groupList: [],
    targetList: [],
    isFocus: false,
    swiperIndex: "1",
    login: '', //用户登录状态
    button1: [{
      text: "新建"
    }],
    button2: [{
      text: "去收藏"
    }]
  },
  /**
   * 页面加载
   */
  onLoad: async function (options) {},
  onUnload:async function(options){
    wx.setStorageSync('homeloading', 1)
  },
  /**
   * 页面显示
   */
  onShow: async function () {
    //获取缓存，检测是否加载过
    let flag = wx.getStorageSync("homeloading")
    console.log(flag)
    if (flag == 0) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    let login = await utils.verifyLogin()
    // let login = 1 //跳过检查
    this.setData({
      login: login
    })
    if (login) {
      await this.getGroupList();
      await this.getTargetList();
    } else {
      wx.navigateTo({
        url: '../authorize/authorize',
      })
    }
    //取消加载
    //将缓存设置为1
    if (flag == 0) {
      wx.hideLoading({
        success: (res) => {
          wx.setStorageSync('homeloading', 1)
        },
      })
    }
  },
  /**
   * 用户点击去收藏
   */
  toCollect() {
    //检查是否有圈子
    if (this.data.groupList.length == 0) {
      utils.show_toast('加入圈子后才可收藏哦', 'forbidden')
    } else {
      wx.navigateTo({
        url: `../flock/flock?id=${this.data.groupList[0].id}`
      })
    }
  },
  /**
   * （程序）初始化
   * 1. 检查数据库是否有信息 打上标记
   * return 是否有信息
   */
  init: async function () {
    // 获取openid
    let openid = await (await wx.cloud.callFunction({
      name: "getOpenID"
    })).result.openid

    let sql = `select id from user where openid='${openid}'`
    let result = await utils.executeSQL(sql)
    utils.showDetail(result)
    if (result == '[]') { //指没有信息
      globalData.hasUserInfo = false
      return false
    } else { //有信息
      result = result && JSON.parse(result)
      globalData.hasUserInfo = true
      globalData.user_id = result[0].id
      return true
    }
  },
  /**
   * 获取团队信息
   */
  getGroupList: async function () {
    let result = await SQL.flock_select_count_by_uid(globalData.user_id)
    result = result && JSON.parse(result)
    this.setData({
      groupList: result
    })
  },
  /**
   * 获取目标清单
   */
  getTargetList: async function () {
    let myDate = utils.getCurrentFormatedDate()
    let result = await SQL.task_select_by_uid_and_over(globalData.user_id, myDate)
    result = result && JSON.parse(result)
    console.log("result", result)
    this.setData({
      targetList: result
    })
  },
  searchBlur: function (params) {
    this.setData({
      isFocus: false
    })
  },
  /**
   * 搜索框
   */
  searchInput: async function (e) {
    let value = e.detail.value
    if (value.length >= 1) {
      let sql = `select id,name,creater_id,exists(select id from joining where flock_id = flock.id and user_id = ${globalData.user_id}) as joined from flock where id like '${value}%' or name like '${value}%';`

      let result = await utils.executeSQL(sql)
      result = result && JSON.parse(result)

      this.setData({
        searchResult: result,
      })
    }
  },
  //搜索框内容发生改变
  onChange(e) {
    console.log('onChange', e)
    this.setData({
      value: e.detail.value,
    })
  },
  //搜索框聚焦
  onFocus(e) {
    this.setData({
      isFocus: true
    })
  },
  onCancel(e) {
    console.log(e)
    this.setData({
      isFocus: false,
    })
  },
  /**
   * 点击申请
   */
  toJoin: async function (e) {
    //发送通知
    let target = this.data.searchResult[e.currentTarget.id]
    await message.send_apply_message(globalData.user_id, target.creater_id, target.id)

    wx.showToast({
      title: '已申请',
      icon: "success"
    })

  },
  //获取搜索框焦点
  onSearch: function () {
    this.setData({
      isFocus: true
    })
  },
})