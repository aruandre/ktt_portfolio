const RateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

const BruteForce = new RateLimit({
        store: new MongoStore({
            uri: 'mongodb://localhost:27017/portfolio',
            collectionName: 'expressRateRecords'
        }),
        max: 5, //requests
        windowMs: 15 * 60 * 1000, //15min
        onLimitReached: function(req, res){
            req.flash('danger', 'Too many failed login attempts! Please try again in 15 minutes.');
        }
    });

module.exports.BruteForce = BruteForce;