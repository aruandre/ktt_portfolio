let mongoose = require('mongoose');
let moment = require('moment');
require('moment/locale/et');

let mongooseRedisCache = require("mongoose-redis-cache");

mongooseRedisCache(mongoose, {
    host: "127.0.0.1",
    port: "6379"
});

//document schema
let documentSchema = mongoose.Schema({
    document_type:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    author:[{
        type: String,
        trim: true,
        required: true
    }],
    documentCreated_at:{
        type: String,
        default: () => moment().locale('et').format("dd.MM.YYYY")
    },
    description:{
        type: String
    },
    tag:{
        type: Array
    },
    status:{
        type: Boolean,
        default: false,
        //required: true
    },
    path:{
        type: String,
        required: false
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
});

documentSchema.set('redisCache', true);
documentSchema.set('timestamps', true);

mongooseRedisCache(mongoose);

let Document = module.exports = mongoose.model('Document', documentSchema);