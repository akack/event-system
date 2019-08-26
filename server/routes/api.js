const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const User = require('../models/user');
const Event = require('../models/event');
const jwt = require('jsonwebtoken')
const db = 'mongodb://localhost:27017/Top6DB';
const bcrypt = require('bcryptjs');
const moment = require('moment');
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
router.put('/getUserProfile', (req, res) => {
  let userID = req.body;
  User.findById({_id: userID._id},(error, userIfon) => {
    if(userIfon){
      let userDetails = {
        name: userIfon.name,
        surname: userIfon.surname,
        email: userIfon.email,
        mobile: userIfon.mobile,
        _id: userIfon._id
      }
      res.status(200).send(userDetails);
    }else {
      res.status(401).send(error);
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

router.post('/updateEvent', (req, res) => {
  let eventData = req.body;
  Event.findByIdAndUpdate({_id: eventData._id}, req.body, (err, event)=> {
    if(err) {
      res.status(401).send(err);
      console.log(err);
    }else {
      res.status(200).send(event);
    }
  })
})

router.put('/deleteEvent', (req, res) => {
  let eventData = req.body;
  Event.findByIdAndDelete({_id: eventData._id}, (err, event) => {
    if(err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(event);
    }
  })
})

router.put('/getEvent', (req, res) => {
  let eventID = req.body;
  Event.findById({_id: eventID._id},(error, event) => {
    if(event){
      res.status(200).send(event);
    }else {
      res.status(401).send(error);
    }
  })
})

router.put('/getUserEvents', (req, res) => {
  let user = req.body;
  Event.find({userID: user.userID},(error, event) => {
    if(event){
      res.status(200).send(event);
    }else {
      res.status(401).send(error);
    }
  })
})
router.get('/events', (req, res) => {
  Event.find()
  .sort("date")
  .exec(function(err, items){
      if(err) console.log("Error Finding Query " + err);    
      let date = moment(Date.now()).format('YYYY-MM-DD');
      let array;
      items.forEach(element => {
        array = element.date;
      });

      res.send(items);
  });
})
router.get('/special', verifyToken, (req, res) => {

 
})


module.exports = router