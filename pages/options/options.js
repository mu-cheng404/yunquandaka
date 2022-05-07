const globalData = getApp().globalData
const utils = require('../../utils/util')
const SQL = require('../../utils/sql')
let V = {
    flock_id: ""
}

Page({
    /**
     * 页面的初始数据
     */
    data: {
        value1: [],
        displayValue1: "是",
        options: [{
            value: '1',
            label: "是"
        }, {
            value: '0',
            label: "否"
        }, ],
        visible: false,
        adjust: false,
        valueOfName: "",
        valueOfState: "",
        flag: true,
        buttonLoading: false,
        admin: false,
        info:{},
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        V.flock_id = options.id
        //检查是否是管理员
        this.setData({
            admin: SQL.flock_select_amdin(V.flock_id) == globalData.user_id,
        })

        let sql = `select * from flock where id=${V.flock_id}`
        let result = await utils.executeSQL(sql)
        result = result && JSON.parse(result)
        console.log(result)
        this.setData({
            valueOfName: result[0].name,
            valueOfState: result[0].state,
            initName: result[0].name,
            info:result[0]
        })
    },
    /**
     * 退出圈子
     */
    async quitFlock() {
        //提醒用户
        wx.showModal({
            content: "退出圈子后，您的所有信息将会被清除，点击确定退出",
            confirmText: "确定",
            cancelText: "手滑了",
            confirmColor: "black",
            success: async (res) => {
                if (res.confirm) { //用户点击确定
                    let [flock_id, user_id] = [V.flock_id, globalData.user_id]
                    await SQL.flock_quit(flock_id, user_id)
                    //返回主页面
                    wx.switchTab({
                        url: '../home/home',
                    })
                }
            }
        })
    },
    /**
     * 注销圈子
     */
    async logoutFlock() {
        wx.showModal({
            content: "注销圈子后，所有的信息将会被清除，点击确定退出",
            confirmText: "确定",
            cancelText: "手滑了",
            confirmColor: "black",
            success: async (res) => {
                if (res.confirm) { //用户点击确定
                    await SQL.flock_delete(V.flock_id)
                    utils.show_toast('已注销,即将返回主界面')
                    setTimeout(() => {
                        wx.switchTab({
                            url: '../home/home',
                        })
                    }, 1000);
                }
            }
        })
    },
    adjust: function () {
        this.setData({
            adjust: !this.data.adjust
        })
    },
    onChangeOfNameInput(e) {
        this.setData({
            valueOfName: e.detail.value,
            flag: false
        })
    },
    onChangeOfStateInput(e) {
        this.setData({
            valueOfState: e.detail.value,
            flag: false
        })
    },
    submit: async function () {
        this.setData({
            buttonLoading: true
        })
        //更新数据库里flock的信息
        let [flock_id, name, state] = [V.flock_id, this.data.valueOfName, this.data.valueOfState]
        await SQL.flock_update(flock_id, name, state)

        //收回adjust状态
        this.setData({
            adjust: !this.data.adjust
        })
        utils.show_toast('修改成功')

    },

    setValue(values, key) {
        this.setData({
            [`value${key}`]: values.value,
            [`displayValue${key}`]: values.label,
        })
    },
    onConfirm(e) {
        const {
            index
        } = e.currentTarget.dataset
        this.setValue(e.detail, index)
        console.log(`onConfirm${index}`, e.detail)
    },
    onValueChange(e) {
        const {
            index
        } = e.currentTarget.dataset
        console.log(`onValueChange${index}`, e.detail)
    },
    onClick() {
        this.setData({
            visible: true
        })
    },

})