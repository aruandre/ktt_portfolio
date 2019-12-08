const mongoose = require('mongoose');

const studentsSchema = mongoose.Schema({
    username:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: false
    },
    role:{
        type: String,
        default: 'basic',
        enum: ['basic', 'admin', 'superadmin']
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpires:{
        type: Date
    },
    firstname:{
        type: String
    },
    lastname:{
        type: String
    },
    personalPortfolio:{
        type: String
    },
    course:{
        type: String
    }
});

studentsSchema.set('timestamps', true);
const Students = module.exports = mongoose.model('Students', studentsSchema);