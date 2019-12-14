const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Document = require('../models/document');


//---------- PORTFOLIO ----------------
//portfolio home route
router.get('/', async (req, res) => {
    try {
        await Document.find({ status: true }, (err, documents) => {
            res.render('portfolio', {
                documents: documents
            });    
        }).lean();
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

async function getPortfolioPages(pageNr, startIndex){
    router.get('/' + pageNr, (req, res) => {
        try {
            Document.find({ status: true }, (err, documents) => {
                res.render('portfolio', {
                    documents: documents
                });    
            }).limit(3).skip(startIndex);
        } catch(err){
            console.log(err);
            res.render('error');
        }
    });
}

getPortfolioPages(1,0)
getPortfolioPages(2,2)
getPortfolioPages(3,5)
//perPage = collection.items.length / 3 
//for c in colLen
//pageNr++

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
    try{
        Document.findById(req.params.id, (err, document) => {
            res.render('edit_document', {
                document: document
            });
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

//update submit POST route
router.post('/document/edit/:id', helper.ensureAuthenticated, helper.isAdmin, async (req, res) => {
    try{
        await helper.upload(req, res, async (err) => {
            if(err){
                console.log(err);
                req.flash('danger', 'File upload failed!');
                return;
            } else {
                let document = {};
                document.document_type = req.body.document_type;
                document.title = req.body.title;
                document.author = req.body.author.split(",");
                document.documentCreated_at = req.body.documentCreated_at;
                document.description = req.body.description;
                document.tag = req.body.tag;
                document.path = req.files;
                document.status = req.body.status;
                
                console.log(req.files);
                
                let query = {_id:req.params.id}
                await Document.updateOne(query, document, (err) => {
                    req.flash('success', 'Document updated');
                    res.redirect('/portfolio');
                });
            }
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
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