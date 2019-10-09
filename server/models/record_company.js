const mongoose = require('mongoose')

const Schema = mongoose.Schema

const RecordSchema = new Schema({
    companyType: String,
    name: String,
    reg_number: String,
    website: String,
    userID: String,
    tel: String,
    email: String
})
module.exports = mongoose.model('record', RecordSchema, 'record_companies');