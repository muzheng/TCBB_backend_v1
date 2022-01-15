const Router=require('koa-router')
const router=new Router()

const getAccessToken=require('../untils/getAccessToken.js')
const rp=require('request-promise')

const env='tcbbcloudtest-0g3iqqxb09830af5'

/**
 * 获取学员列表
 * 1.先获得集合中学员总个数
 * 2.判断 offset是否小于Total,
 */
router.post('/userList',async (ctx,next)=>{

    const params=ctx.request.body
    console.log(params)
    const page=params.page
    const size=params.size

    const offset=(page-1)*size

    // 集合中数据总数
    var Total=''
    console.log(page)
    console.log(size)

    var array=[]
    var list=[]

    const ACCESS_TOKEN=await getAccessToken()
    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('users').count()`,
            env: `${env}`,
        },
        json: true // Automatically stringifies the body to JSON
    };
    Total=await rp(options).then((res)=>{
        return res.pager.Total
    })

    console.log(Total)
    console.log((page*size)<=Total)
    if((page*size)<=Total){
        var options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

            body: {
                query:`db.collection('users').skip(${parseInt(offset)}).limit(${parseInt(size)}).get()`,
                env: `${env}`,
            },
            json: true // Automatically stringifies the body to JSON
        };
        list=await rp(options).then((res)=>{
            console.log(res)
            for (var i=0;i<size;i++){
                array.push(JSON.parse(res.data[i]))
            }
            return array
        })
    }else{
        var options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

            body: {
                query:`db.collection('users').skip(${parseInt(offset)}).limit(${parseInt(Total)-parseInt(offset)}).get()`,
                env: `${env}`,
            },
            json: true // Automatically stringifies the body to JSON
        };
        list=await rp(options).then((res)=>{

            for (var i=0;i<(parseInt(Total)-parseInt(offset));i++){
                array.push(JSON.parse(res.data[i]))
            }
            return array
        })

    }

    ctx.body={
        success:true,
        data:{
            list,
            Total,
            page,
            size
        },
        message:'success',
        code:20000

    }


})

/**
 * check 新创建学员是否是重复的卡号
 */
router.post('/checkNewUserCard',async (ctx,next)=>{
    const params=ctx.request.body
    const card=params.newCard
    console.log(card)

    const ACCESS_TOKEN=await getAccessToken()

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('users').where({card_number:'${card}'}).get()`,
            env: `${env}`,
        },
        json: true // Automatically stringifies the body to JSON
    };

    const data=await rp(options).then(res=>{
        console.log(res)
        return res.pager.Total

    })
    console.log(data)

    ctx.body={
        success:true,
        data:{
            data
        },
        message:'success'

    }
})

/**
 * 创建新学员
 */
router.post('/createUser',async (ctx,next)=>{
    const params=ctx.request.body
    console.log(params)

    var date=new Date();
    var year=new Date(date).getFullYear()
    var month=new Date(date).getMonth()+1
    var day=new Date(date).getDate()
    var hour=new Date(date).getHours()
    var minture=new Date(date).getMinutes()
    var second=new Date(date).getSeconds()
    var createtime=year+"/"+month+"/"+day+"  "+hour+":"+minture+":"+second

    const ACCESS_TOKEN=await getAccessToken()
    // 在buycoursemark 集合中创建一个id，此ID负责课程充值等
    var options={
        method:'POST',
        uri:`https://api.weixin.qq.com/tcb/databaseadd?access_token=${ACCESS_TOKEN}`,

        body:{
            query:`db.collection('buycoursemark').add({
                    data:{
                        create_time:'${createtime}'
                    }
                })`,

            env: 'tcbbcloudtest-0g3iqqxb09830af5',

        },

        json: true // Automatically stringifies the body to JSON

    };
    const buycoursemark_id=await rp(options).then(res=>{
        console.log(res)
        if(res.errmsg === 'ok'){
            return res.id_list[0]
        }

    })
    console.log(buycoursemark_id)
    // 获得buycoursemark_id 创建新学员信息
    var options={
        method:'POST',
        uri:`https://api.weixin.qq.com/tcb/databaseadd?access_token=${ACCESS_TOKEN}`,

        body:{
            query:`db.collection('users').add({
                        data:[{
                            name:'${params.newName}',
                            birthday:'${params.newBirthday}',
                            sexual:'${params.newSexual}',
                            parent_tel:'${params.newParent}',
                            card_number:'${params.newCard}',
                            remark:'${params.newRemark}',
                            create_time:'${createtime}',
                            update_time:'${createtime}',
                            cost_total:'',
                            foul:'',
                            cost:'',
                            free:'',
                            class:'',
                            openid_1:'',
                            io_1:'',
                            io_2:'${buycoursemark_id}',
                            io_3:'',
                            io_4:'',
                            io_5:'',
                            io_6:'',
                            io_10:'',

                        }]
                    })`,

            env: 'tcbbcloudtest-0g3iqqxb09830af5',

        },

        json: true // Automatically stringifies the body to JSON

    };

    const data=await rp(options).then(res=>{
        console.log(res)
        return res
    })

    ctx.body={
        success:true,
        data:{
            data
        },
        message:'success',
        code:20000
    }



})

