const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const { check, validationResult } = require('express-validator');
//const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const bcrypt = require('bcryptjs');
const multer = require('multer');


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
app.use(express.static('./public'));

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
    limits: {fileSize: 10000000}
}).single('fileupload');

//bring in models
let Document = require('./models/document');
let User = require('./models/user');

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

//ACL
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Action not allowed!');
        res.redirect('/');
    }
}

//---- routes ----//
//home route
app.get('/', (req, res) => {
    Document.find({}, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('index', {
                documents: documents
            });
        }
    });
});

//get single document
app.get('/document/:id', (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('single_document', {
            document: document
        });
    });
});

//admin route
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

app.post('/admin/add', ensureAuthenticated, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            console.log(err);
            req.flash('danger', 'File upload failed!');
            return;
        } else {
            new Document({
                document_type: req.body.document_type,
                title: req.body.title,
                author: req.body.author,
                created_at: req.body.created_at,
                description: req.body.description,
                tag: req.body.tag,
                path: req.body.path
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

//load edit form
app.get('/document/edit/:id', ensureAuthenticated, (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('edit_document', {
            document: document
        });
    });
});

//update submit POST route
app.post('/admin/edit/:id', ensureAuthenticated, (req, res) => {
    let document = {};
    document.document_type = req.body.document_type;
    document.title = req.body.title;
    document.author = req.body.author;
    document.created_at = req.body.created_at;
    document.description = req.body.description;
    document.tag = req.body.tag;
    
    let query = {_id:req.params.id}
    
    Document.updateOne(query, document, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Document updated');
            res.redirect('/admin');
        }
    });
});

//delete route
app.delete('/document/:id', ensureAuthenticated, (req, res) => {
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

//register form
app.get('/register', (req, res) => {
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


//get lõputööd route
app.get('/loputood', (req, res) => {
    Document.find({ document_type: 'Muu' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('loputood', {
                documents: documents
            });
        }
    });
});

//TODO search get route

//testing route
app.get('/test', (req, res) => {
    res.render('test');
});

//start server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});