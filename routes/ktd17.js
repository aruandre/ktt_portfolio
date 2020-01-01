const express = require('express');
const router = express.Router();
let Students = require('../models/students');

//ktd17 home route
router.get('/', async (req, res) => {
    await Students.find({ role: 'basic', course: 17 }, (err, students) => {
        if(err){
            console.log(err);
        } else {
            res.render('ktd17', {
                students: students
            });
        }
    }).lean();
});

module.exports = router;