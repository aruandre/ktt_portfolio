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
        cb(null, file.fieldname + new Date().toJSON().slice(0,10) + Date.now() + path.extname(file.originalname));
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

//------------ PAGINATION --------------
function paginatedResults(model){
    return async (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {}

        if(endIndex < await model.countDocuments().exec()){
            results.next = {
                page: page + 1,
                limit: limit        
            }
        }

        if(startIndex > 0){
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        try {
            results.results = await model.find().limit(limit).skip(startIndex).exec();
            next();
        } catch(e) {
            //res.status(500).json({ message: e.message });
            console.log(e);
        }

        res.paginatedResults = results;
        next();
    }
}

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.isAdmin = isAdmin;
module.exports.upload = upload;
module.exports.storage = storage;
module.exports.paginatedResults = paginatedResults;