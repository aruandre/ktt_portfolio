const express = require('express');
const router = express.Router();

//------------ ABOUT ---------------
router.get('/', async (req, res) => {
    await res.render('about');
});

module.exports = router;