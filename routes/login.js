const express = require('express');
const router = express.Router();
const passport = require('passport');

//------------ LOGIN --------------
//login route
router.get('/', (req, res) => {
    res.render('login');
});

//login process
router.post('/', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/login',
        failureFlash: true
    })(req, res, next);
});

module.exports = router;