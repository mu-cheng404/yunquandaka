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
    }],
    recommandList: []
  },
  /**
   * 页面加载
   */
  onLoad: async function (options) {
    
  },
  onUnload: async function (options) {
    wx.setStorageSync('homeloading', 0)
    await this.readClipboard(); //检查剪贴板

  },
  /**
   * 页面显示
   */
  onShow: async function () {
    //获取缓存，检测是否加载过
    let flag = wx.getStorageSync("homeloading");
    console.log("获取homeloading缓存=", flag);

    if (flag == 0) {
      console.log("第一次加载");
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    //守卫登录状态
    let start = new Date();
    const login = await utils.CheckLogin();
    console.log(login ? '已登录，当前global.user_id=' + globalData.user_id : '未登录')
    await new Promise((resolve, reject) => {
      this.getGroupList();
      this.getRecommand()
      this.getTargetList();
      console.log("成功获取数据")
      resolve()
    })
    let end = new Date();
    console.log("cost:",end-start,'ms');

    //取消加载
    //将缓存设置为1
    if (flag == 0) {
      console.log("取消加载");
      wx.hideLoading({
        success: (res) => {
          wx.setStorageSync('homeloading', 1)
        },
      })
    }
  },
  async readClipboard() {
    //读取用户粘贴板
    const gotoFlag = wx.getStorageSync('inviteGoto');
    console.log("gotoFlag=", gotoFlag, !gotoFlag);
    if (!gotoFlag) {
      const text = await wx.getClipboardData();
      const id = utils.find_num(text.data);
      console.log(id, id.length)
      if (id.length == 6) { //粘贴板满足情况
        let flock = await SQL.flock_select_by_id(id);
        if (flock != '[]') {
          flock = flock && JSON.parse(flock);
          const flockName = flock[0].name
          wx.showModal({
            cancelColor: 'cancelColor',
            title: "提示",
            showCancel: true,
            content: `为您找到“${flockName}”小组，是否前往`,
            success: res => {
              wx.setStorageSync('inviteGoto', 1)
              if (res.confirm) {
                wx.navigateTo({
                  url: `../flock/flock?id=${id}`,
                })
              } else {
                //pass
              }
            }
          })
        } else {
          console.log("没找到这个小组");
        }
      }
    }
  },
  /**
   * 获取推荐小组
   */
  async getRecommand() {
    let recommandList
    //查询缓存
    let flag = wx.getStorageSync('recommandList')
    if (flag) { //缓存存在，则从缓存获取
      console.log("从缓存中获取推荐小组列表")
      recommandList = flag
      this.setData({
        recommandList: recommandList
      })
    } else { //缓存不存在，则重新获取
      console.log("缓存不存在推荐小组列表，将从数据库重新获取")
      recommandList = await SQL.flock_select_recommandList()
      recommandList = recommandList && JSON.parse(recommandList)
      this.setData({
        recommandList: recommandList
      })
      wx.setStorageSync('recommandList', recommandList)
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
    if (result == "[]") {
      this.setData({
        groupList: [],
      })
    } else {
      result = result && JSON.parse(result)
      this.setData({
        groupList: result
      })
    }
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
      let result = await SQL.flock_search(globalData.user_id, value)
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
  onClear(e) {
    console.log('onClear', e)
    this.setData({
      error: true,
      value: '',
    })
  },
  onCancel(e) {
    console.log(e)
    this.setData({
      isFocus: false,
      value: ''
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