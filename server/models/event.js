const mongoose = require('mongoose')

const Schema = mongoose.Schema

const eventSchema = new Schema ({
    name: String,
    description: String,
    date: String,
    userID: String,
    address: String,
    poster: String
})
module.exports = mongoose.model('event', eventSchema, 'events');