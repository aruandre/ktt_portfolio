const express = require('express');
const router = express.Router();
let Students = require('../models/students');

// ---------- STUDENTS ----------
//students home route
router.get('/', (req, res) => {
    Students.find({ role: 'basic', course: {'$nin': [17, 18, 19]} }, (err, students) => {
        if(err){
            console.log(err);
        } else {
            res.render('ktd_earlier', {
                students: students
            });
        }
    });
});

module.exports = router;