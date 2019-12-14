const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//---------- SEMINARITÖÖ ----------------
//seminaritööd home route
router.get('/', async (req, res) => {
    await Document.find({ status: true, document_type: 'Seminaritöö' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('seminaritood', {
                documents: documents
            });
        }
    }).lean();
});

module.exports = router;