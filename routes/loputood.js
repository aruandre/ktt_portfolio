const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//---------- LÕPUTÖÖD ----------------
//lõputööd home route
router.get('/', (req, res) => {
    Document.find({ status: true, document_type: 'Lõputöö' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('loputood', {
                documents: documents
            });
        }
    });
});

module.exports = router;