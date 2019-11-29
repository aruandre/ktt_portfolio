const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const fs = require('fs');
const https = require('https');
const morgan = require('morgan');

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

//---------- HOME ----------
app.get('/', (req, res) => {
    res.render('index');
});

//------------ FORGOT --------------
let forgotRoute = require('./routes/forgot');
app.use('/forgot', forgotRoute);

//------------ RESET --------------
let resetRoute = require('./routes/reset');
app.use('/reset', resetRoute);

//------------ LOGIN --------------
let loginRoute = require('./routes/login');
app.use('/login', loginRoute);

//----------- LOGOUT ---------------
let logoutRoute = require('./routes/logout');
app.use('/logout', logoutRoute);

//----------- ADMIN ---------------
let adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

//---------- PROFILE -------------
let profileRoute = require('./routes/profile');
app.use('/profile', profileRoute);

//---------- PORTFOLIO ----------------
let portfolioRoute = require('./routes/portfolio');
app.use('/portfolio', portfolioRoute);

// ---------- STUDENTS ----------
let studentsRoute = require('./routes/students');
app.use('/students', studentsRoute);

//------------ NEWS ----------------
let newsRoute = require('./routes/news');
app.use('/news', newsRoute);

//------------ SERVICES ----------------
let servicesRoute = require('./routes/services');
app.use('/services', servicesRoute);

//------------ ABOUT ---------------
let aboutRoute = require('./routes/about');
app.use('/about', aboutRoute);

//------------ CONTACT ---------------
let contactsRoute = require('./routes/contacts');
app.use('/contacts', contactsRoute);

//route to error page
app.get('*', (req, res) => {
    res.render('error');
});


//---------- START SERVER -------------
https.createServer(options, app).listen(30000, () => {
    console.log('Server listening on port 30000');
});