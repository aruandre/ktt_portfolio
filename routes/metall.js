const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//metall home route
router.get('/', async (req, res) => {
    await Document.find({ status: true, tag: 'Metall' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('metall', {
                documents: documents
            });
        }
    }).lean();
});

module.exports = router;