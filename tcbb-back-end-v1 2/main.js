/**
 * 引用 koa 框架
 * @type {Application|{HttpError?: *}}
 */
const Koa=require('koa')

/**
 * 引入 koa 路由中间件
 * @type {module:koa-router|(function({prefix?: String}=): (module:koa-router|Router|undefined))|{}}
 */
const Router=require('koa-router')

/**
 * 引入 koa 的跨域模块
 * @type {function(Object=): function(*, *): Promise<*|undefined>}
 */
const cors=require('koa2-cors')

/**
 * 使koa 可以接收 POST 请求
 * @type {((options?: koaBody.IKoaBodyOptions) => Koa.Middleware<{}, {}>) | koaBody}
 */
const koaBody=require('koa-body')

const app=new Koa()
const router=new Router()

/**
 * 跨域模块
 * @type {module:koa-router|Router|{}}
 */
//跨域问题
app.use(cors({
    origin:['http://localhost:9528'],
    credentials:true
}))


/**
 * 接收 POST 参数
 */
app.use(koaBody({
    multipart: true
}))

const login=require('./controller/login.js')
const userMange=require('./controller/userManage.js')

router.use('/login',login.routes())
router.use('/userManage',userMange.routes())

app.use(router.routes())
app.use(router.allowedMethods())

/**
 * 验证 koa是否启动的测试数据
 */
/*
app.use(async (ctx)=>{
    ctx.body = 'hello muzheng'
})

 */


/**
 * 监听 3000 端口
 */
app.listen(3000,()=>{
    console.log('服务开启在3000')
})
