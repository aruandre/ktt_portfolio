const express = require('express');
const router = express.Router();
const async = require('async');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
let Students = require('../models/students');

//------------ GET RESET --------------
router.get('/:token', (req, res) => {
    Students.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },(err, student) => {
        if(!student) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
    }
    res.render('reset', {
        student: req.student
        });
    });
});

//------------ POST RESET --------------
router.post('/:token', (req, res) => {
    async.waterfall([(done) => {
        Students.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, student) => {
            if(!student) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
            }
  
        student.password = req.body.password;
        student.resetPasswordToken = undefined;
        student.resetPasswordExpires = undefined;
       
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(student.password, salt, (err, hash) => {
                if(err){
                    console.log(err);
                }
                student.password = hash;
                student.save((err) => {
                    if(err){
                        console.log(err);
                        return;
                    } else {
                        req.logIn(student, (err) => {
                            done(err, student);
                        }); 
                    }
                });
            });
        });
        });
    }, (student, done) => {
        let smtpTransport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: '',
                clientId: '',
                clientSecret: '',
                refreshToken: '',
                accessToken: ''
            }
        });
        let mailOptions = {
            to: student.email,
            from: 'passwordreset@demo.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + student.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
        });
    }
    ], (err) => {
        res.redirect('/');
        });
});

module.exports = router;