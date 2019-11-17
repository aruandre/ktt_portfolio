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
const xoauth2 = require('xoauth2');

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

//public folder
app.use(express.static('./public/uploads/'));

//set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//init upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 20000000}, //10MB
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if(ext !== '.png' || ext !== '.jpg' || ext !== '.jpeg' || ext !== '.pdf'){
            req.flash('danger', 'File type not allowed!');
        }
        cb(null, true)
    }
}).array('fileupload', 2);

//bring in models
let Document = require('./models/document');
let User = require('./models/user');
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

//authentication
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Action not allowed!');
        res.redirect('/');
    }
}

//superadmin check
function isAdmin(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.role == 'superadmin'){
            return next();
        } else {
            req.flash('danger', 'Action not allowed!');
            res.redirect('/');
        }
    }
}

//------- ROUTES -------
//home route
app.get('/', (req, res) => {
    res.render('index');
});

//------------- REGISTER -------------
//register form
app.get('/register', ensureAuthenticated, isAdmin, (req, res) => {
    res.render('register');
});

//register process
app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    let newUser = new User({
        username: username,
        password: password
    });
        
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err){
                console.log(err);
            }
            newUser.password = hash;
            newUser.save((err) => {
                if(err){
                    console.log(err);
                    return;
                } else {
                    res.redirect('/login');
                }
            });
        });
    });
});

//------------ FORGOT -------------
app.get('/forgot', (req, res) => {
    res.render('forgot', {
        user: req.user
    });
});

//------- FORGOT POST --------
app.post('/forgot', (req, res, next) => {
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        }, (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot');
            }
  
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
        user.save((err) => {
            done(err, token, user);
            });
        });
      }, (token, user, done) => {
            // let smtpTransport = nodemailer.createTransport('SMTP', {
            //     service: 'Gmail',
            //     auth: {
            //         user: 'andraru',
            //         pass: '3Wnijuuser'
            //     }
            // });
            let smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: 'aa.andrearu@gmail.com',
                    clientId: '911300106380-pamabgr9smma61f8rdtae0d2hotc3dnu.apps.googleusercontent.com',
                    clientSecret: 'oTzyBa9ziiivqYoP6PCWYeJ9',
                    refreshToken: '1//04mivyAQps4gxCgYIARAAGAQSNwF-L9IrqC098VxLvSZzZrZzyVKd5NWgFAF01JFa2MTMmYx_QERPTnV9BM1nCiKLHVYFlFxsyWM',
                    accessToken: 'ya29.Il-xB_M8wutbdVL7JAoWlGvyyU-2WuVxCJgi1UtJUWhPZpOcvuu8FRNP6T6LIKXLYgcymAZ4jSqNwBOEMZctFYrmMwEhS4ycGaASTetpB3Is3azzibR3jOil8rW8nH8HGA'
                }
            });
        let mailOptions = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            done(err, 'done');
        });
        }
    ], (err) => {
        if (err) return next(err);
        res.redirect('/forgot');
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


//----------- ADMIN ---------------
app.get('/admin', ensureAuthenticated, (req, res) => {
    res.render('admin', {
    });
});

// app.post('/admin/add', ensureAuthenticated,
// //TODO fix validation
// // [
//     // check('document_type').isEmpty().withMessage('Document type is required'),
//     // check('title').isEmpty().withMessage('Document title is required'),
//     // check('author').isEmpty().withMessage('Document author is required')
//     // ], 
//     (req, res) => { 
//         //get errors
//         // let errors = validationResult(req);
//         // if(!errors.isEmpty()){
//             //     res.render('admin', {
//                 //         errors:errors
//                 //     });
//                 // } else {
//                     let document = new Document();
//                     document.document_type = req.body.document_type;
//                     document.save((err) => {
//                         if(err){
//                             console.log(err);
//                             return;
//                         } else {
//                             req.flash('success', 'Document added');
//                             res.redirect('/admin');
//                         }
//         });
//         // }
//     });

//add documents route
app.post('/admin/addDocument', ensureAuthenticated, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            console.log(err);
            req.flash('danger', 'File upload failed!');
            return;
        } else {
            new Document({
                document_type: req.body.document_type,
                title: req.body.title,
                author: req.body.author.split(","),
                created_at: req.body.created_at,
                description: req.body.description,
                tag: req.body.tag,
                //path: req.file.path.replace(/\\/g, "/").substring('public'.length),
                path: req.files.path,
                status: req.body.status
            }).save((err, doc) => {
                console.log(req);
                if(err){
                    req.flash('danger', 'Data save failed!');
                    return;
                } else {
                    req.flash('success', 'Document added');
                    res.redirect('/admin');
                }
            });
        }
    });
});

