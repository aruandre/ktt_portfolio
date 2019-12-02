const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//---------- PUIT ----------------
//puit home route
router.get('/', (req, res) => {
    Document.find({ status: true, tag: 'Puit' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('puit', {
                documents: documents
            });
        }
    });
});

module.exports = router;