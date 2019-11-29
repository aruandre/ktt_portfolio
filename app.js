const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const https = require('https');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
//const xoauth2 = require('xoauth2');
const Router = require('router');
const morgan = require('morgan');

//import helpers
const helper = require('./helper/helper.js');

//SSL certs
let key = fs.readFileSync(__dirname + '/certs/cert.key');
let cert = fs.readFileSync(__dirname + '/certs/cert.crt');
let options = {
    key: key,
    cert: cert
};

//db connection
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

//check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

//check for db errors
db.on('error', (err) => {
    console.log(err);
});

//init app
const app = express();

//logger
let accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'));
// setup the logger 
app.use(morgan('combined', {stream : accessLogStream }));

//bring in models
let Document = require('./models/document');
let Students = require('./models/students');
let News = require('./models/news');
let Services = require('./models/services');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//express messages middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

//------- ROUTES -------
//home route
app.get('/', (req, res) => {
    res.render('index');
});


//------------ FORGOT -------------
app.get('/forgot', (req, res) => {
    res.render('forgot', {
        student: req.student
    });
});

//------- FORGOT POST --------
app.post('/forgot', (req, res, next) => {
    async.waterfall([(done) => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        }, (token, done) => {
        Student.findOne({ email: req.body.email }, (err, student) => {
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
                    student: '',
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

//------------ GET RESET --------------
app.get('/reset/:token', (req, res) => {
    Student.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },(err, student) => {
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
app.post('/reset/:token', (req, res) => {
    async.waterfall([(done) => {
        Student.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, student) => {
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
                student: '',
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

//------------ LOGIN --------------
//login route
app.get('/login', (req, res) => {
    res.render('login');
});

//login process
app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/login',
        failureFlash: true
    })(req, res, next);
});

//logout
app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/');
});


// //----------- ADMIN ---------------
// app.get('/admin', helper.ensureAuthenticated, (req, res) => {
//     res.render('admin', {
//     });
// });

// // app.post('/admin/add', ensureAuthenticated,
// // //TODO fix validation
// // // [
// //     // check('document_type').isEmpty().withMessage('Document type is required'),
// //     // check('title').isEmpty().withMessage('Document title is required'),
// //     // check('author').isEmpty().withMessage('Document author is required')
// //     // ], 
// //     (req, res) => { 
// //         //get errors
// //         // let errors = validationResult(req);
// //         // if(!errors.isEmpty()){
// //             //     res.render('admin', {
// //                 //         errors:errors
// //                 //     });
// //                 // } else {
// //                     let document = new Document();
// //                     document.document_type = req.body.document_type;
// //                     document.save((err) => {
// //                         if(err){
// //                             console.log(err);
// //                             return;
// //                         } else {
// //                             req.flash('success', 'Document added');
// //                             res.redirect('/admin');
// //                         }
// //         });
// //         // }
// //     });

// //add documents route
// app.post('/admin/addDocument', helper.ensureAuthenticated, (req, res, next) => {
//     upload(req, res, (err) => {
//         if(err){
//             console.log(err);
//             req.flash('danger', 'File upload failed!');
//             return;
//         } else {
//             new Document({
//                 document_type: req.body.document_type,
//                 title: req.body.title,
//                 author: req.body.author.split(","),
//                 created_at: req.body.created_at,
//                 description: req.body.description,
//                 tag: req.body.tag,
//                 path: req.file.path.replace(/\\/g, "/").substring('public'.length),
//                 //path: req.files.path,
//                 status: req.body.status
//             }).save((err, doc) => {
//                 console.log(req);
//                 if(err){
//                     req.flash('danger', 'Data save failed!');
//                     return;
//                 } else {
//                     req.flash('success', 'Document added');
//                     res.redirect('/admin');
//                 }
//             });
//         }
//     });
// });

// //admin add news route
// app.post('/admin/addNews', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
//         new News({
//             title: req.body.title,
//             date: req.body.date,
//             description: req.body.description
//         }).save((err, news) => {
//             console.log(req);
//             if(err){
//                 req.flash('danger', 'Data save failed!');
//                 return;
//             } else {
//                 req.flash('success', 'News added');
//                 res.redirect('/admin');
//             }
//         });
// });

// //admin add services route
// app.post('/admin/addService', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
//     new Services({
//         title: req.body.title,
//         date: req.body.date,
//         description: req.body.description
//     }).save((err, news) => {
//         console.log(req);
//         if(err){
//             req.flash('danger', 'Service save failed!');
//             return;
//         } else {
//             req.flash('success', 'New service added');
//             res.redirect('/admin');
//         }
//     });
// });

// //admin get unpublished documents
// app.get('/admin/unpublished', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
//     Document.find({ status: false }, (err, documents) => {
//         if(err){
//             console.log(err);
//         } else {    
//             res.render('unpublished', {
//                 documents: documents
//             });
//         }
//     });
// });

// //load edit form
// app.get('/admin/unpublished/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
//     Document.findById(req.params.id, (err, document) => {
//         res.render('edit_unpublished', {
//             document: document
//         });
//     });
// });

// //route to /admin/unpublished/edit/:id
// app.post('/admin/unpublished/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
//     let document = {};
//     document.document_type = req.body.document_type;
//     document.title = req.body.title;
//     document.author = req.body.author.split(",");
//     document.created_at = req.body.created_at;
//     document.description = req.body.description;
//     document.tag = req.body.tag;
//     //- document.path = req.file.path;
//     document.status = req.body.status;
    
//     let query = {_id:req.params.id}
//     Document.updateOne(query, document, (err) => {
//         if(err){
//             console.log(err);
//             return;
//         } else {
//             req.flash('success', 'Document published');
//             res.redirect('/admin/unpublished');
//         }
//     });
// });

// //register process
// app.post('/admin/addUser', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
//     const firstname = req.body.firstname;
//     const lastname = req.body.lastname;
//     const role = req.body.role;
//     const username = req.body.username;
//     const email = req.body.email;
//     const personalPortfolio = req.body.personalPortfolio;
//     const course = req.body.course;
//     const password = req.body.password;
//     const confirm = req.body.confirm;

//     let newStudent = new Student({
//         firstname: firstname,
//         lastname: lastname,
//         role: role,
//         username: username,
//         email: email,
//         personalPortfolio: personalPortfolio,
//         course: course,
//         password: password,
//         confirm: confirm
//     });
    
//     //TODO check if user exists

//     // if(password == '' || confirm == ''){
//     //     req.flash('danger', 'Password can not be empty');
//     // }
//     // if(password !== confirm){
//     //     req.flash('danger', 'Passwords do not match');
//     // }

//     bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(newStudent.password, salt, (err, hash) => {
//             if(err){
//                 console.log(err);
//             }
//             newStudent.password = hash;
//             newStudent.save((err) => {
//                 if(err){
//                     console.log(err);
//                     return;
//                 } else {
//                     res.redirect('/admin');
//                 }
//             });
//         });
//     });
// });
let adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

//---------- PROFILE -------------
let profile = require('./routes/profile');
app.use('/profile', profile);

//---------- PORTFOLIO ----------------
let portfolio = require('./routes/portfolio');
app.use('/portfolio', portfolio);

// ---------- STUDENTS ----------
let students = require('./routes/students');
app.use('/students', students);

//------------ NEWS ----------------
let news = require('./routes/news');
app.use('/news', news);

//------------ SERVICES ----------------
let services = require('./routes/services');
app.use('/services', services);

//------------ ABOUT ---------------
let about = require('./routes/about');
app.use('/about', about);

//------------ CONTACT ---------------
let contacts = require('./routes/contacts');
app.use('/contacts', contacts);

//route to error page
app.get('*', (req, res) => {
    res.render('error');
});


//------------- SERVER -------------
//start server
https.createServer(options, app).listen(30000, () => {
    console.log('Server listening on port 30000');
});