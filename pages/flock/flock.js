const utils = require("../../utils/util")
let V = {
  flock_id: "",
}
const globalData = getApp().globalData
Page({

  toView: function () {
    wx.navigateTo({
      url: '../view/view?id='+this.data.list[this.data.targetIndex].id,
    })
  },
  targetTap: function (e) {
    let index = e.currentTarget.id
    let id = this.data.list[index].id
    wx.navigateTo({
      url: '../record/record?id=' + id,
    })
  },
  getSettingOftarget: async function (index) {
    if (this.data.list.length != 0) {
      //获取进度条数据
      let target = this.data.list[index]
      let id = target.id
      let all = this.data.avatarList.length //总人数
      let current = utils.getCurrentFormatedDate() //今日已打卡人数
      let sql1 = `select count(*) as num from record where date like '${current}%' and task_id=${id}`
      let result1 = await utils.executeSQL(sql1)
      result1 = result1 && JSON.parse(result1)
      result1 = result1[0].num
      let res = (result1 / all) * 100 //相除
      let end = target.end //计算总时间
      let start = target.start
      let Gap = utils.getDiffBetweenDate(start, end)
      let gap = utils.getDiffBetweenDate(current, end) //计算还剩下多少天
      console.log(Gap + ' ' + gap)
      let res2 = (1 - gap / Gap) * 100 //计算百分比
      this.setData({ //渲染数据
        ['targetInfo[' + index + '].progress.percent']: res,
        ['targetInfo[' + index + '].progress.text']: target.cycle == "每天" ? "今天" : "本周",
        ['targetInfo[' + index + '].circle.percent']: res2,
        ['targetInfo[' + index + '].circle.text']: gap
      })
      //获取打卡数据
      this.getRecordList(index)
    }
  },
  toOption: function () {
    wx.navigateTo({
      url: '../options/options?flock_id=' + V.flock_id,
    })
  },
  newTask: function () {
    wx.navigateTo({
      url: `../addtk/addtk?flock_id=${V.flock_id}`,
    })
  },
  navi_to_record: function (e) {
    let index = e.target.id
    let id = this.data.list[index].id

    wx.navigateTo({
      url: `../record/record?id=${id}`,
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    flock: {},
    current: [],
    right: [{
        text: '编辑',
        style: 'background-color: #ddd; color: white',
      },
      {
        text: '打卡',
        style: 'background-color: #F4333C; color: white',
      }
    ],
    hintMsg: {
      title: "空空如也",
      text: "现在前去打卡吧",
      visible: true
    },
    avatarList: [],
    targetIndex: 0,
    targetInfo: [{
      recordList: [],
      progress: {
        percent: "",
        text: ""
      },
      circle: {
        percent: "",
        text: ""
      },
    }]

  },
  /**
   * 获取头像
   */
  getAvatarList: async function () {
    let sql = `select avatarUrl from user,joining where joining.user_id = user.id and joining.flock_id = ${V.flock_id}`

    let result = await utils.executeSQL(sql);
    result = result && JSON.parse(result)
    console.log(result)
    this.setData({
      avatarList: result
    })
  },
  /**
   * 获取团队所有目标
   */
  getTaskList: async function () {
    await wx.cloud.callFunction({
      name: "mysql",
      data: {
        sql: `select id,name,cycle,weekday,clock,start,end from task where flock_id=${V.flock_id}`
      }
    }).then((res) => {
      let result = res.result
      console.log(result)
      this.setData({
        list: result
      })
    })
  },
  /**
   * 查询打卡信息
   * 输入：目标id
   * 输出：list
   */
  getRecordList: async function (index) {
    console.log("hahahahhahah")
    let sql = `select avatarUrl,nickName,content from user,punch,record where user.id = punch.user_id and record.id = punch.record_id and record.task_id = ${this.data.list[index].id}`
    let result = await utils.executeSQL(sql)
    result = result && JSON.parse(result)
    console.log(result)
    if (result.length > 0) {
      this.setData({
        ['targetInfo[' + index + '].recordList']: result,
        ['hintMsg.visible']: false
      })
    } else {
      this.setData({
        ['targetInfo[' + index + '].recordList']: result,
        ['hintMsg.visible']: true
      })
    }
  },
  /**
   * 切换目标
   */
  switchTarget: async function (e) {
    let id = e.detail.value
    console.log(this.data.targetInfo[id])
    if(this.data.targetInfo[id]==undefined){
      await this.getRecordList(id); 
      await this.getSettingOftarget(id) 
    }
    this.setData({targetIndex:id})

  },
  onClick(e) {
    let type = e.detail.index
    let index = e.detail.data
    console.log("我点击了")
    console.log(e.detail)
    let id = this.data.list[index].id
    if (type == 0) {
      wx.navigateTo({
        url: `../target/target?id=${id}`,
      })
    } else if (type == 1) {
      wx.navigateTo({
        url: `../record/record?id=${id}`,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.flock_id = options.id; //获取随页面传递而来的flock_id
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {

    await wx.cloud.callFunction({
      name: "mysql",
      data: {
        sql: `select * from flock where id =${V.flock_id}`
      }
    }).then((res) => {
      let result = res.result[0]
      console.log(result)
      this.setData({
        flock: result
      })
    })
    await this.getTaskList(); //获取target列表
    await this.getAvatarList(); //获取头像列表
    if (this.data.list.length != 0) {
      await this.getRecordList(0); //获取第一个target的打卡信息
      await this.getSettingOftarget(0) //获取第一个target的数据
    }
  },
  onShareAppMessage:function(res){
    if(res.from =="button"){
      console.log(res.target)
    }
    return {
      title:"快来加入我的小组",
    }
  }
})