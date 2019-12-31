const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const fs = require('fs');
const morgan = require('morgan');
const helperDb = require('./helper/db');
const spdy = require('spdy');
const helmet = require('helmet')

require('dotenv').config();

//SSL & http/2
let key = fs.readFileSync(__dirname + '/certs/cert.key');
let cert = fs.readFileSync(__dirname + '/certs/cert.crt');
let options = {
    key: key,
    cert: cert,
    spdy: {
        protocols: [ 'h2', 'spdy/3.1', 'http/1.1' ],
        plain: false
    }
};

//db connection
helperDb.dbConn();

//init app
const app = express();

//setup helmet
app.use(helmet({
    //contentSecurityPolicy: true,
    crossdomain: true,
    //featurepolicy
    referrerPolicy: true
}));

//logger
let logDir = path.join(__dirname, 'log');
fs.existsSync(logDir) || fs.mkdirSync(logDir);
let accessLogStream = fs.createWriteStream(logDir + '/accesslog' + '-' + new Date().toJSON().slice(0,10) + '-' + Date.now() + '.log',{ path: logDir });
//setup the logger 
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
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // minimize risk of XSS attacks by restricting the client from reading the cookie
        secure: true, // only send cookie over https
        maxAge: 60000 * 60 * 24 // set cookie expiry length in ms
    }
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

//------------ MAIN ROUTE ---------------
let mainRoute = require('./routes/main');
app.use(mainRoute);

//---------- START SERVER -------------
spdy.createServer(options, app).listen(443, () => {
    console.log('Server listening on port 443');
});