/**
 * 通过卡号查询学员信息
 */
router.post('/fetchByCardId',async (ctx,next)=>{
    const params=ctx.request.body
    console.log(params)
    const cardID=params.newCardID
    console.log(cardID)

    const ACCESS_TOKEN=await getAccessToken()

    var array=[]
    var list=[]

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('users').where({card_number:'${cardID}'}).get()`,
            env: `${env}`,
        },
        json: true // Automatically stringifies the body to JSON
    };

    list=await rp(options).then(res=>{
        console.log(res)
        console.log(res.pager.Total)
        const count=res.pager.Total
        for(var i=0;i<parseInt(count);i++){
            array.push(JSON.parse(res.data[i]))
        }
        return array
    })
    console.log(list)
    const total=list.length
    console.log(total)

    ctx.body={
        success:true,
        data:{
            total,
            list
        },
        message:'success',
        code:20000
    }

})

/**
 * 通过学员姓名查找学员信息
 */
router.post('/fetchByName',async (ctx,next)=>{
    const params=ctx.request.body
    console.log(params)
    const userName=params.newUserName
    console.log(userName)

    const ACCESS_TOKEN=await getAccessToken()

    var array=[]
    var list=[]

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('users').where({name:'${userName}'}).get()`,
            env: `${env}`,
        },
        json: true // Automatically stringifies the body to JSON
    };

    list=await rp(options).then(res=>{
        console.log(res)
        console.log(res.pager.Total)
        const count=res.pager.Total
        for(var i=0;i<parseInt(count);i++){
            array.push(JSON.parse(res.data[i]))
        }
        return array
    })
    console.log(list)
    const total=list.length
    console.log(total)

    ctx.body={
        success:true,
        data:{
            total,
            list
        },
        message:'success',
        code:20000
    }
})

/**
 * 通过学员预留电话号码查找学员信息
 */
router.post('/fetchByTel',async (ctx,next)=>{
    const params=ctx.request.body
    console.log(params)
    const userTel=params.newUserTel
    console.log(userTel)

    const ACCESS_TOKEN=await getAccessToken()

    var array=[]
    var list=[]

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('users').where({parent_tel:'${userTel}'}).get()`,
            env: `${env}`,
        },
        json: true // Automatically stringifies the body to JSON
    };

    list=await rp(options).then(res=>{
        console.log(res)
        console.log(res.pager.Total)
        const count=res.pager.Total
        for(var i=0;i<parseInt(count);i++){
            array.push(JSON.parse(res.data[i]))
        }
        return array
    })
    console.log(list)
    const total=list.length
    console.log(total)

    ctx.body={
        success:true,
        data:{
            total,
            list
        },
        message:'success',
        code:20000
    }
})

/**
 * 通过userId 获得学员信息
 */
router.post('/fetchByID',async (ctx,next)=>{
    const params=ctx.request.body
    console.log(params)
    const userId=params.val

    const ACCESS_TOKEN=await getAccessToken()

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('users').where({_id:'${userId}'}).get()`,
            env: `${env}`,
        },
        json: true // Automatically stringifies the body to JSON
    };

    const data=await rp(options).then(res=>{
        console.log(res)
        return res.data
    })

    ctx.body={
        success:true,
        data:{
            data
        },
        message:'success',
        code:20000
    }
})

/**
 * 更新用户基本信息
 */
router.post('/updateUserBaseInfo',async (ctx,next)=>{
    const params=ctx.request.body
    console.log(params)

    var date=new Date();
    var year=new Date(date).getFullYear()
    var month=new Date(date).getMonth()+1
    var day=new Date(date).getDate()
    var hour=new Date(date).getHours()
    var minture=new Date(date).getMinutes()
    var second=new Date(date).getSeconds()
    var updateTime=year+"/"+month+"/"+day+"  "+hour+":"+minture+":"+second

    const ACCESS_TOKEN=await getAccessToken()

    var options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`,

        body: {
            query:`db.collection('users').doc('${params.userId}').update({
                data:{
                    name:'${params.updateName}',
                    birthday:'${params.updateBirthday}',
                    sexual:'${params.updateSexual}',
                    parent_tel:'${params.updateParent}',
                    remark:'${params.updateRemark}',
                    update_time:'${updateTime}',
                }

            })`,
            env: `${env}`,

        },

        json: true // Automatically stringifies the body to JSON
    };

    const data=await rp(options).then(res=>{
        console.log(res)

        return res
    })

    ctx.body={
        success:true,
        data:{
            data
        },
        message:'success',
        code:20000
    }
})
/**
 * 将模块接口暴露
 */
module.exports=router