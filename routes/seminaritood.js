const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Document = require('../models/document');

//---------- SEMINARITÖÖ ----------------
//seminaritööd home route
router.get('/', (req, res) => {
    Document.find({ status: true, document_type: 'Seminaritöö' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('seminaritood', {
                documents: documents
            });
        }
    });
});

module.exports = router;