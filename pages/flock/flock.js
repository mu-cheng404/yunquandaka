const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
const message = require("../../utils/message")
let V = {
  flock_id: "",
}
const globalData = getApp().globalData
const sliderWidth = 96
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName: "", //用户昵称
    admin: false,
    unfold: "false",
    flock: '',
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
    }],
    isJoined: false,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    buttons: [{
      text: '点击加入'
    }],
    refresh: false, //下拉刷新
    list: [],
    options_admin: ['修改小组信息', '设置通告', '修改昵称', '解散小组'],
    options: ['退出小组', '修改昵称'],
  },
  /**
   * 生命周期函数
   */
  onLoad: function (options) {
    V.flock_id = options.id; //获取随页面传递而来的flock_id


  },
  onUnload: async function (options) {
    wx.setStorageSync('loading', 0)
    console.log("缓存已清除")
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let loadFlag = wx.getStorageSync("loading")
    console.log("缓存中拿到loading", loadFlag)
    if (!loadFlag) { //没有显示过加载中 flag = 0
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    await new Promise((resolve, reject) => {
      //集中力量办大事
      utils.CheckLogin(); //守卫登录状态（独立）
      this.getAdmin(); //查询身份（独立）
      this.getJoin(); //查询加入
      this.getNickName(); //查询昵称
      this.getBaseInfo(); //查询小组基本信息
      this.getTaskList(); //获取任务列表
      this.getAvatarList(); //获取头像列表
      resolve();
    })

    this.setData({
      //数据更新
      pixelRatio: globalData.systeminfo.pixelRatio,
      windowHeight: globalData.systeminfo.windowHeight,
      windowWidth: globalData.systeminfo.windowWidth,
      tabBarHeight: globalData.tabBarHeight
    })

    if (!loadFlag) { //没有显示过加载中
      wx.hideLoading({
        success: (res) => {},
      })
      wx.setStorageSync('loading', 1) //将标志设置成1
      console.log("将缓存设置成", 1)
    }
  },
  async getAdmin() {
    //获取身份
    let admin = await SQL.flock_check_admin(V.flock_id, globalData.user_id);
    this.setData({
      admin: admin,
    });
  },
  async getJoin() {
    //获取加入状态
    let join = await SQL.flock_check_member(V.flock_id, globalData.user_id); //查询加入状态(独立)
    this.setData({
      isJoined: join
    });
  },
  async getNickName() {
    //获取昵称
    let nickName = await SQL.joining_select_nickName_by_fid_uid(V.flock_id, globalData.user_id); //查询在该小组中的昵称（独立）
    this.setData({
      nickName: nickName
    });
  },
  optionTap() {
    let that = this
    let flock = this.data.flock
    let [admin, options, options_admin] = [this.data.admin, this.data.options, this.data.options_admin]
    wx.showActionSheet({
      itemList: admin ? options_admin : options,
      success: async res => {
        let option = res.tapIndex
        if (admin) { //管理员
          if (option == 0) { //修改信息
            wx.navigateTo({
              url: `../init/init?type=2&id=${V.flock_id}`,
            })
          } else if (option == 1) { //修改通告
            wx.showModal({
              title: "设置通告",
              content: flock.notice ? flock.notice : '',
              editable: true,
              success: async res => {
                let {
                  confirm,
                  content
                } = res;
                if (confirm) { //点击确定
                  await SQL.flock_update_notice(V.flock_id, content);
                  that.setData({
                    'flock.notice': content
                  })
                  utils.show_toast("设置成功");
                } else { //点击取消
                  //pass
                }
              }
            })
          } else if (option == 3) { //解散小组
            wx.showModal({
              title: "提示",
              content: "解散后，所有的信息将会被清除，请再次确定",
              success: async (res) => {
                if (res.confirm) { //用户点击确定
                  await SQL.flock_delete(V.flock_id)
                  utils.show_toast('解散成功')
                  wx.switchTab({
                    url: '../home/home',
                  })
                }
              }
            })
          } else if (option == 2) {
            await that.updateNickName()
          }
        } else {
          if (option == 0) {
            wx.showModal({
              title: "提示",
              content: "退出小组后，您的所有信息将会被清除",
              success: async (res) => {
                if (res.confirm) { //用户点击确定
                  let [flock_id, user_id] = [V.flock_id, globalData.user_id]
                  await SQL.flock_quit(flock_id, globalData.user_id)
                  //返回主页面
                  utils.show_toast("退出成功！")
                  wx.switchTab({
                    url: '../home/home',
                  })
                }
              }
            })
          } else if (option == 1) {
            await that.updateNickName()
          }
        }
      }
    })
  },
  /**
   * 弹窗更新昵称
   */
  async updateNickName() {
    let nickName = await SQL.joining_select_nickName_by_fid_uid(V.flock_id, globalData.user_id)
    wx.showModal({
      title: "修改昵称",
      content: "",
      editable: true,
      success: async res => {
        let {
          content,
          confirm
        } = res
        if (confirm) {
          this.setData({
            nickName: content
          })
          //处理
          wx.showLoading({
            title: '处理中',
            mask: true
          })
          //添加数据
          let [user_id, flock_id, nickName] = [globalData.user_id, V.flock_id, content]
          await SQL.joining_update_nickName_by_fid_uid(nickName, flock_id, user_id)

          wx.hideLoading({
            success: async res => {},
          })
          utils.show_toast("修改成功")
        }
      }
    })
  },
  /**
   * 处理用户点击邀请
   */
  async HandleInvite() {
    const flock = this.data.flock;
    let content = `我正在“${flock.name}”小组打卡，ID是${flock.id}，附制☞这段话，打开云圈打卡小程序加入吧`
    wx.showActionSheet({
      itemList: ['生成小程序邀请码', '生成邀请连接', '分享给好友'],
      success: res => {
        const index = res.tapIndex;
        switch (index) {
          case 0:
            wx.showLoading({
              title: '生成中',
              mask: true,
            });
            wx.cloud.callFunction({
              name: "CreateQRCode",
              data: {
                id: flock.id,
              },
              success: res => {
                console.log(res);
                const buffer = res.result.buffer;

              },
              fail:err=>{
                utils.show_toast("出错了","forbidden");
              }
            })
            wx.hideLoading();
            break;
          case 1:
            wx.showModal({
              title: '提示',
              content: content,
              showCancel: true,
              confirmText: '复制',
              success: res => {
                if (res.confirm) {
                  wx.setClipboardData({
                    data: content,
                    success: res => {
                      
                    }
                  })
                }
              }
            })
            break;
          case 2:
            utils.show_toast("可点击右上角分享");
            break;
          default:
            break;
        }

      }
    })
  },
  /**
   * 处理用户点击展开或者收起
   */
  unfold() {
    this.setData({
      unfold: !this.data.unfold
    })
  },
  /**
   * 下拉刷新被触发
   * @param {*} e 
   */
  async refresh() {
    this.setData({
      refresh: true
    })
    console.log("refresh")
    await this.getTaskList()
    this.setData({
      refresh: false
    })
  },
  /**
   * 下拉刷新被复位
   */
  async restore() {
    console.log("restore")
  },
  /**
   * 下拉刷新被终止
   */
  async abort() {
    console.log("abort")
  },
  /**
   * 直接加入
   */
  async to_join() {
    let that = this
    //检查订阅
    let res = await wx.requestSubscribeMessage({
      tmplIds: [
        "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI"
      ]
    })
    if (res['MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI'] == 'reject') {
      await wx.showToast({
        title: '订阅消息失败',
        icon: "error"
      })
    }
    let name = await SQL.user_select_name_by_id(globalData.user_id)
    //提示输入昵称，在设置里可修改
    wx.showModal({
      title: "输入小组昵称",
      content: name,
      editable: true,
      showCancel: false,
      success: async res => {
        let {
          content,
          confirm
        } = res
        if (confirm) {
          //处理
          wx.showLoading({
            title: '处理中',
            mask: true
          })
          //添加数据
          let [user_id, flock_id, nickName] = [globalData.user_id, V.flock_id, content]
          await SQL.joining_insert(user_id, flock_id, nickName)
          wx.hideLoading({
            success: async res => {},
          })
          utils.show_toast("加入成功")
          await this.onShow()
        }
      }
    })
    console.log(res)
  },
  /**
   * 用户预览头像
   */
  async previewImage() {
    wx.previewImage({
      urls: [this.data.flock.avatarUrl],
    })
  },

  toView: function () {
    wx.navigateTo({
      url: '../view/view?id=' + this.data.list[this.data.targetIndex].id,
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
    }
  },
  toOption: function () {
    wx.navigateTo({
      url: '../options/options?flock_id=' + V.flock_id,
    })
  },

  /**
   * 收藏项目
   */
  collect: async function (e) {
    //判断是否加入
    if (!this.data.isJoined) {
      utils.show_toast("您还不是该小组成员！", 'forbidden')
      return
    }
    console.log(e)
    let index = e.currentTarget.id
    let task = this.data.list[index]
    let flag = task.collect
    if (flag == 1) { //用户已收藏
      wx.showModal({
        title: "提示",
        content: "取消后项目在主页将不可见",
        success: res => {
          if (res.confirm) { //用户点击确定
            let sql = `delete from collect where task_id = ${task.id} and user_id = ${globalData.user_id}`
            utils.executeSQL(sql)

            this.setData({
              ['list[' + index + '].collect']: 0
            })
            utils.show_toast('已取消')
          } else { //用户点击取消

          }
        }
      })
    } else { //用户未收藏


      //数据库添加收藏记录
      let sql = `insert into collect(task_id,user_id) values(${task.id},${globalData.user_id})`
      utils.executeSQL(sql)

      //修改list的collect值
      this.setData({
        ['list[' + index + '].collect']: 1
      })

      utils.show_toast('已收藏，将在主页展示')

    }
  },
  async getBaseInfo() {
    //获取小组基本信息
    let result = await SQL.flock_select_by_id(V.flock_id)
    result = result && JSON.parse(result)
    if (result.length == 0) {
      utils.show_toast("小组不存在", 'forbidden')
      return
    } else {
      this.setData({
        flock: result[0]
      })
    }
  },
  /**
   * 获取头像列表
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
    let result = await SQL.task_select_by_fid_uid(V.flock_id, globalData.user_id)
    if (result != '[]') {
      result = result && JSON.parse(result)
      this.setData({
        list: result
      })
    }
  },
  /**
   * 切换目标
   */
  switchTarget: async function (e) {
    let id = e.detail.value
    console.log(this.data.targetInfo[id])
    if (this.data.targetInfo[id] == undefined) {
      await this.getRecordList(id);
      await this.getSettingOftarget(id)
    }
    this.setData({
      targetIndex: id
    })

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
   * 查询用户是否存在
   */
  hasUserInfo: async function () {
    let openid = await wx.cloud.callFunction({
      name: "getOpenID"
    })
    openid = openid.result.openid
    let sql = `select id from user where openid='${openid}'`
    let result = await utils.executeSQL(sql)
    if (result == "[]") { //结果为空，说明该用户是新用户
      return {
        hasUser: 0,
        result: result
      }
    } else {
      return {
        hasUser: 1,
        result: result
      }
    }
  },
  /**
   * 检查是否已经申请过
   */
  async check_message() {
    let sql = `select exists(id) from message where sender_id=${globalData.user_id} and url='../task/task?id=${this.data.flock.id}'`
    let res = await utils.executeSQL(sql)
    res = res && JSON.parse(res)
    console.log(res)
  },
  onShareAppMessage: function (res) {
    if (res.from == "button") {
      console.log(res.target)
    }
    return {
      title: "我正在邀请你加入我的小组",
      imageUrl: "http://ccreblog.cn/wp-content/uploads/2022/06/5f10a93dd44af29c0a1fd29f22d77f0.jpg",

    }
  },

})