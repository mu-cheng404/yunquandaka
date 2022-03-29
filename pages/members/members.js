Page({
  add_tap: function () {
    this.setData({
      add_state: !this.data.add_state
    })
  },
  chooseAll: function () {
    let state = this.data.button_state;
    let array = [];
    if (state) {
      array = [1, 1, 1, 1, 1]
    }
    this.setData({
      value: array,
      button_state: !state
    })
  },
  onCellClick: function (e) {
    let id = e.target.id;
    this.setData({
      ['value[' + id + ']']: !this.data.value[id]
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    select_value: [0, 1, 0, 1, 1],
    button_state: "1", //按钮的文字，1：全选 0：全不选
    add_state: "0", //调整状态，1:是，0：否
    value: [], //列表项是否选中
    right: [{
      text: '踢',
      style: 'background-color: #F4333C; color: white',
    }],
    infoList: [{
      url: "../../images/avatar.jpg",
      name: "小木"
    }, {
      url: "../../images/avatar.jpg",
      name: "小木"
    }, {
      url: "../../images/avatar.jpg",
      name: "小木"
    }, {
      url: "../../images/avatar.jpg",
      name: "小木"
    }, {
      url: "../../images/avatar.jpg",
      name: "小木"
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})