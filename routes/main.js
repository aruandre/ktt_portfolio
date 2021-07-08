const router = require('express').Router()

//---------- HOME ----------
router.get('/', (req, res) => {
    res.render('index');
});

//---------- KTD ROUTES ------------
let ktd17Route = require('./ktd17');
router.use('/students/ktd17', ktd17Route);

let ktd18Route = require('./ktd18');
router.use('/students/ktd18', ktd18Route);

let ktd19Route = require('./ktd19');
router.use('/students/ktd19', ktd19Route);

let ktdEarlierRoute = require('./ktdEarlier');
router.use('/students/ktd_earlier', ktdEarlierRoute);

//---------- TEKSTIIL ----------------
let tekstiilRoute = require('./tekstiil');
router.use('/portfolio/tekstiil', tekstiilRoute);

//---------- PUIT ----------------
let puitRoute = require('./puit');
router.use('/portfolio/puit', puitRoute);

//---------- METALL ----------------
let metallRoute = require('./metall');
router.use('/portfolio/metall', metallRoute);

//---------- PRAKTIKA ----------------
let praktikadRoute = require('./praktikad');
router.use('/portfolio/praktikad', praktikadRoute);

//---------- LÕPUTÖÖ ----------------
let loputoodRoute = require('./loputood');
router.use('/portfolio/loputood', loputoodRoute);

//---------- SEMINARITÖÖ ----------------
let seminaritoodRoute = require('./seminaritood');
router.use('/portfolio/seminaritood', seminaritoodRoute);

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
    res.render('404');
});

module.exports = router;