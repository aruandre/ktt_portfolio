const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let Services = require('../models/services');

//------------ SERVICES ------------
//get services route
router.get('/', async (req, res) => {
    await Services.find({}, (err, services) => {
        if(err){
            console.log(err);
        } else {
            res.render('services', {
                services: services
            });
        }
    }).lean();
});

// load edit form
router.get('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    try{
        Services.findById(req.params.id, (err, service) => {
            res.render('edit_services', {
                service: service
            });
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

//update services route
router.post('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    try{
        let services = {};
        services.title = req.body.title;
        services.description = req.body.description;
        
        let query = {_id:req.params.id}
        
        Services.updateOne(query, services, (err) => {
            req.flash('success', 'Service updated');
            res.redirect('/services');
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
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