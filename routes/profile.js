const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Students = require('../models/students');

//profile route
router.get('/', helper.ensureAuthenticated, (req, res) => {
    Students.find({}, (err, students) => {
        if(err){
            console.log(err);
        } else {
            res.render('profile', {
                students: students
            });
        }
    });
});

//edit profile route
router.get('/edit/:id', helper.ensureAuthenticated, (req, res) => {
    Students.findById(req.params.id, (err, students) => {
        res.render('edit_profile', {
            students: students
        });
    });
});

//update submit POST route
router.post('/edit/:id', helper.ensureAuthenticated, (req, res) => {
    let student = {};
    student.email = req.body.email;
    student.personalPortfolio = req.body.personalPortfolio;
    
    let query = {_id:req.params.id}
    Students.updateOne(query, student, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Profile updated');
            res.redirect('/profile');
        }
    });
});

module.exports = router;