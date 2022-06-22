const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
        "page": `pages/flock/flock`,
        "scene": `id=${event.id}`,
        "checkPath": true,
        "envVersion": 'release'
      })
    return {
      result: result,
      event: event,
    }
  } catch (err) {
    return err,event
  }
}