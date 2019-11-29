const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Document = require('../models/document');

//---------- PORTFOLIO ----------------
//portfolio home route
router.get('/', (req, res) => {
    Document.find({ status: true }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('portfolio', {
                documents: documents
            });
        }
    });
});

//get single document
router.get('/document/:id', (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('single_document', {
            document: document
        });
    });
});

//load edit form
router.get('/document/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    Document.findById(req.params.id, (err, document) => {
        res.render('edit_document', {
            document: document
        });
    });
});

//update submit POST route
router.post('/document/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    helper.upload(req, res, (err) => {
        if(err){
            console.log(err);
            req.flash('danger', 'File upload failed!');
            return;
        } else {
            let document = {};
            document.document_type = req.body.document_type;
            document.title = req.body.title;
            document.author = req.body.author.split(",");
            document.created_at = req.body.created_at;
            document.description = req.body.description;
            document.tag = req.body.tag;
            //console.log(req.files.path);
            document.path = req.files.path;
            document.status = req.body.status;
            let query = {_id:req.params.id}
            Document.updateOne(query, document, (err) => {
                if(err){
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Document updated');
                    res.redirect('/portfolio');
                }
            });
        }
    })
});

//delete document route
router.delete('/document/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    if(!req.user._id){
        res.status(500).save();
    }
    let query = {_id:req.params.id}

    Document.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

module.exports = router;