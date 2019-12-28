const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
const bcrypt = require('bcryptjs');
let News = require('../models/news');
let Document = require('../models/document');
let Services = require('../models/services');
let Students = require('../models/students');
const { check, validationResult } = require('express-validator');

//----------- ADMIN ---------------
router.get('/', helper.ensureAuthenticated, (req, res) => {
    res.render('admin', {
    });
});

//add documents route
router.post('/addDocument', helper.ensureAuthenticated, (req, res, next) => {
    try{
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
                    documentCreated_at: req.body.documentCreated_at,
                    description: req.body.description,
                    tag: req.body.tag,
                    //path: req.file.path.replace(/\\/g, "/").substring('public'.length),
                    path: req.files.path,
                    status: req.body.status
                }).save((err, doc) => {
                    console.log(req);
                    req.flash('success', 'Document added');
                    res.redirect('/admin');
                });
            }
        });
    } catch(err){
        console.log(err);
        console.log(req);
        req.flash('danger', 'Data save failed!');
    }
});

//admin add news route
router.post('/addNews', helper.ensureAuthenticated, helper.isAdmin, [
    check('title').notEmpty()
    ], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('danger', 'Title can not be empty!');
        res.render('admin');
        return;
    } else {
        new News({
            title: req.body.title,
            date: req.body.date,
            time: req.body.time,
            description: req.body.description
        }).save((err, news) => {
            console.log(req);
            req.flash('success', 'News added');
            res.redirect('/admin');
        });
    }
});

//admin add services route
router.post('/addService', helper.ensureAuthenticated, helper.isAdmin, [
    check('title').notEmpty()
    ], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('danger', 'Title can not be empty!');
        res.render('admin');
        return;
    } else {
        new Services({
            title: req.body.title,
            date: req.body.date,
            description: req.body.description
        }).save((err, news) => {
            console.log(req);
            req.flash('success', 'New service added');
            res.redirect('/admin');
        });
    }
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
    }).lean();
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
    try{
        let document = {};
        document.document_type = req.body.document_type;
        document.title = req.body.title;
        // document.author = req.body.author.split(",");
        document.author = req.body.author;
        document.documentCreated_at = req.body.documentCreated_at;
        document.description = req.body.description;
        document.tag = req.body.tag;
        document.path = req.files.path;
        document.status = req.body.status;
        
        let query = {_id:req.params.id}
        Document.updateOne(query, document, (err) => {
            req.flash('success', 'Document published');
            res.redirect('/admin/unpublished');
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

//register process
router.post('/addUser', helper.ensureAuthenticated, helper.isAdmin, [
    check('username').notEmpty(),
    check('password').notEmpty(),
    check('email').notEmpty()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('danger', 'Username, password and email are required!');
        res.render('admin');
        return;
    } else {
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
    }
});

module.exports = router;