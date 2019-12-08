const express = require('express');
const router = express.Router();
let Students = require('../models/students');

// ---------- STUDENTS ----------
//students home route
router.get('/', (req, res) => {
    Students.find({ role: 'basic', course: 17 }, (err, students) => {
        if(err){
            console.log(err);
        } else {
            res.render('ktd17', {
                students: students
            });
        }
    });
});

module.exports = router;