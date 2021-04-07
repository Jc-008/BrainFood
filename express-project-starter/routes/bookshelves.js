const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { csrfProtection, asyncHandler } = require('./utils');
const { loginUser, logoutUser } = require('../auth');
const { check, validationResult } = require('express-validator');
const db = require('../db/models');
//const bookshelf = include('../db/models/bookshelf');


// const bookValidators = [
//   check('title')
//     .exists({checkFalsy: true})
//     .withMessage('Please provide a value for title')
//     .isLength({ max: 255})
//     .withMessage()
// ]


/* GET bookshelves. */

router.get('/', asyncHandler(async (req, res) => {
  const bookshelves = await db.Bookshelf.findAll();
  const books = await db.Book.findAll();
  // const bookshelfId = parseInt(req.params.bookshelfId, 10);
  // const books = await db.Book.findAll({
  //   where: {
  //     bookshelfId,
  //   },
  //   include: db.Bookshelf,
  // });
//console.log(bookshelves);
  res.render('bookshelf', {
   // bookshelves,
   books
  })
})) 

// Delete specific Bookshelf Route
router.delete("/:id", asyncHandler(async (req, res) => {
    const bookshelfId = parseInt(req.params.id, 10);
    const bookshelf = await db.Bookshelf.findByPk(bookshelfId);
    const books = await db.Book.findAll();
    // const bookshelfId = parseInt(req.params.bookshelfId, 10);
    // const books = await db.Book.findAll({
    //   where: {
    //     bookshelfId,
    //   },
    //   include: db.Bookshelf,
    // });
    await bookshelf.destroy();

    res.redirect(`bookshelf/${bookshelfId - 1}`, {
      bookshelves,
      books,
    });
  })
);

router.get('/add-book', asyncHandler(async (req, res) => {
  const book = db.Book.build();
  res.render('add-book-to-bookshelf', {
    book,
  });
}))

// Delete specific Book Route
router.delete("/:id", asyncHandler(async (req, res) => {
    // How do we do this?
    const bookId = parseInt(req.params.id, 10);
    const book = await db.Book.findByPk(bookId);
    //const books = await db.Book.findAll();
    // const bookshelfId = parseInt(req.params.bookshelfId, 10);
    // const books = await db.Book.findAll({
    //   where: {
    //     bookshelfId,
    //   },
    //   include: db.Bookshelf,
    // });
    await book.destroy();

    res.render("bookshelf", {
      bookshelves,
      books,
    });
  })
);
// router.get('/bookshelves/:id', asyncHandler(async (req, res) => {
//   const bookshelfId = parseInt(req.params.bookshelfId, 10);
//   // const books = await db.Book.findAll({
//   //   where: {
//   //     bookshelfId
//   //   },
//   //   include: Bookshelf
//   // });

//   res.render('bookshelf', {
//     books
//   })

// }))

module.exports = router;

// findAll({include: Book},{where: ID})