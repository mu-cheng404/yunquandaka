const cloud = require('wx-server-sdk')
cloud.init()
//引入发送邮件的类库
var nodemailer = require('nodemailer')
// 创建一个SMTP客户端配置
var config = {
  host: 'smtp.qq.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: 'muzithe@qq.com', //邮箱账号
    pass: 'xdvnvuxltprcddie' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数
exports.main = async (event, context) => {
  const data = event.data
  // 创建一个邮件对象
  var mail = {
    // 发件人
    from: '<muzithe@qq.com>',
    // 主题
    subject: "小程序意见反馈",
    // 收件人
    to: '2979401194@qq.com',
    // 邮件内容，text或者html格式
    text: `
    我的意见：
            ${data.message}
    我的${data.contactType}是：
            ${data.contact}
    `
  };

  let res = await transporter.sendMail(mail);
  return res;
}