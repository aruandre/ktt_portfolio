const express = require('express');
const router = express.Router();

//about home route
router.get('/', (req, res) => {
    res.render('about');
});

module.exports = router;