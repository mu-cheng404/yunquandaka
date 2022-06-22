App({
    onLaunch: async function() {
        //云开发环境的初始化
        wx.cloud.init({
            env: "yuan-1-1gylic1ae84507a5"
        })

        this.getSystemInfo()
        this.setStorageList()
    },
    globalData: {
        initUrl: "http://ccreblog.cn/wp-content/uploads/2022/06/白底反黑图.png",
        userInfo: null,
        user_id: '',
        // hasUserInfo: false,
        systeminfo: "", //系统信息
        tabBarHeight: 0, //tab栏高度
        logo:"http://ccreblog.cn/wp-content/uploads/2022/05/logo配色图.png"
    },
    getSystemInfo() {
        let that = this
        this.globalData.headerBtnPosi = wx.getMenuButtonBoundingClientRect()
        wx.getSystemInfo({ // iphonex底部适配
            success: res => {
                console.log(res)
                that.globalData.systeminfo = res
                that.globalData.tabBarHeight = (res.screenHeight - res.windowHeight - res.statusBarHeight) * res.pixelRatio
            }
        })
    },
    setStorageList(){
      wx.setStorageSync('loading', 0)
      wx.setStorageSync('homeloading', 0)
      wx.setStorageSync('statloading', 0)
      wx.setStorageSync('recommandList', '')
      wx.setStorageSync('user_id', '');
      wx.setStorageSync('inviteGoto',0);
      wx.setStorageSync('test', 0)
    }
})