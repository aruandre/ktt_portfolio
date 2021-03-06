const express = require('express');
const router = express.Router();

//logout route
router.get('/', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/');
});

module.exports = router;