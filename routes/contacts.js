const express = require('express');
const router = express.Router();

//------------ CONTACTS ---------------
router.get('/', async (req, res) => {
    await res.render('contacts');
});

module.exports = router;