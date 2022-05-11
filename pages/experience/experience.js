const app = getApp()
const utils = require('../../utils/util')
const sql = require('../../utils/sql')
var V = {
    id: ""
}
Page({
    data: {
        content: "",
        fileList: [],
    },
    async onLoad(options) {
        V.id = options.id
    },
    /**
     * 获取输入的内容
     * @param {*} e 
     */
    _contentInput(e) {
        this.setData({
            content: e.detail.value
        })
    },
    /**
     * 上传图片
     * @param {*} tempUrl 图片临时链接
     */
    uploadImage: async function(tempUrl) {
        const date = utils.formatTime(new Date())
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
    /**
     * 提交
     */
    async submit() {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
        let [id, writter_id, flock_id, time, content, url] = [utils.randomsForSixDigit(), app.globalData.user_id, '', utils.formatTime(new Date()), this.data.content, '']

        if (content == "") {
            utils.show_toast("还未输入内容", "forbidden")
        }
        wx.showLoading({
            title: '上传数据中',
            mask: true
        })
        if (this.data.fileList.length != 0) {
            url = await this.uploadImage(this.data.fileList[0].url)
        }
        await sql.experience_insert(id, writter_id, flock_id, time, content, url)

        wx.hideLoading({})
        utils.show_toast("发布成功！")
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