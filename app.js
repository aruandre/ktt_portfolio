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
    limits: {fileSize: 10000000}, //10MB
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if(ext !== '.png' || ext !== '.jpg' || ext !== '.jpeg' || ext !== '.pdf'){
            req.flash('danger', 'File type not allowed!');
        }
        cb(null, true)
    }
}).single('fileupload');

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

//ACL
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Action not allowed!');
        res.redirect('/');
    }
}


//------- ROUTES -------
//home route
app.get('/', (req, res) => {
    res.render('index');
});


//------------- REGISTER -------------
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

//add news route
app.post('/admin/addNews', ensureAuthenticated, (req, res) => {
    new News({
        title: req.body.title,
        date: req.body.date,
        description: req.body.description,
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
app.post('/admin/addService', ensureAuthenticated, (req, res) => {
    new Services({
        title: req.body.title,
        date: req.body.date,
        description: req.body.description,
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

//---------- PORTFOLIO ----------------
//portfolio home route
app.get('/portfolio', (req, res) => {
    Document.find({}, (err, documents) => {
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
app.get('/portfolio/document/edit/:id', ensureAuthenticated, (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('edit_document', {
            document: document
        });
    });
});

//update submit POST route
app.post('/portfolio/document/edit/:id', ensureAuthenticated, (req, res) => {
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
            res.redirect('/portfolio');
        }
    });
});

//delete document route
app.delete('/portfolio/document/:id', ensureAuthenticated, (req, res) => {
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


//----------- TEST -----------
//get lõputööd route
// app.get('/loputood', (req, res) => {
//     Document.find({ document_type: 'Muu' }, (err, documents) => {
//         if(err){
//             console.log(err);
//         } else {
//             res.render('loputood', {
//                 documents: documents
//             });
//         }
//     });
// });


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
app.get('/news/edit/:id', ensureAuthenticated, (req, res) => {
    News.findById(req.params.id, (err, singleNew) => {
        res.render('edit_news', {
            singleNew: singleNew
        });
    });
});

//delete news route
app.delete('/news/:id', ensureAuthenticated, (req, res) => {
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
app.post('/news/edit/:id', ensureAuthenticated, (req, res) => {
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
app.get('/services/edit/:id', ensureAuthenticated, (req, res) => {
    Services.findById(req.params.id, (err, service) => {
        res.render('edit_services', {
            service: service
        });
    });
});

//update services route
app.post('/services/edit/:id', ensureAuthenticated, (req, res) => {
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
app.delete('/services/edit/:id', ensureAuthenticated, (req, res) => {
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
app.listen(30000, () => {
    console.log('Server listening on port 30000');
});