const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const User = require('../models/user');
const Event = require('../models/event');
const jwt = require('jsonwebtoken')
const db = 'mongodb://localhost:27017/Top6DB';
const bcrypt = require('bcryptjs');

mongoose.connect(db, err => {
  if (err) {
    console.log('error: ', err);
  } else {
    console.log('Connected to DB');
  }
})
router.get('/', (req, res) => {
  res.send('Api call');
})


function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  let token = req.headers.authorization.split(' ')[1]
  if (token === 'null') {
    return res.status(401).send('Unauthorized request')
  }
  let payload = jwt.verify(token, 'top6events')
  if (!payload) {
    return res.status(401).send('Unauthorized request')
  }
  req.userId = payload.subject
  next()
}
//user fuctions

router.post('/register', (req, res) => {
  let userData = req.body;
  let user = new User(userData);
  User.findOne({ email: userData.email }, (error, userR) => {
    if (error) {
      console.log(error);
    } else {
      if (userR) {
        res.status(401).send('Email Already in use');
      } else {

        bcrypt.hash(userData.password, 10, (err, hass) => {
          if (err) {
            callback(null,
              {
                statusCode: err.statusCode || 500,
                headers: { 'Content-Type': 'text/plain' },
                body: 'User was not registered.'
              });
          } else {
            userData.password = hass;
            let user = new User(userData);
            user.save((error, registeredUser) => {
              if (error) {
                console.log('Error: ', error)
              } else {
                let payload = { subject: registeredUser._id }
                let token = jwt.sign(payload, 'top6events');
                let userDetails = {
                  name: registeredUser.name,
                  token: token,
                  surname: registeredUser.surname,
                  email: registeredUser.email,
                  mobile: registeredUser.mobile,
                  levels: registeredUser.levels,
                  _id: user._id
                }
                res.status(200).send({ userDetails });
              }

            })

          }
        })

      }

    }
  })
})

router.post('/login', (req, res) => {
  let userData = req.body;
  User.findOne({ email: userData.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (!user) {
        res.status(401).send('Invalid email');
      } else {
        bcrypt.compare(userData.password, user.password, (err, result) => {
          if (!result) {
            res.status(401).send('Invalid password');
          } else {
            console.log("User successfully logged in.");
            user.password = userData.password;
            let payload = { subject: user._id }
            let token = jwt.sign(payload, 'top6events');
            let userDetails = {
              name: user.name,
              token: token,
              surname: user.surname,
              email: user.email,
              mobile: user.mobile,
              levels: user.levels,
              _id: user._id
            }
            res.status(200).send({ userDetails });
          }
        })

      }
    }
  })
})


//events functions
router.post('/addEvent', (req, res) => {
  let eventData = req.body;
  let event = new Event(eventData);
  event.save((err, eventAdded) => {
    if (err) {
      console.log('err', err);
      res.status(401).send('Failed adding event');
    } else {
      res.status(200).send(eventAdded);
    }
  })
})

router.get('/events', (req, res) => {
  // Event.find((error, events) => {
  //   if(error) {
  //     res.status(401).send('Unable to get events');
  //   } else {
  //     res.status(200).send(events);
  //   }
  // })
  Event.find()
  .sort("date")
  .exec(function(err, items){
      if(err) console.log("Error Finding Query " + err);
      res.send(items);
  });
})
//router.get('/special', verifyToken, (req, res) => {
router.get('/special', verifyToken, (req, res) => {
  let specialEvents = [
    {
      "_id": "1",
      "name": "Auto 1 Special",
      "description": "lorem ipsum",
      "date": "2012-04-23T18:25:43.511Z",
      "poster": "https://i.ibb.co/XLKBMz2/Events.jpg",
      "address": "173 Moye Street, Lufhereng, Soweto, 1863"
    },
    {
      "_id": "2",
      "name": "Auto l",
      "description": "lorem ipsum",
      "date": "2012-04-23T18:25:43.511Z",
      "poster": "https://i.ibb.co/XLKBMz2/Events.jpg",
      "address": "173 Moye Street, Lufhereng, Soweto, 1863"
    },
    {
      "_id": "3",
      "name": "Auto 34 Special",
      "description": "lorem ipsum",
      "date": "2012-04-23T18:25:43.511Z",
      "poster": "https://i.ibb.co/XLKBMz2/Events.jpg",
      "address": "173 Moye Street, Lufhereng, Soweto, 1863"
    },
    {
      "_id": "4",
      "name": "Auto 43 Special",
      "description": "lorem ipsum",
      "date": "2012-04-23T18:25:43.511Z",
      "poster": "https://i.ibb.co/XLKBMz2/Events.jpg",
      "address": "173 Moye Street, Lufhereng, Soweto, 1863"
    },
    {
      "_id": "5",
      "name": "Auto 4334343 Special",
      "description": "lorem ipsum",
      "date": "2012-04-23T18:25:43.511Z",
      "poster": "https://i.ibb.co/XLKBMz2/Events.jpg",
      "address": "173 Moye Street, Lufhereng, Soweto, 1863"
    },
    {
      "_id": "6",
      "name": "Auto 434343 Special",
      "description": "lorem ipsum",
      "date": "2012-04-23T18:25:43.511Z",
      "poster": "https://i.ibb.co/XLKBMz2/Events.jpg",
      "address": "173 Moye Street, Lufhereng, Soweto, 1863"
    }
  ]
  res.json(specialEvents)
})


module.exports = router