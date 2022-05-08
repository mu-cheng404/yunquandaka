const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
const globalData = getApp().globalData
var V = {
  flock_id:'',
}
Page({
  data: {
    list: [],
    value: ['1'],
  },
  async onLoad(options) {
    V.flock_id = options.id
    let list = await SQL.flock_select_member_expect_creater(V.flock_id)
    if(list != "[]"){
      list = list && JSON.parse(list)
      this.setData({list:list})
    }
  },
  onChange(field, e) {
    const {
      value
    } = e.detail
    const data = this.data[field]
    const index = data.indexOf(value)
    const current =
      index === -1 ? [...data, value] : data.filter((n) => n !== value)

    this.setData({
      [field]: current,
    })

    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  },
  onChange1(e) {
    this.onChange('value', e)
  },
  async formSubmit(e) {
    let select = e.detail.value.a
    console.log(select)
    let list = []
    let j = 0
    for (let i = 0; i < select.length; i++) {
      list[j++] = this.data.list[select[i]]
    }
    console.log('form发生了submit事件，携带数据为：', list)
    wx.setStorage({
      key:"list",
      data:list
    })
    wx.navigateBack({
      delta: 1,
    })
  },
})