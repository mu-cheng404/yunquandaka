const utils = require("../../utils/util")
var V = {
  id: ""
}
Page({
  deleteTarget:function(){
     //提醒用户
     wx.showModal({
      content: "确定删除该目标？",
      cancelColor: 'cancelColor',
      cancelText: "确定",
      confirmText: "手滑了",
      confirmColor: "black",
      success: async (res) => {
        if (!res.confirm) { //用户点击确定
          let sql = `delete from task where id=${V.id}`
          await utils.executeSQL(sql)
          //返回小队页面
          wx.navigateBack({
            delta: 1,
          })
        }
      }
    })
  },
  onChangeOfNameInput(e) {
    this.setData({
      valueOfName: e.detail.value,
      flag: false
    })
  },
  onChangeOfStateInput(e) {
    this.setData({
      valueOfState: e.detail.value,
      flag: false
    })
  },
  submit: async function () {
    //更新数据库里flock的信息
    let sql = `update task set name="${this.data.valueOfName}",state="${this.data.valueOfState}" where id=${V.id}`
    await utils.executeSQL(sql)
    //收回adjust状态
    this.setData({
      adjust: !this.data.adjust
    })
    wx.showToast({
      title: '修改成功'
    })
  },
  adjust: function () {
    this.setData({
      adjust: !this.data.adjust
    })
  },
  data: {
    adjust: false,
    valueOfName: "",
    valueOfState: "",
    flag: true,
  },
  getInitTargetInfo: async function () {
    let sql = `select name,state from task where id=${V.id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    console.log(result)
    this.setData({
      valueOfName: result[0].name,
      valueOfState: result[0].state
    })
  },
  onLoad: async function (options) {
    V.id = options.id
    await this.getInitTargetInfo()
  },
})