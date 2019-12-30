const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//---------- TEKSTIIL ----------------
//tekstiil home route
router.get('/', async (req, res) => {
    await Document.find({ status: true, tag: 'Tekstiil' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('tekstiil', {
                documents: documents
            });
        }
    }).lean();
});

module.exports = router;