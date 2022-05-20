Page({
  /**
   * 页面的初始数据
   */
  data: {
    banners: [{
      picUrl: "http://ccreblog.cn/wp-content/uploads/2022/05/451f625883998f6c643fd5e773b7f1d.jpg"
    }, {
      picUrl: "http://ccreblog.cn/wp-content/uploads/2022/05/8a3a5dc82761535e7a95b278689a4ca.jpg"
    }, {
      picUrl: "http://ccreblog.cn/wp-content/uploads/2022/05/451f625883998f6c643fd5e773b7f1d.jpg"
    }, ], // 轮播
    swiperCurrent: 0, // 引导页的下标  0 
    swiperMaxNumber: 3 // 引导页的下标  3
  },
  fike(e) {
    this.setData({
      swiperCurrent: e.detail.current
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  getIndex() {
    // wx.switchTab():跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面，
    wx.switchTab({
      url: "/pages/home/home"
    })
  },
})