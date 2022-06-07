const SQL = require("../utils/sql")

import {
    $wuxToast
} from '../dist/index'

class myDate { //时间类
    constructor() {}
        /**
         * 计算相关时间
         * @param {*} input 输入的时间
         * @param {*} num 天数 -2就是前两天 +2就是后两天
         * @returns 和date相隔num天的日期 2022-04-03
         */
    getDateByDateAndNum(input, num) {
            let date = new Date(new Date(input) - num * 24 * 60 * 60 * 1000)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            return `${[year, month, day].map(formatNumber).join('-')}`
        }
        /**
         * 根据输入的时间定位周
         * @param {} input  输入的日期 
         * @returns 返回本周周一、周天的日期
         */
    locateWeek(input) {
        let date = new Date(input)
        let locate = {
            start: this.getDateByDateAndNum(date, date.getDay() - 1),
            end: this.getDateByDateAndNum(date, date.getDay() - 7)
        }
        return locate
    }

}
const globalData = getApp().globalData
    /**
     * 返回当前格式化时间
     * @param {*} date 当前时间 date对象
     * @returns 
     */
const formatTime = date => {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()

        return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
    }
    /**
     * 获取当前格式日期
     * @param {*} n 
     * @returns {*} 2022-04-03
     */
const getCurrentFormatedDate = n => {
    let date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${[year, month, day].map(formatNumber).join('-')}`
}

function getCurrentFormatedDatebyDate(tag) {
    let date = new Date(new Date() - tag)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${[year, month, day].map(formatNumber).join('-')}`
}

/**
 * 返回距离当前日期前tag时间的日期
 * @param {*} date 当前时间
 * @param {*} tag 时间差
 * @returns 
 */
