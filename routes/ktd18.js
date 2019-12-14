const express = require('express');
const router = express.Router();
let Students = require('../models/students');

// ---------- STUDENTS ----------
//students home route
router.get('/', async (req, res) => {
    await Students.find({ role: 'basic', course: '18' }, (err, students) => {
        if(err){
            console.log(err);
        } else {
            res.render('ktd18', {
                students: students
            });
        }
    }).lean();
});

module.exports = router;