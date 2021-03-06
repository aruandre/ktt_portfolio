const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//praktikad home route
router.get('/', async (req, res) => {
    await Document.find({ status: true, document_type: 'Praktika' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('praktikad', {
                documents: documents
            });
        }
    }).lean();
});

module.exports = router;