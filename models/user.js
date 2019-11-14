const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: false
    },
    role:{
        type: String,
        default: 'basic',
        enum: ['basic', 'admin', 'superadmin']
    }
});

const User = module.exports = mongoose.model('User', UserSchema);