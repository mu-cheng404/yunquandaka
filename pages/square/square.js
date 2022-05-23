const utils = require("../../utils/util")
const SQL = require("../../utils/sql")

const message = require("../../utils/message")
const app = getApp()
const globalData = app.globalData
import {
  $startWuxRefresher,
  $stopWuxRefresher,
  $stopWuxLoader,
} from '../../dist/index'
Page({

  data: {
    orders: true,
    swiper: [],
    rankList: [], //排行榜数据
    reList: [], //推荐小队数据
    rList: [], //心得数据
    windowHeight: "", //可使用窗口高度
    windowWidth: '',
    pixelRatio: "", //屏幕像素比
    tabBarHeight: "", //tab栏的高度
    current: "tab1", //当前的标签
    current_1: "1", //小标签栏的标签
    refresh: false,
  },
  onLoad: async function () {

    //获取海报链接
    let list = await SQL.poter_select()
    list = list && JSON.parse(list)
    this.setData({
      swiper: list
    })
    console.log(globalData.tabBarHeight, '------------------------')
    //获取屏幕
    this.setData({
      pixelRatio: globalData.systeminfo.pixelRatio,
      windowHeight: globalData.systeminfo.windowHeight,
      windowWidth: globalData.systeminfo.windowWidth,
      tabBarHeight: globalData.tabBarHeight
    })

  },
  onShow: async function () {
     //获取缓存，检测是否加载过
     let flag = wx.getStorageSync("squareloading")
     console.log(flag)
     if (flag == 0) {
       wx.showLoading({
         title: '加载中',
         mask: true
       })
     }
    await this.getRankList()
    await this.getrList()
    //取消加载
    //将缓存设置为1
    if (flag == 0) {
      wx.hideLoading({
        success: (res) => {
          wx.setStorageSync('squareloading', 1)
        },
      })
    }
  },
  onUnload(){
    wx.setStorageSync('squareloading', 0)
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

    if (this.data.current == 'tab1') {
      await this.getrList()
    } else if (this.data.current == 'tab2') {
      await this.getRecommandList("宿舍")
    } else if (this.data.current == 'tab3') {
      await this.getRankList()
    }

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
  handeItemChange(e) {
    //接收传递过来的参数
    const {
      index
    } = e.detail;
    let {
      tabs
    } = this.data;

    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    this.setData({
      tabs
    })

  },

  /**
   * 获取经验列表
   * @returns rList 对象数组（按时间排序）
   * {id,wirtter_name,writter_url,time,content}
   */
  getrList: async function () {
    let rList = await SQL.record_select_all(globalData.user_id)
    rList = rList && JSON.parse(rList)
    this.setData({
      rList: rList
    })
  },
  /**
   * 获取排行榜列表
   * @returns rList 排行榜信息数组 (以元气值排名)
   * {*}
   */
  getRankList: async function () {
    let date = utils.getCurrentFormatedDate();
    let rList = await SQL.flock_select_order_by_value(date) //执行
    rList = rList && JSON.parse(rList) //处理数据
    this.setData({
      rankList: rList
    })
  },
  /**
   * 获取推荐圈子列表(随机推荐)
   * @param {*} type 类型
   */
  getRecommandList: async function (type) {
    //找出所有的不属于自己的圈子
    let reList = await SQL.flock_select_by_type(type, globalData.user_id) //执行
    reList = reList && JSON.parse(reList) //处理数据
    this.setData({
      reList: reList
    })

  },
  /**
   * 给打卡点赞
   * @param {*} e 
   */
  async like(e) {
    wx.showLoading({
      title: '加载中',
      mask:true,
    })
    //获取数据
    let index = e.currentTarget.id
    let record = this.data.rList[index]
    //修改页面数据
    this.setData({
      ['rList[' + index + '].isLike']: 1,
      ['rList[' + index + '].like_num']: this.data.rList[index].like_num + 1,
    })
    //修改数据库
    await SQL.record_like(record.id, globalData.user_id)
    //反馈
    utils.show_toast("点赞成功！")
    //生成点赞通知
    wx.hideLoading({
    })
    await message.send_like_message(globalData.user_id,record.user_id,record.flock_id,record.task_id,record.id)
  },
  /**
   * 给打卡取消点赞
   * @param {*} e 
   */
  async cancelLike(e) {
    wx.showLoading({
      title: '处理中',
      mask:true
    })
    //获取数据
    let index = e.currentTarget.id
    let record = this.data.rList[index]
    //修改页面数据
    this.setData({
      ['rList[' + index + '].isLike']: 0,
      ['rList[' + index + '].like_num']: this.data.rList[index].like_num - 1,
    })
    //修改数据库
    await SQL.record_cancel_like(record.id, globalData.user_id)
    //反馈
    utils.show_toast("已取消")
    wx.hideLoading({
      success: (res) => {},
    })
  },
  /**
   * 切换tab
   * @param {} e 
   */
  async onTabsChange(e) {
    console.log(e)
    let key = e.detail.key
    if (key == 'tab1') {
      await this.getrList()
    } else if (key == "tab2") {
      await this.getRecommandList('宿舍')
    } else if (key == 'tab3') {
      await this.getRankList()
    }
    this.setData({
      current: key
    })
  },
  /**
   * 切换推荐小队的tab
   */
  async onTabsChange_1(e) {
    console.log(e)
    let key = e.detail.key
    if (key == "1") {
      await this.getRecommandList("伙伴")
    } else if (key == "2") {
      await this.getRecommandList("班级")
    } else if (key == "3") {
      await this.getRecommandList("宿舍")
    } else if (key == "4") {
      await this.getRecommandList("社团")
    } else if (key == "5") {
      await this.getRecommandList("组织")
    }
    this.setData({
      current_1: key
    })
  },
 
})