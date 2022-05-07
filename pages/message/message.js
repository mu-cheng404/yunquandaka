const globalData = getApp().globalData
const utils = require('../../utils/util')
const SQL = require('../../utils/sql')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        messageList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function(options) {
      
    },
    async onShow() {
        await this.getAndSetMessageList()
    },
    getAndSetMessageList: async function() {
        let result = await SQL.message_select_by_id(globalData.user_id)
        result = result && JSON.parse(result)
        this.setData({
            messageList: result
        })
        return true
    },
    async access(e) {
        let index = e.currentTarget.id
        let message = this.data.messageList[index]
        if (message.hasRead && (message.type == 1 || message.type == 2)) {
            utils.show_toast("已经处理过啦")
            return
        }
        if (message.type == 1) {
            wx.showModal({
                content: "是否同意加圈请求",
                confirmText: "欣然同意",
                cancelColor: 'cancelColor',
                cancelText: "忍痛拒绝",
                success: async res => {
                    let confirm = res.confirm
                    if (confirm) { //点击同意

                        let [user_id, flock_id] = [message.sender_id, message.flock_id]
                        if (await SQL.joining_insert(user_id, flock_id)) {
                            utils.show_toast("已同意")
                        }
                        await SQL.message_read(message.id)
                    } else { //点击拒绝
                        utils.show_toast("已拒绝，可再次点击处理")
                    }
                }
            })
        } else if (message.type == 2) {
            wx.showModal({
                content: "点击确定参与计划",
                confirmText: "欣然同意",
                cancelColor: 'cancelColor',
                cancelText: "忍痛拒绝",
                success: async res => {
                    let confirm = res.confirm
                    if (confirm) { //点击同意
                        let [user_id, flock_id, task_id] = [message.sender_id, message.flock_id, message.task_id]
                        if (await SQL.participate_insert(user_id, task_id)) {
                            utils.show_toast("成功加入")
                        }
                        await SQL.message_read(message.id)

                    } else { //点击拒绝
                        utils.show_toast("已拒绝，可再次点击处理")
                    }
                }
            })
        } else if (message.type == 3 || message.type == 4) {
            await SQL.message_read(message.id)
            wx.navigateTo({
                url: message.url,
            })
        } else if (message.type == 5) {
            wx.showModal({
                cancelColor: 'cancelColor',
            })
        }
    },
    async onPullDownRefresh() {
        await this.getAndSetMessageList()
    }
})