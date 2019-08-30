const mongoose = require('mongoose')

const Schema = mongoose.Schema

const eventSchema = new Schema ({
    name: String,
    description: String,
    date: String,
    userID: String,
    address: String,
    poster: String,
    start_time: String,
    end_time: String,
    contact: String,
    organiser: String,
    active: Boolean,
    normal_price: String,
    vip_price: String
})
module.exports = mongoose.model('event', eventSchema, 'events');