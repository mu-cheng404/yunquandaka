const utils = require("../../utils/util")
Page({
  onChange: async function () {

  },
  onLoad: async function () {
    await this.getUserList()
  },
  /**
   * 获取用户列表
   */
  getUserList: async function () {
    let sql = `select * from user`
    let result = await utils.executeSQL(sql)
    if (result == "[]") { //返回数据为空

    } else {
      result = result && JSON.parse(result)
      this.setData({
        userList: result
      })
    }
  },
  /**
   * 获取小队列表
   */
  getGroupList:async function(){
    let sql = `select * from flock`
    let result = await utils.executeSQL(sql)
    if (result == "[]") { //返回数据为空

    } else {
      result = result && JSON.parse(result)
      this.setData({
        groupList: result
      })
    }
  },
  /**
   * 获取目标列表
   */
  getTargetList:async function(){
    let sql = `select * from task`
    let result = await utils.executeSQL(sql)
    if (result == "[]") { //返回数据为空

    } else {
      result = result && JSON.parse(result)
      this.setData({
        targetList: result
      })
    }
  },
  /**
   * swiperChange
   */
  tapChange: async function (e) {
    console.log('onTabsChange', e)
    const {
      key
    } = e.detail
    if(key==1&& this.data.groupList==""){
      await this.getGroupList()
    }else if(key ==2&& this.data.targetList==""){
      await this.getTargetList()
    }
    this.setData({
      index: key
    })
  },

  data: {
    index: 0,
    userList: [],
    groupList:[],
    targetList:[],
    right: [{
        text: '注销',
        style: 'background-color: #ddd; color: white',
      },
      {
        text: '修改',
        style: 'background-color: #F4333C; color: white',
      },
    ],
  },
  onClick: function (e) {
    console.log(e)
  },
})