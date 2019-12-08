const express = require('express');
const router = express.Router();
const helper = require('../helper/helper');
let News = require('../models/news');

//----------- NEWS -----------
//news route
router.get('/', (req, res) => {
    News.find({}, (err, news) => {
        if(err){
            console.log(err);
        } else {
            res.render('news', {
                news: news
            });
        }
    }).sort('-date').limit(10);
});

// load edit form
router.get('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    News.findById(req.params.id, (err, singleNew) => {
        res.render('edit_news', {
            singleNew: singleNew
        });
    });
});

//delete news route
router.delete('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    if(!req.user._id){
        res.status(500).save();
    }
    let query = {_id:req.params.id}

    News.deleteOne(query, (err) => {
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

//update news route
router.post('/edit/:id', helper.ensureAuthenticated, helper.isAdmin, (req, res) => {
    try{
        let news = {};
        news.title = req.body.title;
        news.date = req.body.date;
        news.time = req.body.time;
        news.description = req.body.description;
        
        let query = {_id:req.params.id}
        
        News.updateOne(query, news, (err) => {
            req.flash('success', 'Document updated');
            res.redirect('/news');
        });
    } catch(err){
        console.log(err);
        res.render('error');
    }
});

module.exports = router;