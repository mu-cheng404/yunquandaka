import {
  $wuxCalendar
} from '../../dist/index'
const utils = require("../../utils/util")
var V = {
  id: "",
}
Page({
  tabChange: function (e) {
    console.log(e)
    let index = e.detail.key
    console.log(this.data.dateList[index])
    if (this.data.dateList[index] == undefined) { //如果没有数据
      this.queryDate(index)
    }
    this.setData({
      current: index
    })
    this.openCalendar(index)
  },
  openCalendar: function (index) {
    $wuxCalendar().open({
      value: this.data.dateList[index],
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
  },
  queryMember: async function () {
    let sql = `select u.id,u.nickName,u.avatarUrl from user as u ,joining as j,task as t where j.user_id = u.id and j.flock_id = t.flock_id and t.id = ${V.id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    console.log(result)

    this.setData({
      userList: result
    })
  },
  queryDate: async function (index) {
    let id = this.data.userList[index].id
    let sql = `select distinct r.date from record as r,punch as p where p.user_id = ${id} and r.task_id=${V.id}`

    let result = await utils.executeSQL(sql)

    result = result && JSON.parse(result)
    let array = []
    console.log(result)
    let length = result==[]?0:result.length
    for (let i = 0; i < length; i++) {
      array[i] = result[i].date
    }
    this.setData({
      ['dateList[' + index + ']']: array
    })
  },
  data: {
    userList: [],
    current: '0',
    dateList: [],
  },

  onLoad: async function (options) {
    V.id = options.id
    console.log(V.id)

    //查询这个目标下所有成员
    await this.queryMember()
    //依次查询每个人的打卡日期
    await this.queryDate(0)
    //打开日历
    this.openCalendar(0)
  },
})