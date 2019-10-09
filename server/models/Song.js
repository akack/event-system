const mongoose = require('mongoose')

const Schema = mongoose.Schema

const songSchema = new Schema({
    title: String,
    artist: String,
    producer: String,
    genre: String,
    link: String,
    release_date: String,
    userID: String,
    record_company: String,
    cover: String
})
module.exports = mongoose.model('song', songSchema, 'music');