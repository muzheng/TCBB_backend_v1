const Router=require('koa-router')
const router=new Router()

const getAccessToken=require('../untils/getAccessToken.js')
const rp=require('request-promise')

const env='tcbbcloudtest-0g3iqqxb09830af5'
let token=''

/**
 * 此模块负责按照·加密形式，生成token
 */
const jwt=require('jsonwebtoken')

/**
 * 用户登陆模组
 */
router.post('/login',async (ctx,next)=>{
    const params=ctx.request.body
    const tel=params.username
    const password=params.password

    console.log(tel)
    console.log(password)

    const jwtMark='TCBB'
    var success=null
    var message=null

    const ACCESS_TOKEN=await getAccessToken()
    console.log(ACCESS_TOKEN)

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('admin').where({tel:'${tel}',password:'${password}'}).count()`,
            env: `${env}`,

        },

        json: true // Automatically stringifies the body to JSON
    };

    const data=await rp(options).then(res=>{
        console.log(res)
        return res.pager.Total

    })
    console.log(data)

    if(data===1){
        success=true
        token=jwt.sign({
            tel
        },jwtMark,
            {expiresIn: '10h'})
        console.log(token)

        message ='执行成功'

    }else if(data===0){
        success=false
        message='电话或密码不正确'
    }

    ctx.body={
        success,
        data:{
            token
        },
        message,
        code:20000
    }

})
/**
 * 获取用户信息
 */
router.get('/profile',async (ctx,next)=>{
    const ACCESS_TOKEN=await getAccessToken()
    const secret = 'TCBB'
    const tokens=JSON.stringify(ctx.request.header.authorization)
    console.log(tokens)
    const token=tokens.substring(8,tokens.length-1)

    var tels=jwt.verify(token,secret,function (err,decoded){
        if(!err){
            console.log(decoded)
            return decoded
        }
    })
    console.log(tels.tel)

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('admin').where({tel:'${tels.tel}'}).get()`,
            env: `${env}`,

        },

        json: true // Automatically stringifies the body to JSON
    };

    const data=await rp(options).then(res=>{
        console.log(res)
        return res

    })
    console.log(data)

    ctx.body={
        success: true,
        data:{
            data
        },
        message: '执行成功',
        code:20000
    }

})

/**
 * 将模块接口暴露
 */
module.exports=router