function getYesterday(date) {
    date = new Date(new Date(date) - (24 * 60 * 60 * 1000))
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${[year, month, day].map(formatNumber).join('-')}`
}
const formatNumber = n => {
        n = n.toString()
        return n[1] ? n : `0${n}`
    }
    /**
     * 获取当前时间前一周的日期（包含当天）
     */
function getWeekDate() {
    let dayList = []
    for (let i = 0; i < 7; i++) {
        dayList[i] = getCurrentFormatedDatebyDate((6 - i) * (24 * 60 * 60 * 1000))
    }
    return dayList
}
/**
 * 生成六位随机ID（暂时不考虑重复）
 */
function randomsForSixDigit() {
    let id
    do {
        id = Math.floor(Math.random() * 1000000)
    } while (id < 100000)

    return id
}
/**
 * 返回二者时间差
 * @param {*} sDate1 前一个时间
 * @param {*} sDate2 后一个时间
 */
function getDiffBetweenDate(sDate1, sDate2) {
    var stime = Date.parse(new Date(sDate1));
    var etime = Date.parse(new Date(sDate2));
    var usedTime = etime - stime;
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
    return days
}
/**
 * 连接mysql,执行sql语句
 * @param {*} sql sql语句
 */
async function executeSQL(sql) {

    let result
    await wx.cloud.callFunction({
        name: "mysql",
        data: {
            sql: sql
        }
    }).then((res) => {
        result = JSON.stringify(res.result)
        if (!result) {
            console.log("本次查找结果为空")
        } else {
            console.log("\n执行" + sql + "的结果为：")
            console.log(result)
            console.log("\n")
        }
    })

    return result

}
/**
 * 判断时间前后
 * @param {*} time1 前者时间
 * @param {*} time2 后者时间
 */
function compareTime(time1, time2) {
    let hour1 = time1.slice(0, 2)
    let hour2 = time2.slice(0, 2)
    let minute1 = time1.slice(3, 5)
    let minute2 = time2.slice(3, 5)
    if (hour1 < hour2) {
        return 1
    } else if (hour1 > hour2) {
        return 0
    } else {
        if (minute1 < minute2) {
            return 1
        } else {
            return 0
        }
    }
}

function showDetail(e) {
    console.log('---------------------------', e, typeof(e))
}
//HTML标签反转义（&lt; -> <）
function escape2Html(str) {
    var arrEntities = {
        'lt': '<',
        'gt': '>',
        'nbsp': ' ',
        'amp': '&',
        'quot': '"'
    };
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
        return arrEntities[t];
    });
}

function genMediaPath(prefix, suffix) {
    let date = formatTime(new Date())
    return `${prefix}-${date}${suffix}`
}
/**
 * 检测是否登录
 * @returns 
 */
async function verifyLogin() {
    let check = await wx.getStorageSync("user_id")
    console.log("you" + check)
    if (check) {
        globalData.hasUserInfo = true
        globalData.user_id = check
        return true
    } else {
        //检查数据库
        let openid = await (await wx.cloud.callFunction({
            name: "getOpenID"
        })).result.openid

        // openid = '132'
        let sql = `select id from user where openid='${openid}'`
        let result = await executeSQL(sql)
        if (result == '[]') { //指没有信息
            globalData.hasUserInfo = false
            return false
        } else { //有信息
            result = result && JSON.parse(result)
            globalData.hasUserInfo = true
            globalData.user_id = result[0].id
                //设置缓存
            await wx.setStorage({
                key: "user_id",
                data: result[0].id
            })
            return true
        }
    }
}
/**
 * 检查是否订阅
 */
async function verifySubscription() {
    let flag
    await wx.getSetting({
        withSubscriptions: true,
    }).then((res) => {
        let list = res.subscriptionsSetting.itemSettings //订阅列表
        let status1 = list['MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI']
        if (status1 == "accept") {
            flag = 1
        } else {
            flag = 0
        }
        // "XfpLvF_QtFsXoKcVz7sgMovDkTTW8wHhOa5mbwdiTTs": "accept",
        // "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI": "accept",
        // "V1M7ZJ09GIic3WyzkpRNU3XuXHaM-ORxs59YDGcPeSI": "accept"
    })
    return flag
}
/**
 * 弹出订阅框
 */
async function popupSubscription() {
    let result
    try {

        wx.requestSubscribeMessage({
            tmplIds: [
                "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI"
            ],
            success: res => {
                result = res
            },
            fail: res => {
                result = res
            }
        })
    } catch (res) {
        console.log(res)
    }
    return result
}
/**
 * 获取发送通知需要的数据
 * @param {*} tid 
 * @param {*} uid 
 * @returns 
 */
async function get_info_of_justify(tid, uid) {
    let sql = `select task.flock_id as fid,task.name as tname, flock.name as fname,user.openid as openid from task,user,flock where task.flock_id = flock.id and task.id = ${tid} and user.id = ${uid}`
    let info = await executeSQL(sql)
    return info
}
/**
 * 发送未打卡通知
 * @param {*} tid 计划id
 * @param {*} uid 用户id
 */
async function send_unover_justify(tid, uid) {
    let message
    let info = await get_info_of_justify(tid, uid)
    info = info && JSON.parse(info)
    info = info[0]

    let { fid, tname, fname, openid } = info
    let date = getCurrentFormatedDate()
    await wx.cloud.callFunction({
        name: 'send_unover_notify',
        data: {
            thing4Data: tname,
            thing5Data: '小云提醒你打卡啦',
            phrase3Data: `来自${fname}`,
            time2Data: date,
            touser: openid,
            fid: fid,
            tid: tid
        },
    }).then(res => {
        message = res
    })
    return message.result
}
/**
 * 提示
 * @param {*} text 提示的文字
 */
async function showToast(text) {
    $wuxToast().show({
        type: 'success',
        duration: 1500,
        color: '#fff',
        text: text,
        success: () => console.log('已完成'),
    })

}
/**
 * 提示
 * @param {*} text 提示的文字
 * @param {*} type 提示类型
 */
async function show_toast(text, type = 'success') {
    $wuxToast().show({
        type: type,
        duration: 1500,
        color: '#fff',
        text: text,
        success: () => console.log('已完成'),
    })

}
module.exports = {
    formatTime,
    getWeekDate,
    randomsForSixDigit,
    executeSQL,
    myDate,
    getCurrentFormatedDate,
    getYesterday,
    getDiffBetweenDate,
    compareTime,
    showDetail,
    escape2Html,
    genMediaPath,
    verifyLogin,
    verifySubscription,
    popupSubscription,
    showToast,
    show_toast,
    send_unover_justify,
}