const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  let type = event.type
  let data = event.data
  data = data && JSON.parse(data)
  let openid = event.openid
  let templateId, page
  let flock_id = event.flock_id
  // const openid = cloud.getWXContext().OPENID
  if (type == 1) { //目标完成通知
    page = 'flock'
    templateId = 'V1M7ZJ09GIic3WyzkpRNU3XuXHaM-ORxs59YDGcPeSI'
  } else if (type == 2) { //track目标打卡通知
    page = 'target'
    templateId = 'XfpLvF_QtFsXoKcVz7sgMovDkTTW8wHhOa5mbwdiTTs'
  } else { //未打卡提醒
    page = '/pages/flock/flock?id='+flock_id,
    templateId = 'MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI'
  }
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      "touser": openid,
      "page": page,
      "lang": 'zh_CN',
      "data": data,
      "templateId": templateId,
      "miniprogramState": 'developer'
    })
    return {
    }
  } catch (err) {
    return {
      err: err,
    }
  }

}