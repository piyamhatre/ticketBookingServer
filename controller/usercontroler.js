const express = require('express')
const bcrypt = require('bcryptjs')
const authenticate = require('../middleware/auth')
const router = express.Router();
require('../db/conn')
const User = require('../models/users')
const Movies = require('../models/moviedata')


// API to register user
router.post('/register', async (req, res) => {

    const { name, email, password, confirmpassword } = req.body
    console.log("req is ", req.body)

    if (!email || !name || !password || !confirmpassword) {
        return res.status(422).json({ error: "Please fill all the details." })
    }

    try {
        const userExist = await User.findOne({ email: email })

        if (userExist) {
            return res.status(422).json({ error: "User already exist" })
        } else if (password != confirmpassword) {
            return res.status(422).json({ error: "password are not matching" })
        } else {
            const user = new User({ name, email, password })

            await user.save()

            res.status(201).json({ message: "user registered successfully" })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to registered!" })
    }

})

// API for user signin
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "please fill all the details" })
        }

        const userlogin = await User.findOne({ email: email })
        if (userlogin) {
            const ispassvalid = await bcrypt.compare(password, userlogin.password)
            const token = await userlogin.generateAuthToken()
            console.log("token is ", token)

            // res.cookie('jwtToken', token, {
            //     expires: new Date(Date.now() + 86400000),
            //     httpOnly: true
            // })
            if (!ispassvalid) {
                res.status(400).json({ erroe: "invalid credential" })
            }
            else {
                res.status(200).json({ message: "user signin successfully", token: token })
            }

        } else {
            res.status(400).json({ erroe: "invalid credential" })
        }

    } catch (err) {
        console.log(err)
    }
})

// API to check if authenticate user is sigin
// Pass token get by login request in headers
router.get('/book', authenticate, (req, res) => {
        res.status(200).json({ message: "You can book ticket", userdata: req.rootUser })
})

// API to add new movie
router.post('/addMovie', async (req, res) => {
    try {
        const { movieName, cinemas } = req.body

        console.log("req body is", req.body, cinemas, movieName)

        await cinemas.forEach((ele) => {
            console.log("arry ele", ele)
            for (let i = 0; i < ele.showDates.length; i++) {
                ele.showDates[i] = new Date(ele.showDates[i]);
            }
        })

        console.log(".......>>>>>>>", cinemas)

        const movie = new Movies({ movieName, cinemas })

        await movie.save()

        res.status(201).json({ message: "Movie added successfully" })


    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
})

// API to get all movies name
router.get('/getMovies', async (req, res) => {
    try {
        const resData = await Movies.find({}, { movieName: 1 })
        res.status(200).json({ data: resData })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
}
)

// API to get all cities
router.get('/getCity', async (req, res) => {
    let resp = []
    try {
        const resData = await Movies.find({}, { "cinemas.city": 1 })
        await resData.forEach((ele) => {
            for (let i = 0; i < ele.cinemas.length; i++) {
                if (resp.indexOf(ele.cinemas[i].city) === -1) {
                    resp.push(ele.cinemas[i].city)
                }
            }
        });
        res.status(200).json({ data: resp })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
}
)

// API to get movies playing in requested city
router.get('/getMoviesByCity', async (req, res) => {
    let resp = []
    const { city } = req.query

    if (!city) {
        return res.status(400).json({ error: "please provide city" })
    }

    try {
        const data = await Movies.find({ "cinemas.city": city }, { movieName: 1, "cinemas.name": 1, "cinemas.city": 1 })
        await data.forEach((ele) => {
            for (let i = 0; i < ele.cinemas.length; i++) {
                if (ele.cinemas[i].city == city) {
                    resp.push({
                        MovieName: ele.movieName,
                        city: ele.cinemas[i].city,
                        cinemaName: ele.cinemas[i].name
                    })
                }
            }
        });

        console.log("final resp", resp)
        res.status(200).json({ data: resp })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }

})

// API to get all cinemas in which requested movie is playing along with all showtimes and dates
router.get('/getCinemasByMovie', async (req, res) => {
    let resp = []
    const { movieName } = req.query

    if (!movieName) {
        return res.status(400).json({ error: "please provide Movie Name" })
    }
    try {
        const data = await Movies.find({ movieName: movieName })
        await data.forEach((ele) => {
            for (let i = 0; i < ele.cinemas.length; i++) {
                if (ele.movieName == movieName) {
                    resp.push({
                        MovieName: ele.movieName,
                        city: ele.cinemas[i].city,
                        cinemaName: ele.cinemas[i].name,
                        showTimes: ele.cinemas[i].showTimes,
                        showDates: ele.cinemas[i].showDates,
                    })
                }
            }
        });

        console.log("final resp", resp)
        res.status(200).json({ data: resp })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
})

module.exports = router