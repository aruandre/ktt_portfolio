const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
//const flash = require('connect-flash');
const session = require('express-session');

//db connection
mongoose.connect('mongodb://localhost/portfolio', { useNewUrlParser: true, useUnifiedTopology: true });
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

//bring in models
let Document = require('./models/document');

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


//---- routes ----//
//home route
app.get('/', (req, res) => {
    Document.find({}, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('index', {
                title: 'Portfolio',
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
app.get('/admin', (req, res) => {
    res.render('admin', {
        title: 'Admin page'
    });
});

//add submit POST route
app.post('/admin/add', 
    //TODO fix validation
    // [
    // check('document_type').isEmpty().withMessage('Document type is required'),
    // check('title').isEmpty().withMessage('Document title is required'),
    // check('author').isEmpty().withMessage('Document author is required')
    // ], 
    (req, res) => {
    
    //get errors
    // let errors = validationResult(req);

    // if(!errors.isEmpty()){
    //     res.render('admin', {
    //         errors:errors
    //     });
    // } else {
        let document = new Document();
        document.document_type = req.body.document_type;
        document.title = req.body.title;
        document.author = req.body.author;
        document.created_at = req.body.created_at;
        document.description = req.body.description;
        //document.tag = req.body.tag;
        document.save((err) => {
            if(err){
                console.log(err);
                return;
            } else {
                req.flash('success', 'Document added');
                res.redirect('/admin');
            }
        });
    // }
});

//load edit form
app.get('/document/edit/:id', (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('edit_document', {
            document: document
        });
    });
});

//update submit POST route
app.post('/document/edit/:id', (req, res) => {
    let document = {};
    document.document_type = req.body.document_type;
    document.title = req.body.title;
    document.author = req.body.author;
    document.created_at = req.body.created_at;
    document.description = req.body.description;
    //document.tag = req.body.tag;

    let query = {_id:req.params.id}

    Document.update(query, document, (err) => {
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
app.delete('/document/:id', (req, res) => {
    let query = {_id:req.params.id}

    Document.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

//start server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});