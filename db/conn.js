const mongoose = require ('mongoose')

const databaseUrl =process.env.DATABASE

mongoose.connect(databaseUrl).then(()=>{
    console.log('database connection successful')
}).catch((err)=>{
    console.log("no connection")
})
