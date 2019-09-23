let express = require('express');
let path = require('path');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');

//db connection
mongoose.connect('mongodb://localhost/portfolio');
let db = mongoose.connection;

//check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
})

//check for db errors
db.on('error', (err) => {
    console.log(err);
})

//init app
const app = express();

//bring in models
let Document = require('./models/document');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
//parse application/json
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

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
app.post('/admin/add', (req, res) => {
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
            res.redirect('/admin');
        }
    });
});

//start server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});