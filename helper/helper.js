const express = require('express');
const multer = require('multer');
const path = require('path');

//-------------- UPLOAD ----------------
//public folder
express().use(express.static('../public/uploads/'));

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
}).single('fileupload');



//------------- ENSURE AUTH -----------------
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Action not allowed!');
        res.redirect('/');
    }
}

//------------- ENSURE ADMIN ----------------
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

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.isAdmin = isAdmin;
module.exports.upload = upload;
module.exports.storage = storage;