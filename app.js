const express=require('express')
const app=express()
app.use(express.json({limit:'10kb'}))
app.use('/api/v1/users',require('./router/userRouter'))
module.exports=app