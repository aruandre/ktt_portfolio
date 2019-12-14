const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

//------------ CONTACTS ---------------
router.get('/', (req, res) => {
    res.render('contacts');
});

//------- FORGOT POST --------
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
            text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`};

            smtpTransport.sendMail(mailOptions, async (err) => {
                req.flash('info', 'Your message has been sent!');
                res.redirect('/');
            });
    } catch(err){
        console.log(err);
        console.log(req);
        res.render('error');
    }
});

module.exports = router;