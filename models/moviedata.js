const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    movieName: {
        type: String,
        required: true
    },
    cinemas:[
        {
            name:{
                type:String
            },
            city:{
                type:String
            },
            showTimes:[],
            showDates: {
                type: Array,
                default: [Date]
            }
        }
    ]
})

const Movie = mongoose.model('moviesdetail', movieSchema)
module.exports = Movie