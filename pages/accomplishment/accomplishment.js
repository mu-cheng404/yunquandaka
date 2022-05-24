const utils = require("../../utils/util")
const globalData = getApp().globalData
Page({
  data: {
    list: []
  },
  async onLoad(options) {
    let list = await this.getList()
    this.setData({
      list: list
    })

  },
  async getList() {
    let sql = `select a.*,t.name as task_name,t.type,t.start,t.end,f.name as flock_name from accomplish as a,task as t,flock as f where a.user_id = ${globalData.user_id} and a.task_id = t.id and a.flock_id = f.id`
    let res = await utils.executeSQL(sql)
    res = res && JSON.parse(res)
    console.log(res)
    return res
  },

})