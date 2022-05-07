const utils = require("../../utils/util")
const SQL = require("../../utils/sql")

const message = require("../../utils/message")
const app = getApp()
const globalData = app.globalData
import {
  $startWuxRefresher,
  $stopWuxRefresher,
  $stopWuxLoader,
} from '../../dist/index'
Page({

  data: {
    orders: true,
    swiper: [
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fa43105c3-0ffd-42f8-9f84-2182daf52a93%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652872300&t=a264de1b62ac25eabb447dc0053a5a6b ',
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fblog%2F202107%2F20%2F20210720183147_f0810.thumb.1000_0.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652872300&t=c637f7107f9981054227caff03366a71',
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fblog%2F202106%2F05%2F20210605105613_86a05.thumb.1000_0.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652872300&t=b05cb13edcd6bb82d2186bfb9f90bea4',
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fww1.sinaimg.cn%2Fmw690%2Fb3c3ecf7ly1gnhjmi2gnij21jk2bckjl.jpg&refer=http%3A%2F%2Fwww.sina.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652872300&t=4c7cbca0f6b94d96869f3b4a0ed0fdf1'
    ],
    rList: [], //排行榜数据
    reList: [], //推荐小队数据
    eList: [], //心得数据
    screenHeight: 750, //屏幕高度
    tabBarHeight: "", //tab栏的高度
    current: "tab1", //当前的标签
    current_1: "1", //小标签栏的标签
    refresh: false,
  },
  onLoad: async function () {
    console.log(globalData.tabBarHeight, '------------------------')
    //获取屏幕高度
    this.setData({
      screenHeight: globalData.systeminfo.screenHeight,
      tabBarHeight: globalData.tabBarHeight
    })

  },
  onShow: async function () {
    await this.getRankList()
    await this.getExperienceList()

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

    if (this.data.current == 'tab1') {
      await this.getExperienceList()
    } else if (this.data.current == 'tab2') {
      await this.getRecommandList("宿舍")
    } else if (this.data.current == 'tab3') {
      await this.getRankList()
    }

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
  handeItemChange(e) {
    //接收传递过来的参数
    const {
      index
    } = e.detail;
    let {
      tabs
    } = this.data;

    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    this.setData({
      tabs
    })

  },

  /**
   * 获取经验列表
   * @returns eList 对象数组（按时间排序）
   * {id,wirtter_name,writter_url,time,content}
   */
  getExperienceList: async function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let eList = await SQL.experience_select(globalData.user_id)
    eList = eList && JSON.parse(eList)
    this.setData({
      eList: eList
    })
    wx.hideLoading({
      success: (res) => {},
    })
  },
  /**
   * 获取排行榜列表
   * @returns rList 排行榜信息数组 (以元气值排名)
   * {*}
   */
  getRankList: async function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let rList = await SQL.flock_select_order_by_value() //执行
    rList = rList && JSON.parse(rList) //处理数据
    this.setData({
      rList: rList
    })
    wx.hideLoading({
      success: (res) => {},
    })
  },
  /**
   * 获取推荐圈子列表(随机推荐)
   * @param {*} type 类型
   */
  getRecommandList: async function (type) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //找出所有的不属于自己的圈子
    let reList = await SQL.flock_select_by_type(type, globalData.user_id) //执行
    reList = reList && JSON.parse(reList) //处理数据
    this.setData({
      reList: reList
    })
    wx.hideLoading({
      success: (res) => {},
    })
  },
  async like(e) {
    console.log(e)
    let index = e.currentTarget.id
    let exper = this.data.eList[index]
    //修改页面值
    this.setData({
      ['eList[' + index + '].isLike']: 1,
      ['eList[' + index + '].num_of_like']: exper.num_of_like + 1,
    })
    //修改数据库
    let sql = `insert into liking(exper_id,user_id,time,type) values( ${exper.id},${globalData.user_id},'${utils.formatTime(new Date())}',1)`
    await utils.executeSQL(sql)
    //生成点赞通知
    await message.send_like_message(globalData.user_id, exper.writter_id, exper.id)
  },
  async cancelLike(e) {
    console.log(e)
    let index = e.currentTarget.id
    let exper = this.data.eList[index]
    //修改页面值
    this.setData({
      ['eList[' + index + '].isLike']: 0,
      ['eList[' + index + '].num_of_like']: exper.num_of_like - 1,
    })
    //修改数据库
    let sql = `delete from liking where user_id = ${globalData.user_id} and exper_id = ${exper.id}`
    await utils.executeSQL(sql)
  },
  /**
   * 切换tab
   * @param {} e 
   */
  async onTabsChange(e) {
    console.log(e)
    let key = e.detail.key
    if (key == 'tab1') {
      await this.getExperienceList()
    } else if (key == "tab2") {
      await this.getRecommandList('宿舍')
    } else if (key == 'tab3') {
      await this.getRankList()
    }
    this.setData({
      current: key
    })
  },
  /**
   * 切换推荐小队的tab
   */
  async onTabsChange_1(e) {
    console.log(e)
    let key = e.detail.key
    if (key == "1") {
      await this.getRecommandList("伙伴")
    } else if (key == "2") {
      await this.getRecommandList("班级")
    } else if (key == "3") {
      await this.getRecommandList("宿舍")
    } else if (key == "4") {
      await this.getRecommandList("社团")
    } else if (key == "5") {
      await this.getRecommandList("组织")
    }
    this.setData({
      current_1: key
    })
  }
})