//admin add news route
app.post('/admin/addNews', ensureAuthenticated, isAdmin, (req, res) => {
        new News({
            title: req.body.title,
            date: req.body.date,
            description: req.body.description
        }).save((err, news) => {
            console.log(req);
            if(err){
                req.flash('danger', 'Data save failed!');
                return;
            } else {
                req.flash('success', 'News added');
                res.redirect('/admin');
            }
        });
});

//admin add services route
app.post('/admin/addService', ensureAuthenticated, isAdmin, (req, res) => {
    new Services({
        title: req.body.title,
        date: req.body.date,
        description: req.body.description
    }).save((err, news) => {
        console.log(req);
        if(err){
            req.flash('danger', 'Service save failed!');
            return;
        } else {
            req.flash('success', 'New service added');
            res.redirect('/admin');
        }
    });
});

//admin get unpublished documents
app.get('/admin/unpublished', ensureAuthenticated, isAdmin, (req, res) => {
    Document.find({ status: false }, (err, documents) => {
            res.render('unpublished', {
                documents: documents
            });
    });
});

//---------- PROFILE -------------
//login route
app.get('/profile', ensureAuthenticated, (req, res) => {
    User.find({}, (err, users) => {
        if(err){
            console.log(err);
        } else {
            res.render('profile', {
                users: users
            });
        }
    });
});


//---------- PORTFOLIO ----------------
//portfolio home route
app.get('/portfolio', (req, res) => {
    Document.find({ status: true }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('portfolio', {
                documents: documents
            });
        }
    });
});

//get single document
app.get('/portfolio/document/:id', (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('single_document', {
            document: document
        });
    });
});

//load edit form
app.get('/portfolio/document/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('edit_document', {
            document: document
        });
    });
});

//update submit POST route
app.post('/portfolio/document/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    let document = {};
    document.document_type = req.body.document_type;
    document.title = req.body.title;
    document.author = req.body.author.split(",");
    document.created_at = req.body.created_at;
    document.description = req.body.description;
    document.tag = req.body.tag;
    //- document.path = req.file.path;
    document.status = req.body.status;
    
    let query = {_id:req.params.id}
    Document.updateOne(query, document, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Document updated');
            res.redirect('/portfolio');
        }
    });
});

//delete document route
app.delete('/portfolio/document/:id', ensureAuthenticated, isAdmin, (req, res) => {
    if(!req.user._id){
        res.status(500).save();
    }
    let query = {_id:req.params.id}

    Document.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

// ---------- STUDENTS ----------
//students home route
app.get('/students', (req, res) => {
    Document.find({ author:{$exists:true} }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('students', {
                documents: documents
            });
        }
    });
});

//----------- NEWS -----------
//news route
app.get('/news', (req, res) => {
    News.find({}, (err, news) => {
        if(err){
            console.log(err);
        } else {
            res.render('news', {
                news: news
            });
        }
    });
});

// load edit form
app.get('/news/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    News.findById(req.params.id, (err, singleNew) => {
        res.render('edit_news', {
            singleNew: singleNew
        });
    });
});

//delete news route
app.delete('/news/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    if(!req.user._id){
        res.status(500).save();
    }
    let query = {_id:req.params.id}

    News.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

//update news route
app.post('/news/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    let news = {};
    news.title = req.body.title;
    news.date = req.body.date;
    news.description = req.body.description;
    
    let query = {_id:req.params.id}

    News.updateOne(query, news, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Document updated');
            res.redirect('/news');
        }
    });
});

//------------ SERVICES ------------
//get services route
app.get('/services', (req, res) => {
    Services.find({}, (err, services) => {
        if(err){
            console.log(err);
        } else {
            res.render('services', {
                services: services
            });
        }
    });
});

// load edit form
app.get('/services/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    Services.findById(req.params.id, (err, service) => {
        res.render('edit_services', {
            service: service
        });
    });
});

//update services route
app.post('/services/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    let services = {};
    services.title = req.body.title;
    services.description = req.body.description;
    
    let query = {_id:req.params.id}
    
    Services.updateOne(query, services, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Service updated');
            res.redirect('/services');
        }
    });
});

//delete services route
app.delete('/services/edit/:id', ensureAuthenticated, isAdmin, (req, res) => {
    if(!req.user._id){
        res.status(500).save();
    }
    let query = {_id:req.params.id}

    Services.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

//------------ ABOUT ---------------
app.get('/about', (req, res) => {
    res.render('about');
});

//------------- SERVER -------------
//start server
https.createServer(options, app).listen(30000, () => {
    console.log('Server listening on port 30000');
});