const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Services = require('../models/services');


//------------ SERVICES ------------
//get services route
router.get('/', (req, res) => {
    Services.find({}, (err, services) => {
        if(err){
            console.log(err);
        } else {
            res.render('services', {
                services: services
            });
        }
    });
});

// load edit form
router.get('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    Services.findById(req.params.id, (err, service) => {
        res.render('edit_services', {
            service: service
        });
    });
});

//update services route
router.post('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    let services = {};
    services.title = req.body.title;
    services.description = req.body.description;
    
    let query = {_id:req.params.id}
    
    Services.updateOne(query, services, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Service updated');
            res.redirect('/services');
        }
    });
});

//delete services route
router.delete('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    if(!req.user._id){
        res.status(500).save();
    }
    let query = {_id:req.params.id}

    Services.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

module.exports = router;