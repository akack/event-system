const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Event = require("../models/event");
const jwt = require("jsonwebtoken");
const db = "mongodb://localhost:27017/Top6DB";
const bcrypt = require("bcryptjs");
const moment = require("moment");
const nodemailer = require("nodemailer");
const config = require("../config");
const Booking = require("../models/booking");
const Song = require("../models/Song");
const Company = require("../models/record_company");


//PDF
const PDF = require("pdfkit");
const fs = require("fs");
const invoice = new PDF();
const tag = require("html-tag");

//--PDF

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});
const upload = multer({ storage });

mongoose.connect(db, err => {
  if (err) {
    console.log("error: ", err);
  } else {
    console.log("Connected to DB");
  }
});
router.get("/", (req, res) => {
  res.send("Api call");
});

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized request");
  }
  let token = req.headers.authorization.split(" ")[1];
  if (token === "null") {
    return res.status(401).send("Unauthorized request");
  }
  let payload = jwt.verify(token, "top6events");
  if (!payload) {
    return res.status(401).send("Unauthorized request");
  }
  req.userId = payload.subject;
  next();
}

//Company---
router.post("/addCompany", (req, res) => {
  let company = new Company(req.body);
  company.save((err, companyDetails) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(companyDetails);
    }
  });
});

router.get("/getCompanies", (req, res) => {
  
  Company.find({},(err, companies) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(companies);
    }
  });
});
//--end company

//Music Hub -----------------functions
router.post("/addSong", (req, res) => {
  let song = new Song(req.body);
  song.save((err, songDetails) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(songDetails);
    }
  });
});

router.put("/deleteSong", (req, res) => {
  let songData = req.body;
  Song.findByIdAndDelete({ _id: songData._id }, (err, song) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(song);
    }
  });
});

router.get("/getSongs", (req, res) => {
  
  Song.find({},(err, songs) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(songs);
    }
  });
});

router.put("/getSongsByGenre", (req, res) => {
  Song.find({genre: req.body.genre},(err, songs) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(songs);
    }
  });
});



// Bookings ------------------------------------------------------------
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.post("/addBooking", (req, res) => {
  let bookings = new Booking(req.body);
  bookings.save((err, bookingInfo) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(bookingInfo);
    }
  });
});

router.put("/updateBooking", (req, res) => {
  let bookingData = req.body;
  Booking.findByIdAndUpdate({ _id: bookingData._id }, req.body, (err, booking) => {
    if (err) {
      res.status(401).send(err);
      console.log(err);
    } else {
      res.status(200).send(booking);
    }
  });
});

router.put("/getBooking", (req, res) => {
  Booking.findById({ _id: req.body._id }, (err, bookings) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(bookings);
    }
  });
});

router.put("/getTicketInfo", (req, res) => {
  const ticket = req.body;
  Booking.findOne({ ticket_number: ticket.ticket_number }, (err, ticketInfo) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(ticketInfo);
    }
  });
});


router.get("/getBookings", (req, res) => {
  Booking.find({}, (err, bookings) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(bookings);
    }
  });

  // Booking.aggregate([
  //   {"$group":{"_id":"$event_name","events": { $push: "$$ROOT" }}}
  // ]).exec(function (error, getbookings) {
  //   res.status(200).send(getbookings);
  // });
});

router.get("/getBookingsReport", (req, res) => {
  Booking.aggregate([
    { "$group": { "_id": "$event_name", "events": { $push: "$$ROOT" } } }
  ]).exec(function (error, getbookings) {
    res.status(200).send(getbookings);
  });
});

router.get("/getNotifications", (req, res) => {
  Booking.find({ new: true }, (err, notifications) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(notifications);
    }
  });
});

router.get("/getNewEvents", (req, res) => {
  Event.find({ new: true }, (err, events) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(events);
    }
  });
});

//user fuctions---------------------------------------------------------
router.post("/register", (req, res) => {
  let userData = req.body;
  let user = new User(userData);
  User.findOne({ email: userData.email }, (error, userR) => {
    if (error) {
      console.log(error);
      res.status(505).send(error);
    } else {
      if (userR) {
        res.status(401).send("Email Already in use");
      } else {
        bcrypt.hash(userData.password, 10, (err, hass) => {
          if (err) {
            res.status(501).send(err);
          } else {
            userData.password = hass;
            let user = new User(userData);
            user.save((error, registeredUser) => {
              if (error) {
                console.log("Error: ", error);
              } else {
                let payload = { subject: registeredUser._id };
                let token = jwt.sign(payload, "top6events");
                let userDetails = {
                  name: registeredUser.name,
                  token: token,
                  surname: registeredUser.surname,
                  email: registeredUser.email,
                  mobile: registeredUser.mobile,
                  levels: registeredUser.levels,
                  _id: user._id
                };
                res.status(200).send({ userDetails });
              }
            });
          }
        });
      }
    }
  });
});

router.put("/getUsersByType", (req, res) => {
  User.find({userType: req.body.userType},(err, songs) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(songs);
    }
  });
});

