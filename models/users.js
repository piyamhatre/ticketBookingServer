const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    }
})

schema.pre('save', async function (next) {
    console.log("inside hash", this.password)
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        console.log("hash pas", this.password)
    }
    next();
})

schema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this.id }, process.env.SECRET_KEY);
        this.token =token 
        await this.save()
        return token
    } catch (err) {
        console.log(err)
    }
}

const User = mongoose.model('user', schema)
module.exports = User