const app=require('./app')
const dotenv=require('dotenv')
dotenv.config()
const server=app.listen(process.env.PORT,()=>{
    console.log('app is running.')
})