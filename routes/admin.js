const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Document = require('../models/document');
let News = require('../models/news');
let Services = require('../models/services');
let Students = require('../models/students');
const bcrypt = require('bcryptjs');

//----------- ADMIN ---------------
router.get('/', helper.ensureAuthenticated, (req, res) => {
    res.render('admin', {
    });
});

// app.post('/add', ensureAuthenticated,
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
router.post('/addDocument', helper.ensureAuthenticated, (req, res, next) => {
    helper.upload(req, res, (err) => {
        if(err){
            console.log(err);
            req.flash('danger', 'File upload failed!');
            return;
        } else {
            new Document({
                document_type: req.body.document_type,
                title: req.body.title,
                author: req.body.author.split(","),
                created_at: req.body.created_at,
                description: req.body.description,
                tag: req.body.tag,
                path: req.file.path.replace(/\\/g, "/").substring('public'.length),
                //path: req.files.path,
                status: req.body.status
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

//admin add news route
router.post('/addNews', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
        new News({
            title: req.body.title,
            date: req.body.date,
            description: req.body.description
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
router.post('/addService', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    new Services({
        title: req.body.title,
        date: req.body.date,
        description: req.body.description
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

//admin get unpublished documents
router.get('/unpublished', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    Document.find({ status: false }, (err, documents) => {
        if(err){
            console.log(err);
        } else {    
            res.render('unpublished', {
                documents: documents
            });
        }
    });
});

//load edit form
router.get('/unpublished/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('edit_unpublished', {
            document: document
        });
    });
});

//route to /admin/unpublished/edit/:id
router.post('/unpublished/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    let document = {};
    document.document_type = req.body.document_type;
    document.title = req.body.title;
    document.author = req.body.author.split(",");
    document.created_at = req.body.created_at;
    document.description = req.body.description;
    document.tag = req.body.tag;
    //- document.path = req.file.path;
    document.status = req.body.status;
    
    let query = {_id:req.params.id}
    Document.updateOne(query, document, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Document published');
            res.redirect('/admin/unpublished');
        }
    });
});

//register process
router.post('/addUser', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const role = req.body.role;
    const username = req.body.username;
    const email = req.body.email;
    const personalPortfolio = req.body.personalPortfolio;
    const course = req.body.course;
    const password = req.body.password;
    const confirm = req.body.confirm;

    let newStudent = new Students({
        firstname: firstname,
        lastname: lastname,
        role: role,
        username: username,
        email: email,
        personalPortfolio: personalPortfolio,
        course: course,
        password: password,
        confirm: confirm
    });
    
    //TODO check if user exists

    // if(password == '' || confirm == ''){
    //     req.flash('danger', 'Password can not be empty');
    // }
    // if(password !== confirm){
    //     req.flash('danger', 'Passwords do not match');
    // }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newStudent.password, salt, (err, hash) => {
            if(err){
                console.log(err);
            }
            newStudent.password = hash;
            newStudent.save((err) => {
                if(err){
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Student added');
                    res.redirect('/admin');
                }
            });
        });
    });
});

module.exports = router;