const router = require('express').Router()

//---------- HOME ----------
router.get('/', (req, res) => {
    res.render('index');
});

//---------- PRAKTIKA ----------------
let tekstiilRoute = require('./tekstiil');
router.use('/tekstiil', tekstiilRoute);

//---------- PRAKTIKA ----------------
let puitRoute = require('./puit');
router.use('/puit', puitRoute);

//---------- PRAKTIKA ----------------
let metallRoute = require('./metall');
router.use('/metall', metallRoute);

//---------- PRAKTIKA ----------------
let praktikadRoute = require('./praktikad');
router.use('/praktikad', praktikadRoute);

//---------- SEMINARITÖÖ ----------------
let loputoodRoute = require('./loputood');
router.use('/loputood', loputoodRoute);

//---------- SEMINARITÖÖ ----------------
let seminaritoodRoute = require('./seminaritood');
router.use('/seminaritood', seminaritoodRoute);

//------------ FORGOT --------------
let forgotRoute = require('./forgot');
router.use('/forgot', forgotRoute);

//------------ RESET --------------
let resetRoute = require('./reset');
router.use('/reset', resetRoute);

//------------ LOGIN --------------
let loginRoute = require('./login');
router.use('/login', loginRoute);

//----------- LOGOUT ---------------
let logoutRoute = require('./logout');
router.use('/logout', logoutRoute);

//----------- ADMIN ---------------
let adminRoute = require('./admin');
router.use('/admin', adminRoute);

//---------- PROFILE -------------
let profileRoute = require('./profile');
router.use('/profile', profileRoute);

//---------- PORTFOLIO ----------------
let portfolioRoute = require('./portfolio');
router.use('/portfolio', portfolioRoute);

// ---------- STUDENTS ----------
let studentsRoute = require('./students');
router.use('/students', studentsRoute);

//------------ NEWS ----------------
let newsRoute = require('./news');
router.use('/news', newsRoute);

//------------ SERVICES ----------------
let servicesRoute = require('./services');
router.use('/services', servicesRoute);

//------------ ABOUT ---------------
let aboutRoute = require('./about');
router.use('/about', aboutRoute);

//------------ CONTACT ---------------
let contactsRoute = require('./contacts');
router.use('/contacts', contactsRoute);

//route to error page
router.get('*', (req, res) => {
    res.render('error');
});

module.exports = router;