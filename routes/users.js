const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { csrfProtection, asyncHandler } = require('./utils');
const { loginUser, logoutUser, requireAuth } = require('../auth');
const { check, validationResult } = require('express-validator');
const { Op } = require("sequelize");
const db = require('../db/models');



/* GET users listing. */

router.get('/signup',csrfProtection,(req, res) => {
  const user = db.User.build();
  console.log("USER................",user)
  res.render('user-signup', {
    title: 'Signup',
    user,
    csrfToken: req.csrfToken(),
  });
});
//csrfProtection

const userValidators = [
  check('username')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Username')
    .isLength({ max: 20 })
    .withMessage('Username must not be more than 20 characters'),
  check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for email')
    .isLength({ max: 255 })
    .withMessage('Email must not be more than 255 characters')
    .isEmail()
    .withMessage('Provided email is not a valid email')
    .custom((value) => {
      return db.User.findOne({ where: { email: value } })
        .then((user) => {
          if (user) {
            return Promise.reject('The provided email is already in use by another account');
          }
        });
    }),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please enter a value for password")
    .isLength({ max: 100 })
    .withMessage('Password must be under 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'g')
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, a number, and a special character'),
  check('confirmPassword')
    .exists({ checkFalsy: true })
    .withMessage("Please enter a value for password")
    .isLength({ max: 100 })
    .withMessage('Password must be under 100 characters')
    .custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Confirmed Password does not match Password");
      }
      return true;
    })
]



router.post('/signup', csrfProtection, userValidators, asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const user = db.User.build({ username, email })

  const validatorErrors = validationResult(req);

  if (validatorErrors.isEmpty()) {
    const hashedpassword = await bcrypt.hash(password, 10);
    user.hashedpassword = hashedpassword;
    console.log("USER",user)
    await user.save();
    loginUser(req, res, user);
    res.redirect("/");
  } else {
    const errors = validatorErrors.array().map((err) => err.msg);
    res.render("user-signup", {
      title: 'Signup',
      user,
      errors,
      csrfToken: req.csrfToken()
    })
  }
}))


router.get('/login', csrfProtection, (req, res) =>  {
  res.render('user-login', {
    title: 'Login',
    csrfToken: req.csrfToken()
  })
})


const loginValidators = [
  check('username')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for username'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for password')
]

router.post('/login', csrfProtection, loginValidators, asyncHandler(async(req, res) => {
  const { username, password } = req.body;

  let errors = [];
  // console.log("11111111ERRORS.......................",errors)
  const validatorErrors = validationResult(req);
  if(validatorErrors.isEmpty()) {
    const user = await db.User.findOne({where: {username}})

    if(user != null) {
      const passwordMatch = await bcrypt.compare(password, user.hashedpassword.toString());

      if(passwordMatch) {
        loginUser(req, res, user);
        return res.redirect('/')
      }
    }

    errors.push('Login failed for the provided username and password');
  }else {
    errors = validatorErrors.array().map((error) => error.msg)
  }
  // console.log("ERRORS.......................",errors)
  res.render('user-login', {
    title: 'Login',
    username,
    errors,
    csrfToken: req.csrfToken()
  })
}))


router.post('/logout', (req, res) => {
  console.log(req.auth);
  logoutUser(req, res);
  res.redirect('/users/login')                 // pug file that it is referencing
});


// ------------------------------------------------------------------------------------------
//  JC adding profile section below :



//http://localhost:8080/users/profile/:id - - WORKS
router.get('/profile/:id(\\d+)', requireAuth, asyncHandler(async(req, res) => {
  const  id  = parseInt(req.params.id);
  // console.log(id, '===========');

  const reviews = await db.Review.findAll({
    where: {
      [Op.and]: [
        {userId: id},
        {rating: 5}
      ]
    },
    include: db.Book, limit: 9
  });

  const user = await db.User.findByPk(id);

  // console.log(reviews);
  console.log(user)
  res.render('profile',    //  Server is render from profile.pug        -SERVER side rendering
  {reviews, user}           // reviews array gives us the the userId and rating data

  );
}));


// requireAuth

// // to edit the different sections of the profile page:API ROUTE - comment out csrfprotection & userValidator when testing
router.patch('/profile/:id(\\d+)',asyncHandler(async (req, res) => {
  console.log('hit the patch route')
const { newUser, newEmail, newPicture } = req.body;
  const { id } = req.params;
  const user = await db.User.findByPk(id);
  user.username = newUser
  user.email = newEmail
  user.image = newPicture

  await user.save();

  res.json({user})   // returns the data so no need to redirect or no redirect
}))

// csrfProtection, userValidators,


// backend route for delete button for front end route - WORKS
//http://localhost:8080/users/profile/:id

// router.delete('/profile/:id(\\d+)', asyncHandler(async (req, res)=>{
//   // const  id  = parseInt(req.params.id);
//   const id = parseInt(req.body.personId);
//   console.log(req.body);
//   const user = await db.User.findByPk(id);
//   console.log(id);
//   console.log(typeof id);
//   // console.log(user);

//   await user.destroy()
//   // logoutUser()                    // it stalls at this point
//   console.log('----hello----')
//   // next();

//   // res.redirect(303, "/users/signup")
//   // res.json({message:'Success!'})
//   // res.render('user-signup')
// }))
router.delete('/profile/:id', asyncHandler(async (req, res) => {
  // const  id  = parseInt(req.params.id);
  const id = parseInt(req.body.personId);
  console.log(req.body);
  const user = await db.User.findByPk(id);
  console.log(id);
  console.log(typeof id);
  // console.log(user);
  await user.destroy()
  logoutUser(req, res);
  res.redirect('/users/login')
  console.log('----hello----')
  // next();
  res.redirect(303, "/signup")
  // res.json({message:'Success!'})
  // res.render('user-signup')
}))




module.exports = router;
