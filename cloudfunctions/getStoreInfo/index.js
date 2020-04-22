// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  let token = await db.collection("stores").where({
    _id: event.storeId
  }).get();
  console.log(token);
  let token2 = await db.collection("comments").where({
    storeId: event.storeId
  }).get();

  return {
    event,
    storeInfo: token.data,
    comments: token2.data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}