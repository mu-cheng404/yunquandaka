// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "yuan-1-1gylic1ae84507a5"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let res = await cloud.openapi.security.mediaCheckAsync({
    mediaUrl: "http://bbs.r17vtb.com/data/attachment/forum/202101/11/124243tvefr1zbrsr4zffg.jpg",
    mediaType: 2,
    version: 2,
    openid: 'oBWNP43hGQU9GThwgDfN2aPXAZnA',
    scene: 3,
  })
  return {
    res: res,
    event: event,
  }
}