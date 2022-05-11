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
        userInfo: null,
        user_id: '',
        // user_id: 133382, //测试
        // hasUserInfo: false,
        systeminfo: "", //系统信息
        tabBarHeight: 0, //tab栏高度
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
    }
})