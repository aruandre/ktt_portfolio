const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//---------- METALL ----------------
//metall home route
router.get('/', (req, res) => {
    Document.find({ status: true, tag: 'Metall' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('metall', {
                documents: documents
            });
        }
    });
});

module.exports = router;