const express = require('express');
const router = express.Router();
let Document = require('../models/document');

//puit home route
router.get('/', async (req, res) => {
    await Document.find({ status: true, tag: 'Puit' }, (err, documents) => {
        if(err){
            console.log(err);
        } else {
            res.render('puit', {
                documents: documents
            });
        }
    }).lean();
});

module.exports = router;