router.post("/login", (req, res) => {
  let userData = req.body;
  User.findOne({ email: userData.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (!user) {
        res.status(401).send("Invalid email");
      } else {
        bcrypt.compare(userData.password, user.password, (err, result) => {
          if (!result) {
            res.status(401).send("Invalid password");
          } else {
            user.password = userData.password;
            let payload = { subject: user._id };
            let token = jwt.sign(payload, "top6events");
            let userDetails = {
              name: user.name,
              token: token,
              surname: user.surname,
              email: user.email,
              mobile: user.mobile,
              levels: user.levels,
              _id: user._id,
              userType: user.userType,
              addedRecordCompany: user.addedRecordCompany
            };
            res.status(200).send({userDetails});
          }
        });
      }
    }
  });
});
router.put("/getUserProfile", (req, res) => {
  let userID = req.body;
  User.findById({ _id: userID._id }, (error, userIfon) => {
    if (userIfon) {
      let userDetails = {
        name: userIfon.name,
        surname: userIfon.surname,
        email: userIfon.email,
        mobile: userIfon.mobile,
        _id: userIfon._id
      };
      res.status(200).send(userDetails);
    } else {
      res.status(401).send(error);
    }
  });
});

router.get("/getUsers", (req, res) => {
  User.find({}, { password: 0 })
    .sort("name")
    .exec((err, users) => {
      if (err) {
        res.status(401).send(err);
      } else {
        res.status(200).send(users);
      }
    });
});
router.put("/deleteUser", (req, res) => {
  let userData = req.body;
  User.findByIdAndDelete({ _id: userData._id }, (err, user) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(user);
    }
  });
});

router.post("/updateUser", (req, res) => {
  let userData = req.body;
  User.findByIdAndUpdate({ _id: userData._id }, req.body, (err, user) => {
    if (err) {
      res.status(401).send(err);
      console.log(err);
    } else {
      res.status(200).send(user);
    }
  });
});

//events functions---------------------------------------------------------------

router.put("/invoicePDF", (req, res) => {
  let eventID = req.body;
  Event.findById({ _id: eventID._id }, (error, event) => {
    if (event) {
      res.status(200).send(event);
    } else {
      res.status(401).send(error);
    }
  });
});

router.post("/addEvent", upload.single("poster"), (req, res) => {
  let eventData = req.body;
  let event = new Event(eventData);
  event.save((err, eventAdded) => {
    if (err) {
      console.log("err", err);
      res.status(401).send("Failed adding event");
    } else {
      res.status(200).send(eventAdded);
    }
  });
});

router.post("/updateEvent", (req, res) => {
  let eventData = req.body;
  Event.findByIdAndUpdate({ _id: eventData._id }, req.body, (err, event) => {
    if (err) {
      res.status(401).send(err);
      console.log(err);
    } else {
      res.status(200).send(event);
    }
  });
});

router.post("/updateEventStatus", (req, res) => {
  let eventData = req.body;
  Event.findByIdAndUpdate({ _id: eventData._id }, req.body, (err, event) => {
    if (err) {
      res.status(401).send(err);
      console.log(err);
    } else {
      res.status(200).send(event);
    }
  });
});

router.put("/deleteEvent", (req, res) => {
  let eventData = req.body;
  Event.findByIdAndDelete({ _id: eventData._id }, (err, event) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(200).send(event);
    }
  });
});

router.put("/getEvent", (req, res) => {
  let eventID = req.body;
  Event.findById({ _id: eventID._id }, (error, event) => {
    if (event) {
      res.status(200).send(event);
    } else {
      res.status(401).send(error);
    }
  });
});

router.put("/getUserEvents", (req, res) => {
  let user = req.body;
  Event.find({ userID: user.userID }, (error, event) => {
    if (event) {
      res.status(200).send(event);
    } else {
      res.status(401).send(error);
    }
  });
});

router.get("/events", (req, res) => {
  Event.find({ active: true })
    .sort("date")
    .exec(function (err, items) {
      if (err) console.log("Error Finding Query " + err);
      let date = moment(Date.now()).format("YYYY-MM-DD");
      let array;
      items.forEach(element => {
        array = element.date;
      });
      res.send(items);
    });
});

router.get("/getEvents", (req, res) => {
  Event.find()
    .sort("date")
    .exec(function (err, items) {
      if (err) console.log("Error Finding Query " + err);
      let date = moment(Date.now()).format("YYYY-MM-DD");
      let array;
      items.forEach(element => {
        array = element.date;
      });
      res.status(200).send(items);
    });
});

router.get("/recentEvents", (req, res) => {
  Event.find({ active: true })
    .sort("date")
    .limit(3)
    .exec(function (err, items) {
      if (err) console.log("Error Finding Query " + err);
      let date = moment(Date.now()).format("YYYY-MM-DD");
      let array;
      items.forEach(element => {
        array = element.date;
      });
      res.status(200).send(items);
    });
});

router.put("/getActiveStatus", (req, res) => {
  let eventID = req.body;
  Event.findById({ _id: eventID._id })
    .sort("date")
    .exec((err, item) => {
      if (err) {
        console.log("Error Finding Query " + err);
        res.status(401).send(err);
      } else {
        res.status(200).send(item);
      }
    });
});

router.put("/sendEmail", (req, res) => {
  let emailBody = req.body;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arcbasecorporation@gmail.com",
      pass: "@K@34ak_am91##"
    }
  });

  var mailOptions = {
    from: "arcbasecorporation@gmail.com",
    to: emailBody.toEmail,
    subject: emailBody.subject,
    text: emailBody.message,
    attachments: [{
      path: emailBody.attachment
    }]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(401).send(error);
      console.log(error);
    } else {
      res.status(200).send(info.response);
      console.log("Email sent: " + info.response);
    }
  });
});

module.exports = router;
