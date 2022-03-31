App({
  onLaunch: async function () {
    //云开发环境的初始化
    wx.cloud.init({
      env: "yuan-1-1gylic1ae84507a5"
    })
    

  },

  globalData: {
    userInfo: null,
    user_id: "",
    hasUserInfo: false,
  },
 
})