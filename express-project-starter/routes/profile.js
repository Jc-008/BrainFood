const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { csrfProtection, asyncHandler } = require('./utils');
const { loginUser, logoutUser } = require('../auth');
const { check, validationResult } = require('express-validator');
const db = require('../db/models');


router.get('/user', (req, res) => {
  res.render('profile')       // rendering the profile.pug
});


// router.delete('/:id', asyncHandler(async(req, res) => {
//   // const person =

// }))


module.exports = router;
