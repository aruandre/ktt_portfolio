const express = require('express');
const router = express.Router();
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
let Students = require('../models/students');

//------------ FORGOT -------------
router.get('/', (req, res) => {
    res.render('forgot', {
        student: req.student
    });
});

//------- FORGOT POST --------
router.post('/', (req, res, next) => {
    async.waterfall([(done) => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        }, (token, done) => {
        Students.findOne({ email: req.body.email }, (err, student) => {
            if (!student) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot');
            }
  
        student.resetPasswordToken = token;
        student.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
        student.save((err) => {
            done(err, token, student);
            });
        });
        }, (token, student, done) => {
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
            subject: 'KTD Portfolio Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'https://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
            req.flash('info', 'An e-mail has been sent to ' + student.email + ' with further instructions.');
            done(err, 'done');
        });
        }
    ], (err) => {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

module.exports = router;