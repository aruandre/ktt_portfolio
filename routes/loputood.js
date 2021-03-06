const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//lõputööd home route
router.get('/', async (req, res) => {
    await Document.find({ status: true, document_type: 'Lõputöö' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('loputood', {
                documents: documents
            });
        }
    }).lean();
});

module.exports = router;