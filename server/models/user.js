const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: String,
    surname: String,
    mobile: Number,
    email: String,
    password: String,
    levels: String,
    userType: String
})
module.exports = mongoose.model('user', userSchema, 'users');