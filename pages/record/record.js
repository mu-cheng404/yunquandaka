const util = require("../../utils/util")
let V = {
    id: "",
}
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        type: "预设",
        fileList: '',
        info: {},
        content: "",
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function(options) {
        V.id = options.id
        let sql = `select * from task where id=${V.id}`
        await wx.cloud.callFunction({
            name: "mysql",
            data: {
                sql: sql
            }
        }).then((res) => {
            let result = res.result[0]
            console.log(result)
            this.setData({
                info: result,
                content: result.defaultText
            })
        })
    },
    toOptions: function() {
        wx.navigateTo({
            url: '../targetOption/targetOption?id=' + V.id,
        })
    },
    /**
     * 上传图片
     * @param {*} tempUrl 图片临时链接
     */
    uploadImage: async function(tempUrl) {
        const date = util.formatTime(new Date())
        let fileList
        await wx.cloud.uploadFile({
            cloudPath: V.user_id + " userImage/" + date,
            filePath: tempUrl,
        }).then(res => {
            console.log(res, typeof(res))
            fileList = res.fileID
        })
        return fileList
    },
    chooseImage: async function() {
        await wx.chooseImage({
            count: 1,
        }).then(async(res) => {
            let tempUrl = res.tempFilePaths[0]
            this.setData({
                tempFilePath: tempUrl
            })
            await this.uploadImage(tempUrl)
        })
    },
    textAndImage() {
        this.setData({
            type: "图文"
        })
    },
    pureText() {
        this.setData({
            type: "纯文字"
        })
    },
    preText() {
        this.setData({
            type: "预设"
        })
    },
    _contentInput: function(e) {
        let value = e.detail.value;
        this.setData({
            content: value
        })
    },
    submit: async function() {
        wx.showLoading({
            title: '上传数据中',
            mask: true
        })
        let [id, task_id, content, date, time, url] = [util.randomsForSixDigit(), V.id, this.data.content, util.formatTime(new Date()).slice(0, 10), util.formatTime(new Date()).slice(11, 19), '']
        if (content == "") {
            util.show_toast("打卡内容为空", "forbidden")
            return
        }
        if (this.data.fileList != '') {
            url = await this.uploadImage(this.data.fileList[0].url)
        }
        await this.insertRecord(id, task_id, content, date, time, url)
        await this.insertPunch(app.globalData.user_id, id)
        await this.updateValue(task_id)
        wx.hideLoading({
                success: (res) => {},
            })
            //提示
        util.show_toast("打卡成功!")
            //跳转回去
        setTimeout(() => {
            wx.navigateBack({
                delta: 1,
            })
        }, 1000);
    },
    /**
     * 插入打卡记录信息
     */
    insertRecord: async function(id, task_id, content, date, time, url) {
        let sql = `insert into record values(${id},${task_id},'${content}','${date}','${time}','${url}')`
        await util.executeSQL(sql)
    },
    /**
     * 插入打卡关系表信息
     */
    insertPunch: async function(user_id, record_id) {
        let sql = `insert into punch (user_id,record_id) values(${user_id},${record_id})`
        await util.executeSQL(sql)
    },
    /**
     * 修改圈子元气值
     */
    updateValue: async function(task_id) {
        let sql = `update flock set value = value + 1 where id in (select flock_id from task where id = ${task_id})`
        await util.executeSQL(sql)
    },

    onChange(e) {
        console.log('onChange', e)
        const {
            file,
            fileList
        } = e.detail
        if (file.status === 'uploading') {
            this.setData({
                progress: 0,
            })
            wx.showLoading()
        } else if (file.status === 'done') {
            this.setData({
                imageUrl: file.url,
            })
        }

        // Controlled state should set fileList
        this.setData({
            fileList
        })
    },
    onSuccess(e) {
        console.log('onSuccess', e)
    },
    onFail(e) {
        console.log('onFail', e)
    },
    onComplete(e) {
        console.log('onComplete', e)
        wx.hideLoading()
    },
    onProgress(e) {
        console.log('onProgress', e)
        this.setData({
            progress: e.detail.file.progress,
        })
    },
    onPreview(e) {
        console.log('onPreview', e)
        const {
            file,
            fileList
        } = e.detail
        wx.previewImage({
            current: file.url,
            urls: fileList.map((n) => n.url),
        })
    },
    onRemove(e) {
        const {
            file,
            fileList
        } = e.detail
        wx.showModal({
            content: '确定删除？',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        fileList: fileList.filter((n) => n.uid !== file.uid),
                    })
                }
            },
        })
    },
})