const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

//contacts home route
router.get('/', (req, res) => {
    res.render('contacts');
});

//------- SEND MESSAGE post --------
router.post('/sendMessage', (req, res) => {
    try{
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
            to: '',
            from: 'sendMessageForm@ktdportfolio.hk.tlu.ee',
            subject: 'New message from KTD portfolio message form',
            text: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`};

            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash('info', 'Your message has been sent!');
                res.redirect('/');
            });
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

module.exports = router;