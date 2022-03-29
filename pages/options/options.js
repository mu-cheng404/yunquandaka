let V = {
  flock_id: ""
}
const utils = require("../../utils/util")
Page({
  deleteGroup: function (params) {
    //提醒用户
    wx.showModal({
      content: "确定删除该小队？",
      cancelColor: 'cancelColor',
      cancelText: "确定",
      confirmText: "手滑了",
      confirmColor: "black",
      success: async (res) => {
        if (!res.confirm) { //用户点击确定
          let sql1 = `delete from joining where flock_id=${V.flock_id}`
          let sql = `delete from flock where id=${V.flock_id}`
          await utils.executeSQL(sql1)
          await utils.executeSQL(sql)
          //返回主页面
          wx.switchTab({
            url: '../home/home',
          })
        }
      }
    })
  },
  adjust: function () {
    this.setData({
      adjust: !this.data.adjust
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
    this.setData({
      buttonLoading: true
    })

    //更新数据库里flock的信息
    let sql = `update flock set name="${this.data.valueOfName}",state="${this.data.valueOfState}" where id=${V.flock_id}`
    await utils.executeSQL(sql)
    //收回adjust状态
    this.setData({
      adjust: !this.data.adjust
    })

    wx.showToast({
      title: '修改成功'
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    value1: [],
    displayValue1: "是",
    options: [{
      value: '1',
      label: "是"
    }, {
      value: '0',
      label: "否"
    }, ],
    visible: false,
    adjust: false,
    valueOfName: "",
    valueOfState: "",
    flag: true,
    buttonLoading: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.flock_id = options.flock_id
    let sql = `select name,state from flock where id=${V.flock_id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    console.log(result)
    this.setData({
      valueOfName: result[0].name,
      initName: result[0].name,
    })

  },
  setValue(values, key) {
    this.setData({
      [`value${key}`]: values.value,
      [`displayValue${key}`]: values.label,
    })
  },
  onConfirm(e) {
    const {
      index
    } = e.currentTarget.dataset
    this.setValue(e.detail, index)
    console.log(`onConfirm${index}`, e.detail)
  },
  onValueChange(e) {
    const {
      index
    } = e.currentTarget.dataset
    console.log(`onValueChange${index}`, e.detail)
  },
  onClick() {
    this.setData({
      visible: true
    })
  },
})