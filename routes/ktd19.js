const express = require('express');
const router = express.Router();
let Students = require('../models/students');

//ktd19 home route
router.get('/', async (req, res) => {
    await Students.find({ role: 'basic', course: '19' }, (err, students) => {
        if(err){
            console.log(err);
        } else {
            res.render('ktd19', {
                students: students
            });
        }
    }).lean();
});

module.exports = router;