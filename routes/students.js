const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Students = require('../models/students');

// ---------- STUDENTS ----------
//students home route
router.get('/', async (req, res) => {
    await Students.find({ role: 'basic' }, (err, students) => {
        if(err){
            console.log(err);
        } else {
            res.render('students', {
                students: students
            });
        }
    });
});

// load edit form
router.get('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    try{
        Students.findById(req.params.id, (err, student) => {
            res.render('edit_students', {
                student: student
            });
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

//update students route
router.post('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    try{
        let students = {};
        students.email = req.body.email;
        students.personalPortfolio = req.body.personalPortfolio;
        
        let query = {_id:req.params.id}
        
        Students.updateOne(query, students, (err) => {
            req.flash('success', 'Student info updated');
            res.redirect('/students');
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

//delete students/users route
router.delete('/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    if(!req.user._id){
        res.status(500).save();
    }
    let query = {_id:req.params.id}

    Students.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

module.exports = router;