const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bookingSchema = new Schema({
    ticket_number: String,
    event_name: String,
    event_date: String,
    event_address: String,
    event_time: String,
    client_id: String,
    client_name: String,
    client_surname: String,
    client_email: String,
    client_contact: String,
    client_no_tickets: String,
    ticket_level: String,
    total_amount: String,
    ticket_price: String,
    event_organiser: String,
    event_organiser_contact: String,
    new: Boolean,
    event_post: String,
    rules_accepted: Boolean
})
module.exports = mongoose.model('booking', bookingSchema, 'bookings');