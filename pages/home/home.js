const globalData = getApp().globalData
import {
  $wuxDialog
} from '../../dist/index'
const utils = require("../../utils/util")
var V = {
  loaded: "flase"
}
Page({
  searchBlur: function (params) {
    this.setData({
      isFocus: false
    })
  },
  /**
   * 点击目标
   */
  searchInput: async function (e) {
    let value = e.detail.value
    if (value.length >= 1) {

      let sql = `select id,nickName,1 as flag from user where id like '${value}%' or nickName like '${value}%' union select id,name,2 as flag from flock where id like '${value}%' or name like '${value}%'; `

      let result = await utils.executeSQL(sql)
      result = result && JSON.parse(result)

      console.log(result)
      this.setData({
        searchResult: result,
      })
    }


  },
  gotoTap: function (e) {
    let index = e.target.id
    let id = this.data.searchResult[index].id
    let flag = this.data.searchResult[index].flag
    let url
    if (flag == 1) { //用户
      url = "../"
    } else if (flag == 2) {
      url = `../flock/flock?id="${id}"`
    }
    wx.navigateTo({
      url: url,
    })
  },
  naviToFlock: function () {
    wx.navigateTo({
      url: '../flock/flock',
    })
  },
  //获取搜索框焦点
  onSearch: function () {
    this.setData({
      isFocus: true
    })
  },
  // 跳转到初始化页面
  creatGroup: function () {
    wx.navigateTo({
      url: '../init/init',
    })
  },
  /**
   * 页面数据
   */
  data: {
    searchResult: {},
    value: "",
    current: 'tab1',
    groupList: {},
    targetList: [],
    isFocus: false,
    swiperIndex: "1",
  },
  /**
   * 页面加载
   */
  onLoad: async function (options) {
  },
  /**
   * 页面显示
   */
  onShow: async function () {
    await this.showLoading()
    await this.getGroupList();
    await this.getTargetList();
    await this.hideLoading();
  },
  showLoading: async function () {
    await wx.showLoading({
      title: '冲刺中···',
      mask: true
    }).then((res) => {
      console.log(res)
    })
  },
  hideLoading: async function () {
    await wx.hideLoading()
  },
  myevent: function () {
    console.log("我被调用了")
  },

  // 标签页相关
  onChange(e) {
    console.log('onChange', e)
    this.setData({
      current: e.detail.key,
    })
  },
  onTabsChange(e) {
    console.log('onTabsChange', e)
    const {
      key
    } = e.detail
    const index = this.data.tabs.map((n) => n.key).indexOf(key)

    this.setData({
      key,
      index,
    })
  },
  onSwiperChange(e) {
    console.log('onSwiperChange', e)
    const {
      current: index,
      source
    } = e.detail
    const {
      key
    } = this.data.tabs[index]

    if (!!source) {
      this.setData({
        key,
        index,
      })
    }
  },
  // 与搜索框有关
  onChange(e) {
    console.log('onChange', e)
    this.setData({
      value: e.detail.value,
    })
  },
  onFocus(e) {
    console.log('onFocus', e)
    this.setData({
      isFocus: true
    })
  },
  onBlur(e) {
    console.log('onBlur', e)
  },
  onConfirm(e) {
    console.log('onConfirm', e)
  },
  onClear(e) {
    console.log('onClear', e)
    this.setData({
      value: '',
    })
  },
  onCancel(e) {
    this.setData({
      isFocus: fasle
    })

  },
  /**
   * 获取团队信息
   */
  getGroupList: async function () {
    let sql = `select id,name from flock where id in ( select flock_id from joining where user_id = ${globalData.user_id})`
    console.log(sql)
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)

    console.log(result)
    this.setData({
      groupList: result
    })

  },
  /**
   * 获取目标清单
   */
  getTargetList: async function () {
    //获取所有与我有关的目标
    let sql = ` select t.id,t.name as task_name,t.cycle,t.clock,0 as over,f.name as flock_name from task as t,joining as j ,flock as f where t.flock_id = j.flock_id and t.flock_id = f.id and j.user_id = ${globalData.user_id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    console.log("result", result)
    //生成id组
    let idArray = []
    for (let i = 0; i < result.length; i++) {
      idArray[i] = result[i].id
    }
    console.log(idArray)
    //找到今日打过卡的目标id
    let myDate = utils.getCurrentFormatedDate()
    console.log(myDate)
    let sql2 = `select t.id,1 as over from task as t,punch as p,record as r where p.user_id = ${globalData.user_id} and p.record_id = r.id and r.date='${myDate}' and r.task_id = t.id and t.id in (${idArray})`
    let result2 = await utils.executeSQL(sql2)
    result2 = result && JSON.parse(result2)
    console.log("result2", result2)

    //处理数据 标记完成或者未完成
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result2.length; j++) {
        if (result[i].id == result2[j].id) {
          result[i].over = 1
          break;
        } else {
          result[i].over = 0
        }
        console.log(result[i].over)
      }
    }

    this.setData({
      targetList: result
    })
  },
  /**
   * 点击团队列表
   */
  groupTap: function (e) {
    let index = e.currentTarget.id
    console.log(e)
    let flock_id = this.data.groupList[index].id
    console.log(flock_id)
    wx.navigateTo({
      url: `../flock/flock?id=${flock_id}`,
    })
  },
  /**
   * 点击目标列表
   */
  targetTap: function (e) {
    let index = e.currentTarget.id
    console.log(e)
    let id = this.data.targetList[index].id
    wx.navigateTo({
      url: `../record/record?id=${id}`,
    })
  }
})