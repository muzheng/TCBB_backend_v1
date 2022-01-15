/**
 * 此模块负责微信小程序的的获得和更新
 * appid： wxf5734c8d00ab9096 当生产环境更换生产环境 appid
 * secret： 86c37261493e6d78880a26d49b564d20 当生产环境时候，更改 secret
 */

/**
 * 通过rp发出一个请求
 * @type {*|{}}
 */
const rp=require('request-promise')
const fs=require('fs')
const path = require('path')

/**
 * 通过APPID 和APPSECRET 组合字符串，进行获得token
 * @type {string}
 */
const APPID='wxf5734c8d00ab9096'
const APPSECRET='86c37261493e6d78880a26d49b564d20'
const URL=`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`

/**
 * 获取文件绝对路径
 * @returns {Promise<void>}
 */
const fileName=path.resolve(__dirname,'./access_token.json')
console.log(fileName)
// 更新accessToken
const updateAccessToken=async ()=>{
    const resStr=await rp(URL)
    const res=JSON.parse(resStr)
    console.log(res)

    // 写文件
    if(res.access_token){
        fs.writeFileSync(fileName,JSON.stringify({
            access_token:res.access_token,
            createTime:new Date()
        }))
    }else{
        //如果没有access_token重新执行updateAccessToken
        await updateAccessToken()
    }
}

//用户获得accessToken
const getAccessToken = async ()=>{
    // 读取文件
    try{
        const readRes=fs.readFileSync(fileName,'utf8')
        const readObj=JSON.parse(readRes)
        const nowTime=new Date().getTime()
        const createTime=new Date(readObj.createTime).getTime()

        if((nowTime-createTime)/1000/60/60>=2){
            await updateAccessToken()
            await getAccessToken()

        }
        return readObj.access_token
    }catch (error){
        await updateAccessToken()
        await getAccessToken()

    }

}

setInterval(async ()=>{
    await updateAccessToken()
},(7200-300)*1000)

module.exports=getAccessToken



