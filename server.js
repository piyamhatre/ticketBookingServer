const express=require('express')
const app=express()
const dotenv=require('dotenv')
dotenv.config()
require("./db/conn")

app.use(express.json())

app.use(require('./controller/usercontroler'))

 const PORT=process.env.PORT || 5000
 
app.listen(5000,console.log(`Server started on port ${PORT}`))

app.get('/', (req,res)=>{
    res.send("welcome to indianvivahserver")
})