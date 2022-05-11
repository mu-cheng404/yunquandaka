const utils = require("../../utils/util")
const globalData = getApp().globalData
Page({
  data: {
    list: [{
      task_id: "", //计划ID
      flock_id: "", //圈子ID
      duration: "", //计划时长
      sum: '', //累计打卡天数
      rate: "", //打卡率
      grade: "", //自我评分

      task_name: "", //计划名字
      flock_name: "", //圈子名字
      type: "", //圈子类型（决定图标）
      start: "", //计划开始时间
      end: "", //计划结束时间
    }]
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