const express = require('express');
const router = express.Router();

//------------ CONTACTS ---------------
router.get('/', (req, res) => {
    res.render('contacts');
});

module.exports = router;