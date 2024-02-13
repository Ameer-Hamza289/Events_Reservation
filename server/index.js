const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require("dotenv").config();
const cors=require("cors")

const app = express();
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'events_rsvp_db',
    connectionLimit: 10
  });

  module.exports.pool=pool

const users=require('./controller/userController')
const events=require('./controller/eventController')
const invitations=require('./controller/invitationsController')
const rsvp=require('./controller/rsvpController')
app.use('/api/auth',users);
app.use('/api',events);
app.use('/api',invitations)
app.use('/api',rsvp)




  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });