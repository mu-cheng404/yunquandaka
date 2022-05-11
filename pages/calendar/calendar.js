import {
  $wuxCalendar
} from '../../dist/index'
const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
var V = {
  id: "",
  uid: getApp().globalData.user_id
}
Page({

  data: {
    dateList: [],
    continuous:0,
    sum:0,
  },

  onLoad: async function (options) {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    V.id = options.id
    //查询当前用户的打卡记录
    await this.queryDate()
    //查询连续打卡时间和累计打卡时间
    let con = await SQL.task_query_continuous(V.id,V.uid)
    let sum = await SQL.task_query_sum(V.id,V.uid)
    this.setData({
      continuous:con,
      sum:sum
    })
    //打开日历
    this.openCalendar()
  },

  openCalendar: function (index) {
    $wuxCalendar().open({
      value: this.data.dateList,
      closeOnSelect: false,
      direction: "vertical",
      multiple: true,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          value: displayValues,
        })
      },
    })
    wx.hideLoading({})
  },

  /**
   * 查询当前用户的打卡日期列表
   */
  queryDate: async function () {
    let sql = `select distinct r.date from record as r where r.user_id = ${V.uid} and r.task_id=${V.id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    let array = []
    console.log(result)
    let length = result == [] ? 0 : result.length
    for (let i = 0; i < length; i++) {
      array[i] = result[i].date
    }
    this.setData({
      dateList: array
    })
  },
})