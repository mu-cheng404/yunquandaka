// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let {
    tid,
    fid,
    touser,
    thing4Data,
    thing5Data,
    phrase3Data,
    time2Data
  } = event
  let [page, templateId, miniprogramState] = [`pages/task/task?tid=${tid}&fid=${fid}`, 'MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI', 'formal']
  //"formal","developer","trial"
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      "touser": touser,
      "page": page,
      "lang": 'zh_CN',
      "data": {
        "thing4": {
          "value": thing4Data,
        },
        "thing5": {
          "value": thing5Data,
        },
        "phrase3": {
          "value": phrase3Data,
        },
        "time2": {
          "value": time2Data,
        }
      },
      "templateId": templateId,
      "miniprogramState": miniprogramState
    })
    return "success"
  } catch (err) {
    return err
  }
}