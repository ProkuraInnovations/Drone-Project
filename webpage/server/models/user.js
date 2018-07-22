// schema for users
// external libraries/modules
const mongoose = require('mongoose');

// creating schema
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true, //removes leading and trailing spaces
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    location: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    noOfUsers: {
        type: Number,
        required: true,
        trim: true,
        minlength:1
    },
    tokens: [{
        access: {
            type: String,
            // required: true
        },
        token: {
            type: String,
            // required: true
        }
    }]
});

// some middleware for authentication and tokenizing

// creating model with Schema
var User = mongoose.model('User', UserSchema);

module.exports = {User};
